-- ============================================================
-- PREPX IQ – Single Setup SQL
-- Run this ONCE in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- 1. Drop old table (removes all old data – skip this line if you want to keep data)
DROP TABLE IF EXISTS registrations CASCADE;

-- 2. Create registrations table (simple – only what the form collects)
CREATE TABLE registrations (
  id                 BIGSERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  father_name        TEXT,
  gender             TEXT,
  current_class      TEXT,
  mobile_number      TEXT,
  email_address      TEXT,
  course_program     TEXT,
  batch_class_timing TEXT,
  registration_date  DATE DEFAULT CURRENT_DATE,
  declaration_agreed BOOLEAN DEFAULT FALSE,
  status             TEXT DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX idx_reg_mobile  ON registrations(mobile_number);
CREATE INDEX idx_reg_status  ON registrations(status);
CREATE INDEX idx_reg_created ON registrations(created_at);

-- 4. Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies – anyone can register, no auth required
DROP POLICY IF EXISTS "public_insert" ON registrations;
CREATE POLICY "public_insert" ON registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (name IS NOT NULL AND name <> '');

DROP POLICY IF EXISTS "public_select" ON registrations;
CREATE POLICY "public_select" ON registrations
  FOR SELECT TO anon, authenticated
  USING (true);
