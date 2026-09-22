// ============================================
// Custom Hook: Vehicle Management & Document Engine
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase, USE_MOCK_DATA } from '../lib/supabase';
import {
  mockVehicles,
  saveMockVehicles,
  getMockVehiclesWithDrivers,
  getMockVehiclesByCategory,
  getMockVehiclesByDriverId,
  getMockVehicleById,
} from '../lib/mock-data';
import type { Vehicle, VehicleWithDriver } from '../lib/types';
import { ModelCategory } from '../lib/types';

export function useVehicles(categoryFilter?: ModelCategory) {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (USE_MOCK_DATA) {
      const data = categoryFilter
        ? getMockVehiclesByCategory(categoryFilter)
        : getMockVehiclesWithDrivers();
      setVehicles(data);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          driver:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (categoryFilter) {
        query = query.eq('model_category', categoryFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setVehicles(data as VehicleWithDriver[]);
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local vehicles:', err);
      const data = categoryFilter
        ? getMockVehiclesByCategory(categoryFilter)
        : getMockVehiclesWithDrivers();
      setVehicles(data);
      setError('Failed to load vehicles from Supabase');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchVehicles();

    // Listen for custom storage updates (e.g. document uploaded)
    const handleStorageUpdate = () => {
      fetchVehicles();
    };

    window.addEventListener('fleet_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('fleet_storage_update', handleStorageUpdate);
    };
  }, [fetchVehicles]);

  return { vehicles, loading, error, refetch: fetchVehicles };
}

export function useVehicle(id?: string) {
  const [vehicle, setVehicle] = useState<VehicleWithDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!id) {
      setVehicle(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (USE_MOCK_DATA) {
      const found = getMockVehicleById(id);
      setVehicle(found || null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select(`
          *,
          driver:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setVehicle(data as VehicleWithDriver);
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local vehicle:', err);
      const found = getMockVehicleById(id);
      setVehicle(found || null);
      setError('Failed to load vehicle from Supabase');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();

    const handleStorageUpdate = () => {
      fetchVehicle();
    };

    window.addEventListener('fleet_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('fleet_storage_update', handleStorageUpdate);
    };
  }, [fetchVehicle]);

  return { vehicle, loading, error, refetch: fetchVehicle };
}

export function useDriverVehicles(driverId?: string) {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    if (!driverId) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (USE_MOCK_DATA) {
      const data = getMockVehiclesByDriverId(driverId);
      setVehicles(data);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select(`
          *,
          driver:profiles(*)
        `)
        .eq('driver_id', driverId);

      if (fetchError) throw fetchError;
      setVehicles(data as VehicleWithDriver[]);
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local driver vehicles:', err);
      const data = getMockVehiclesByDriverId(driverId);
      setVehicles(data);
      setError('Failed to load driver vehicles from Supabase');
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchVehicles();

    const handleStorageUpdate = () => {
      fetchVehicles();
    };

    window.addEventListener('fleet_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('fleet_storage_update', handleStorageUpdate);
    };
  }, [fetchVehicles]);

  return { vehicles, loading, error, refetch: fetchVehicles };
}

export function useCreateVehicle() {
  const [loading, setLoading] = useState(false);

  const createVehicle = async (data: {
    plate_number: string;
    model_category: ModelCategory;
    driver_id: string | null;
    current_location: string;
    libre_document_url: string | null;
    insurance_document_url: string | null;
  }): Promise<Vehicle | null> => {
    setLoading(true);

    if (USE_MOCK_DATA) {
      const newVehicle: Vehicle = {
        id: `v${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      };
      saveMockVehicles([newVehicle, ...mockVehicles]);
      setLoading(false);
      return newVehicle;
    }

    try {
      const { data: created, error } = await supabase
        .from('vehicles')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      window.dispatchEvent(new Event('fleet_storage_update'));
      return created;
    } catch (err) {
      if (!USE_MOCK_DATA) {
        // In production mode, surface the actual error (e.g. RLS 403) instead of silently saving locally
        throw err;
      }
      console.warn('Supabase vehicle creation failed, saving locally:', err);
      const newVehicle: Vehicle = {
        id: `v${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      };
      saveMockVehicles([newVehicle, ...mockVehicles]);
      return newVehicle;
    } finally {
      setLoading(false);
    }
  };

  return { createVehicle, loading };
}

export function useUpdateVehicle() {
  const [loading, setLoading] = useState(false);

  const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<boolean> => {
    setLoading(true);

    if (USE_MOCK_DATA) {
      const idx = mockVehicles.findIndex((v) => v.id === id);
      if (idx !== -1) {
        const updated = [...mockVehicles];
        updated[idx] = { ...updated[idx], ...data };
        saveMockVehicles(updated);
      }
      setLoading(false);
      return true;
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .update(data)
        .eq('id', id);
      if (error) throw error;

      // Also update local cache
      const idx = mockVehicles.findIndex((v) => v.id === id);
      if (idx !== -1) {
        const updated = [...mockVehicles];
        updated[idx] = { ...updated[idx], ...data };
        saveMockVehicles(updated);
      }

      window.dispatchEvent(new Event('fleet_storage_update'));
      return true;
    } catch (err) {
      if (!USE_MOCK_DATA) {
        throw err;
      }
      console.warn('Supabase update failed, updating locally:', err);
      const idx = mockVehicles.findIndex((v) => v.id === id);
      if (idx !== -1) {
        const updated = [...mockVehicles];
        updated[idx] = { ...updated[idx], ...data };
        saveMockVehicles(updated);
      }
      window.dispatchEvent(new Event('fleet_storage_update'));
      return true;
    } finally {
      setLoading(false);
    }
  };

  return { updateVehicle, loading };
}

export function useDeleteVehicle() {
  const [loading, setLoading] = useState(false);

  const deleteVehicle = async (id: string): Promise<boolean> => {
    setLoading(true);

    if (USE_MOCK_DATA) {
      const updated = mockVehicles.filter((v) => v.id !== id);
      saveMockVehicles(updated);
      window.dispatchEvent(new Event('fleet_storage_update'));
      setLoading(false);
      return true;
    }

    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;

      const updated = mockVehicles.filter((v) => v.id !== id);
      saveMockVehicles(updated);
      window.dispatchEvent(new Event('fleet_storage_update'));
      return true;
    } catch (err) {
      if (!USE_MOCK_DATA) {
        throw err;
      }
      console.warn('Supabase delete failed, deleting locally:', err);
      const updated = mockVehicles.filter((v) => v.id !== id);
      saveMockVehicles(updated);
      window.dispatchEvent(new Event('fleet_storage_update'));
      return true;
    } finally {
      setLoading(false);
    }
  };

  return { deleteVehicle, loading };
}

// Convert File to Base64 Data URL helper
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Allowed document MIME types (blocks SVG, HTML, executables)
const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Sanitize uploaded file names to prevent path traversal and special character injection
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function useUploadDocument() {
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async (
    vehicleId: string,
    file: File,
    docType: 'libre' | 'insurance'
  ): Promise<string | null> => {
    // SEC-04: Validate file type
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      throw new Error(
        `File type "${file.type || 'unknown'}" is not allowed. Please upload PDF, JPEG, PNG, WebP, or GIF files only.`
      );
    }

    // Validate file size
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(
        `File size (${formatFileSize(file.size)}) exceeds the 10 MB limit.`
      );
    }

    setUploading(true);

    const sanitizedName = sanitizeFileName(file.name);
    const nowFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const fileSizeStr = formatFileSize(file.size);

    if (USE_MOCK_DATA) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const idx = mockVehicles.findIndex((v) => v.id === vehicleId);

        if (idx !== -1) {
          const updated = [...mockVehicles];
          if (docType === 'libre') {
            updated[idx] = {
              ...updated[idx],
              libre_document_url: dataUrl,
              libre_file_name: sanitizedName,
              libre_file_size: fileSizeStr,
              libre_upload_date: nowFormatted,
            };
          } else {
            updated[idx] = {
              ...updated[idx],
              insurance_document_url: dataUrl,
              insurance_file_name: sanitizedName,
              insurance_file_size: fileSizeStr,
              insurance_upload_date: nowFormatted,
              insurance_expiry_days: 365,
            };
          }
          saveMockVehicles(updated);
        }

        setUploading(false);
        return dataUrl;
      } catch (e) {
        console.error('Error reading local file:', e);
        setUploading(false);
        return null;
      }
    }

    try {
      // SEC-04: Use sanitized file name to prevent path traversal
      const filePath = `${vehicleId}/${docType}/${Date.now()}_${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      // SEC-02: Use signed URLs instead of public URLs for sensitive documents
      const { data: urlData, error: signError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 900); // 15 minutes validity

      const publicUrl = signError ? filePath : (urlData?.signedUrl || filePath);

      // Update the vehicle record with document metadata
      const updateField = docType === 'libre' ? 'libre_document_url' : 'insurance_document_url';
      const nameField = docType === 'libre' ? 'libre_file_name' : 'insurance_file_name';
      const sizeField = docType === 'libre' ? 'libre_file_size' : 'insurance_file_size';
      const dateField = docType === 'libre' ? 'libre_upload_date' : 'insurance_upload_date';

      await supabase
        .from('vehicles')
        .update({
          [updateField]: publicUrl,
          [nameField]: sanitizedName,
          [sizeField]: fileSizeStr,
          [dateField]: nowFormatted,
        })
        .eq('id', vehicleId);

      // Also update local state
      const idx = mockVehicles.findIndex((v) => v.id === vehicleId);
      if (idx !== -1) {
        const updated = [...mockVehicles];
        if (docType === 'libre') {
          updated[idx] = {
            ...updated[idx],
            libre_document_url: publicUrl,
            libre_file_name: sanitizedName,
            libre_file_size: fileSizeStr,
            libre_upload_date: nowFormatted,
          };
        } else {
          updated[idx] = {
            ...updated[idx],
            insurance_document_url: publicUrl,
            insurance_file_name: sanitizedName,
            insurance_file_size: fileSizeStr,
            insurance_upload_date: nowFormatted,
            insurance_expiry_days: 365,
          };
        }
        saveMockVehicles(updated);
      }

      setUploading(false);
      return publicUrl;
    } catch (err) {
      console.warn('Supabase upload failed, saving to persistent local storage:', err);
      try {
        const dataUrl = await fileToDataUrl(file);
        const idx = mockVehicles.findIndex((v) => v.id === vehicleId);
        if (idx !== -1) {
          const updated = [...mockVehicles];
          if (docType === 'libre') {
            updated[idx] = {
              ...updated[idx],
              libre_document_url: dataUrl,
              libre_file_name: file.name,
              libre_file_size: fileSizeStr,
              libre_upload_date: nowFormatted,
            };
          } else {
            updated[idx] = {
              ...updated[idx],
              insurance_document_url: dataUrl,
              insurance_file_name: file.name,
              insurance_file_size: fileSizeStr,
              insurance_upload_date: nowFormatted,
              insurance_expiry_days: 365,
            };
          }
          saveMockVehicles(updated);
        }
        setUploading(false);
        return dataUrl;
      } catch (localErr) {
        console.error('Failed both remote and local upload:', localErr);
        setUploading(false);
        return null;
      }
    }
  };

  const deleteDocument = async (
    vehicleId: string,
    docType: 'libre' | 'insurance'
  ): Promise<boolean> => {
    // Delete in local storage
    const idx = mockVehicles.findIndex((v) => v.id === vehicleId);
    if (idx !== -1) {
      const updated = [...mockVehicles];
      if (docType === 'libre') {
        updated[idx] = {
          ...updated[idx],
          libre_document_url: null,
          libre_file_name: undefined,
          libre_file_size: undefined,
          libre_upload_date: undefined,
        };
      } else {
        updated[idx] = {
          ...updated[idx],
          insurance_document_url: null,
          insurance_file_name: undefined,
          insurance_file_size: undefined,
          insurance_upload_date: undefined,
          insurance_expiry_days: 0,
        };
      }
      saveMockVehicles(updated);
    }

    if (!USE_MOCK_DATA) {
      try {
        const updateField = docType === 'libre' ? 'libre_document_url' : 'insurance_document_url';
        await supabase
          .from('vehicles')
          .update({ [updateField]: null })
          .eq('id', vehicleId);
      } catch (err) {
        console.warn('Failed to delete on Supabase DB:', err);
      }
    }

    return true;
  };

  return { uploadDocument, deleteDocument, uploading };
}
