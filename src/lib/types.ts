// ============================================
// Type Definitions for Fleet Directory
// ============================================

export enum UserRole {
  Driver = 'Driver',
  Client = 'Client',
  Vendor = 'Vendor',
}

export enum ModelCategory {
  Market76 = '76_Market',
  Market78 = '78_Market',
  Pickup79 = '79_Pickup',
}

export enum OperationalStatus {
  InRoute = 'In Route',
  Available = 'Available',
  Maintenance = 'Maintenance',
}

export const MODEL_CATEGORY_LABELS: Record<ModelCategory, string> = {
  [ModelCategory.Market76]: '76 (Market)',
  [ModelCategory.Market78]: '78 (Market)',
  [ModelCategory.Pickup79]: '79 (Pickup)',
};

// CSS class-based colors that adapt to light/dark via custom properties
export const MODEL_CATEGORY_COLORS: Record<ModelCategory, { bg: string; text: string; border: string }> = {
  [ModelCategory.Market76]: { bg: 'cat-76-bg', text: 'cat-76-text', border: 'cat-76-border' },
  [ModelCategory.Market78]: { bg: 'cat-78-bg', text: 'cat-78-text', border: 'cat-78-border' },
  [ModelCategory.Pickup79]: { bg: 'cat-79-bg', text: 'cat-79-text', border: 'cat-79-border' },
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  [UserRole.Driver]: { bg: 'role-driver-bg', text: 'role-driver-text' },
  [UserRole.Client]: { bg: 'role-client-bg', text: 'role-client-text' },
  [UserRole.Vendor]: { bg: 'role-vendor-bg', text: 'role-vendor-text' },
};

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  created_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string | null;
  model_category: ModelCategory;
  plate_number: string;
  current_location: string;
  libre_document_url: string | null;
  insurance_document_url: string | null;
  operational_status?: OperationalStatus;
  insurance_expiry_days?: number;
  libre_file_name?: string;
  insurance_file_name?: string;
  libre_file_size?: string;
  insurance_file_size?: string;
  libre_upload_date?: string;
  insurance_upload_date?: string;
  created_at: string;
}

export interface VehicleWithDriver extends Vehicle {
  driver: Profile | null;
}
