-- =============================================================================
-- Fleet Directory — Full Supabase Database Schema & Seed Script
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hybctbkdljvhqschbbfg/sql/new
-- =============================================================================

-- 1. Create custom ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('Driver', 'Client', 'Vendor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE model_category AS ENUM ('76_Market', '78_Market', '79_Pickup');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'Driver',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  model_category model_category NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  current_location TEXT DEFAULT '',
  libre_document_url TEXT,
  insurance_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_model_category ON vehicles(model_category);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DO $$ BEGIN
  CREATE POLICY "Allow public read on profiles" ON profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public insert on profiles" ON profiles FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public update on profiles" ON profiles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public delete on profiles" ON profiles FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public read on vehicles" ON vehicles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public insert on vehicles" ON vehicles FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public update on vehicles" ON vehicles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public delete on vehicles" ON vehicles FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
  CREATE POLICY "Allow public upload to documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public read from documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public update in documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public delete from documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 8. Seed Initial Data (Drivers, Clients, Vendors, Vehicles)
INSERT INTO profiles (id, full_name, phone_number, role) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ahmed Benali', '+213 555 0101', 'Driver'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Karim Hadji', '+213 555 0102', 'Driver'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Youcef Mansouri', '+213 555 0103', 'Driver'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Omar Boudiaf', '+213 555 0104', 'Driver'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Rachid Amrani', '+213 555 0105', 'Driver'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Sofiane Khelifi', '+213 555 0106', 'Driver'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'Nabil Cherif', '+213 555 0107', 'Driver'),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'Mourad Belkacem', '+213 555 0108', 'Driver'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 'Fatima Zahra', '+213 555 0201', 'Client'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'Djamila Oussedik', '+213 555 0202', 'Client'),
  ('c1b2c3d4-0001-4000-8000-000000000001', 'Auto Parts Alger', '+213 555 0301', 'Vendor'),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'Assurance El Amane', '+213 555 0302', 'Vendor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, driver_id, model_category, plate_number, current_location, libre_document_url, insurance_document_url) VALUES
  ('d1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', '76_Market', '00176-101-16', 'Bab Ezzouar, Algiers', NULL, NULL),
  ('d1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0002-4000-8000-000000000002', '76_Market', '00176-202-16', 'Hussein Dey, Algiers', NULL, NULL),
  ('d1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0003-4000-8000-000000000003', '76_Market', '00176-303-16', 'Kouba, Algiers', NULL, NULL),
  ('d1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0004-4000-8000-000000000004', '78_Market', '00178-101-16', 'Chéraga, Algiers', NULL, NULL),
  ('d1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0005-4000-8000-000000000005', '78_Market', '00178-202-16', 'Dar El Beida, Algiers', NULL, NULL),
  ('d1b2c3d4-0006-4000-8000-000000000006', 'a1b2c3d4-0006-4000-8000-000000000006', '78_Market', '00178-303-16', 'Rouiba, Algiers', NULL, NULL),
  ('d1b2c3d4-0007-4000-8000-000000000007', 'a1b2c3d4-0007-4000-8000-000000000007', '79_Pickup', '00179-101-16', 'Blida City Center', NULL, NULL),
  ('d1b2c3d4-0008-4000-8000-000000000008', 'a1b2c3d4-0008-4000-8000-000000000008', '79_Pickup', '00179-202-16', 'Boumerdès Port', NULL, NULL)
ON CONFLICT (plate_number) DO NOTHING;
