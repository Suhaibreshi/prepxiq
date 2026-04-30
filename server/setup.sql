-- ============================================================
-- PREPX IQ – Single Setup SQL
-- Run this ONCE in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- 1. Drop old table (removes all old data – skip this line if you want to keep data)
DROP TABLE IF EXISTS registrations CASCADE;

-- 2. Create registrations table
CREATE TABLE registrations (
  id                       BIGSERIAL PRIMARY KEY,
  registration_number      TEXT UNIQUE NOT NULL,
  registration_date        DATE DEFAULT CURRENT_DATE,

  -- Student info
  name                     TEXT NOT NULL,
  father_guardian_name     TEXT,
  gender                   TEXT,
  current_class            TEXT,
  blood_group              TEXT,
  mobile_number            TEXT,
  email_address            TEXT,
  course_program           TEXT,
  batch_class_timing       TEXT,

  -- Guardian info
  guardian_name            TEXT,
  relationship_to_student TEXT,
  guardian_phone           TEXT,
  guardian_address         TEXT,

  -- Emergency contact
  emergency_contact_name   TEXT,
  emergency_relationship   TEXT,
  emergency_phone          TEXT,

  -- Medical
  has_allergies            BOOLEAN DEFAULT FALSE,
  allergies_list           TEXT,
  has_medical_conditions   BOOLEAN DEFAULT FALSE,
  medical_conditions_list  TEXT,

  -- Photo & consent
  photo_path               TEXT,
  photo_consent            BOOLEAN DEFAULT FALSE,

  -- Declaration & status
  declaration_agreed      BOOLEAN DEFAULT FALSE,
  status                   TEXT DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  updated_at               TIMESTAMPTZ DEFAULT NOW(),
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX idx_reg_mobile          ON registrations(mobile_number);
CREATE INDEX idx_reg_status          ON registrations(status);
CREATE INDEX idx_reg_created         ON registrations(created_at);
CREATE INDEX idx_reg_number          ON registrations(registration_number);

-- 4. Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies – service role only (backend); anon/authenticated cannot read or write
DROP POLICY IF EXISTS "public_insert" ON registrations;
CREATE POLICY "backend_insert" ON registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "public_select" ON registrations;
CREATE POLICY "backend_select" ON registrations
  FOR SELECT TO anon, authenticated
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "public_update" ON registrations;
CREATE POLICY "backend_update" ON registrations
  FOR UPDATE TO anon, authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "public_delete" ON registrations;
CREATE POLICY "backend_delete" ON registrations
  FOR DELETE TO anon, authenticated
  USING (auth.role() = 'service_role');

-- ============================================================
-- Admin Panel Tables
-- ============================================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  program TEXT NOT NULL,
  batch_timing TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, program)
);

-- Index for courses lookup
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);