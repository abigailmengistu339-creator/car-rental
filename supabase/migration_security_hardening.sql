-- ============================================
-- SECURITY HARDENING MIGRATION
-- Run this in your Supabase SQL Editor to apply
-- all backend security fixes from the audit.
-- ============================================
-- Date: 2026-09-22
-- Findings Addressed: SEC-01, SEC-02

-- =============================================
-- PHASE 1: Tighten RLS on profiles table
-- (SEC-01: Prevent anonymous PII scraping)
-- =============================================

-- Drop old public policies
DROP POLICY IF EXISTS "Allow public read on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public insert on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public update on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public delete on profiles" ON profiles;

-- Create authenticated-only policies
CREATE POLICY "Allow authenticated read on profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete on profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- PHASE 1: Tighten RLS on vehicles table
-- =============================================

DROP POLICY IF EXISTS "Allow public read on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow public insert on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow public update on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow public delete on vehicles" ON vehicles;

CREATE POLICY "Allow authenticated read on vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete on vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- PHASE 2: Make documents bucket PRIVATE
-- (SEC-02: Prevent anonymous document access)
-- =============================================

UPDATE storage.buckets
SET public = false
WHERE id = 'documents';

-- Drop old public storage policies
DROP POLICY IF EXISTS "Allow public upload to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update in documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from documents" ON storage.objects;

-- Create authenticated-only storage policies
CREATE POLICY "Allow authenticated upload to documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated read from documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated update in documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated delete from documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- =============================================
-- VERIFICATION: Run these queries to confirm
-- =============================================
-- SELECT policyname, roles FROM pg_policies WHERE tablename = 'profiles';
-- SELECT policyname, roles FROM pg_policies WHERE tablename = 'vehicles';
-- SELECT public FROM storage.buckets WHERE id = 'documents';
