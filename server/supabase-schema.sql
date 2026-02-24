-- Run this SQL in your Supabase SQL Editor to create the registrations table

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id BIGSERIAL PRIMARY KEY,
  registration_number TEXT UNIQUE NOT NULL,
  registration_date DATE NOT NULL,
  name TEXT NOT NULL,
  father_guardian_name TEXT,
  gender TEXT,
  current_class TEXT,
  mobile_number TEXT,
  email_address TEXT,
  course_program TEXT,
  batch_class_timing TEXT,
  guardian_name TEXT,
  relationship_to_student TEXT,
  guardian_phone TEXT,
  guardian_address TEXT,
  emergency_contact_name TEXT,
  emergency_relationship TEXT,
  emergency_phone TEXT,
  has_allergies BOOLEAN DEFAULT FALSE,
  allergies_list TEXT,
  has_medical_conditions BOOLEAN DEFAULT FALSE,
  medical_conditions_list TEXT,
  blood_group TEXT,
  photo_consent BOOLEAN DEFAULT FALSE,
  declaration_agreed BOOLEAN DEFAULT FALSE,
  photo_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_registration_number ON registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_mobile_number ON registrations(mobile_number);
CREATE INDEX IF NOT EXISTS idx_email ON registrations(email_address);
CREATE INDEX IF NOT EXISTS idx_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON registrations(created_at);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
-- For development/demo purposes, we'll allow all operations
-- In production, you should restrict these policies based on your auth requirements

-- Allow anonymous insert (for registration form)
CREATE POLICY "Allow anonymous insert" ON registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous select (for viewing registrations)
CREATE POLICY "Allow anonymous select" ON registrations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous update (for updating registrations)
CREATE POLICY "Allow anonymous update" ON registrations
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous delete (for deleting registrations)
CREATE POLICY "Allow anonymous delete" ON registrations
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Optional: Create a view for statistics
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'waitlisted') as waitlisted,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today,
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month
FROM registrations;
