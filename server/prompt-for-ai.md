# PROMPT TO GIVE TO CLAUDE CODE (OR ANY AI)

---

## DATABASE SCHEMA

**Table: registrations**
```sql
CREATE TABLE registrations (
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
```

**Indexes:**
- idx_registration_number ON registrations(registration_number)
- idx_mobile_number ON registrations(mobile_number)
- idx_email ON registrations(email_address)
- idx_status ON registrations(status)
- idx_created_at ON registrations(created_at)

**Trigger Function: update_updated_at_column()**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
```

**Trigger:**
- update_registrations_updated_at (BEFORE UPDATE ON registrations)

**View: registration_stats**
```sql
CREATE VIEW registration_stats AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'waitlisted') as waitlisted,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today,
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month
FROM registrations;
```

**Current RLS Policies (on registrations table):**
- Allow anonymous insert (INSERT to anon, authenticated with CHECK true)
- Allow authenticated select (SELECT to authenticated)
- Allow authenticated update (UPDATE to authenticated)
- No DELETE policy

---

## SECURITY ISSUES TO FIX

1. **security_definer_view**: View `registration_stats` has SECURITY DEFINER property - remove it
2. **function_search_path_mutable**: Function `update_updated_at_column` needs secure search_path
3. **rls_policy_always_true**: RLS policies use USING(true) or WITH CHECK(true)

---

## REQUIREMENTS FOR YOUR SQL

Create a **SINGLE** SQL query that:
1. Drops and recreates `registration_stats` view WITHOUT SECURITY DEFINER
2. Updates `update_updated_at_column()` function with `SET search_path = public`
3. Drops and recreates all RLS policies on `registrations` table properly
4. Handles existing objects gracefully (use DROP ... IF EXISTS or CASCADE)
5. Does NOT error out if objects already exist or don't exist

The SQL should run successfully in one go without errors.

---

## THE PROMPT TO SEND:

```
Create a single PostgreSQL SQL query that fixes all security issues in my Supabase database. 

My database schema:

Table: registrations
- id BIGSERIAL PRIMARY KEY
- registration_number TEXT UNIQUE NOT NULL
- registration_date DATE NOT NULL
- name TEXT NOT NULL
- father_guardian_name TEXT
- gender TEXT
- current_class TEXT
- mobile_number TEXT
- email_address TEXT
- course_program TEXT
- batch_class_timing TEXT
- guardian_name TEXT
- relationship_to_student TEXT
- guardian_phone TEXT
- guardian_address TEXT
- emergency_contact_name TEXT
- emergency_relationship TEXT
- emergency_phone TEXT
- has_allergies BOOLEAN DEFAULT FALSE
- allergies_list TEXT
- has_medical_conditions BOOLEAN DEFAULT FALSE
- medical_conditions_list TEXT
- blood_group TEXT
- photo_consent BOOLEAN DEFAULT FALSE
- declaration_agreed BOOLEAN DEFAULT FALSE
- photo_path TEXT
- status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted'))
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

Function: update_updated_at_column() - trigger function that sets updated_at
View: registration_stats - shows COUNT statistics with status filters

RLS is enabled on registrations table with these policies:
- Allow anonymous insert (INSERT to anon, authenticated WITH CHECK true)
- Allow authenticated select (SELECT to authenticated)
- Allow authenticated update (UPDATE to authenticated)
- No DELETE policy

I need you to create ONE single SQL query that:
1. Fixes the registration_stats view - remove SECURITY DEFINER (should use SECURITY INVOKER/default)
2. Fixes the update_updated_at_column function - add SET search_path = public
3. Fixes RLS policies - handle the USING(true) and WITH CHECK(true) warnings properly
4. Uses DROP ... IF EXISTS or CASCADE to handle existing objects without errors

Write the complete SQL query that I can run in Supabase SQL Editor in one go.
```
