-- Migration: create users table for student login
-- Default password for new users is their phone number (hashed with bcrypt)
-- Users can only log in after admin approval (is_approved = true)

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  registration_id BIGINT REFERENCES registrations(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_registration_id_idx ON users(registration_id);