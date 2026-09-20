-- ============================================
-- Seed Data for Fleet Directory
-- ============================================

-- Insert profiles (Drivers)
INSERT INTO profiles (id, full_name, phone_number, role) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ahmed Benali', '+213 555 0101', 'Driver'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Karim Hadji', '+213 555 0102', 'Driver'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Youcef Mansouri', '+213 555 0103', 'Driver'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Omar Boudiaf', '+213 555 0104', 'Driver'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Rachid Amrani', '+213 555 0105', 'Driver'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Sofiane Khelifi', '+213 555 0106', 'Driver'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'Nabil Cherif', '+213 555 0107', 'Driver'),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'Mourad Belkacem', '+213 555 0108', 'Driver');

-- Insert profiles (Clients)
INSERT INTO profiles (id, full_name, phone_number, role) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'Fatima Zahra', '+213 555 0201', 'Client'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'Djamila Oussedik', '+213 555 0202', 'Client');

-- Insert profiles (Vendors)
INSERT INTO profiles (id, full_name, phone_number, role) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001', 'Auto Parts Alger', '+213 555 0301', 'Vendor'),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'Assurance El Amane', '+213 555 0302', 'Vendor');

-- Insert vehicles (76 Market)
INSERT INTO vehicles (driver_id, model_category, plate_number, current_location, libre_document_url, insurance_document_url) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', '76_Market', '00176-101-16', 'Bab Ezzouar, Algiers', NULL, NULL),
  ('a1b2c3d4-0002-4000-8000-000000000002', '76_Market', '00176-202-16', 'Hussein Dey, Algiers', NULL, NULL),
  ('a1b2c3d4-0003-4000-8000-000000000003', '76_Market', '00176-303-16', 'Kouba, Algiers', NULL, NULL);

-- Insert vehicles (78 Market)
INSERT INTO vehicles (driver_id, model_category, plate_number, current_location, libre_document_url, insurance_document_url) VALUES
  ('a1b2c3d4-0004-4000-8000-000000000004', '78_Market', '00178-101-16', 'Chéraga, Algiers', NULL, NULL),
  ('a1b2c3d4-0005-4000-8000-000000000005', '78_Market', '00178-202-16', 'Dar El Beida, Algiers', NULL, NULL),
  ('a1b2c3d4-0006-4000-8000-000000000006', '78_Market', '00178-303-16', 'Rouiba, Algiers', NULL, NULL);

-- Insert vehicles (79 Pickup)
INSERT INTO vehicles (driver_id, model_category, plate_number, current_location, libre_document_url, insurance_document_url) VALUES
  ('a1b2c3d4-0007-4000-8000-000000000007', '79_Pickup', '00179-101-16', 'Blida City Center', NULL, NULL),
  ('a1b2c3d4-0008-4000-8000-000000000008', '79_Pickup', '00179-202-16', 'Boumerdès Port', NULL, NULL);
