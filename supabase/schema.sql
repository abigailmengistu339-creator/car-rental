-- ============================================
-- Fleet & Contact Management Directory
-- Supabase SQL Schema
-- ============================================

-- 1. Create custom ENUM types
CREATE TYPE user_role AS ENUM ('Driver', 'Client', 'Vendor');
CREATE TYPE model_category AS ENUM ('76_Market', '78_Market', '79_Pickup');

-- 2. Profiles / Users table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'Driver',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Vehicles table
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  model_category model_category NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  current_location TEXT DEFAULT '',
  libre_document_url TEXT,
  insurance_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes for common queries
CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX idx_vehicles_model_category ON vehicles(model_category);
CREATE INDEX idx_profiles_role ON profiles(role);

-- 5. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (MVP: open access — tighten with auth later)
CREATE POLICY "Allow public read on profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Allow public insert on profiles"
  ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on profiles"
  ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on profiles"
  ON profiles FOR DELETE USING (true);

CREATE POLICY "Allow public read on vehicles"
  ON vehicles FOR SELECT USING (true);

CREATE POLICY "Allow public insert on vehicles"
  ON vehicles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on vehicles"
  ON vehicles FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on vehicles"
  ON vehicles FOR DELETE USING (true);

-- 7. Storage bucket for vehicle documents (Libre & Insurance)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow public upload to documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public read from documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Allow public update in documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents');

CREATE POLICY "Allow public delete from documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents');
