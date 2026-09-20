// ============================================
// Custom Hook: Profile Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase, USE_MOCK_DATA } from '../lib/supabase';
import {
  mockProfiles,
  saveMockProfiles,
  getMockProfilesByRole,
  getMockProfileById,
} from '../lib/mock-data';
import type { Profile } from '../lib/types';
import { UserRole } from '../lib/types';

export function useProfiles(roleFilter?: UserRole) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (USE_MOCK_DATA) {
      setProfiles(getMockProfilesByRole(roleFilter));
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('profiles').select('*').order('full_name');
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setProfiles(data || []);
    } catch (err) {
      console.warn('Supabase query failed, falling back to local profiles:', err);
      setProfiles(getMockProfilesByRole(roleFilter));
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchProfiles();

    const handleStorageUpdate = () => {
      fetchProfiles();
    };

    window.addEventListener('fleet_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('fleet_storage_update', handleStorageUpdate);
    };
  }, [fetchProfiles]);

  return { profiles, loading, error, refetch: fetchProfiles };
}

export function useProfile(id: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        setProfile(getMockProfileById(id) || null);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setProfile(data);
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local profile:', err);
        setProfile(getMockProfileById(id) || null);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  return { profile, loading, error };
}

export function useCreateProfile() {
  const [loading, setLoading] = useState(false);

  const createProfile = async (data: {
    full_name: string;
    phone_number: string;
    role: UserRole;
  }): Promise<Profile | null> => {
    setLoading(true);

    if (USE_MOCK_DATA) {
      const newProfile: Profile = {
        id: `p${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      };
      saveMockProfiles([newProfile, ...mockProfiles]);
      setLoading(false);
      return newProfile;
    }

    try {
      const { data: created, error } = await supabase
        .from('profiles')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return created;
    } catch (err) {
      console.warn('Supabase profile creation failed, falling back to local save:', err);
      const newProfile: Profile = {
        id: `p${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      };
      saveMockProfiles([newProfile, ...mockProfiles]);
      return newProfile;
    } finally {
      setLoading(false);
    }
  };

  return { createProfile, loading };
}
