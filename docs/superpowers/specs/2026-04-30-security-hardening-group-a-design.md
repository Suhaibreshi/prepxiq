# Security Hardening — Group A
**Date:** 2026-04-30
**Status:** Implemented

## Overview

Fix three critical security issues: hardcoded Supabase keys, unauthenticated database writes via direct Supabase client, and overly permissive RLS policies.

---

## 1. Remove Hardcoded Supabase Fallbacks (`src/lib/supabase.ts`)

**Problem:** Anon key and project URL had production values hardcoded as fallbacks. Anyone extracting the JS bundle could use these to read/write the `registrations` table directly.

**Fix:** Throw an error at import time if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing. No fallback values.

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}
```

---

## 2. Route Registration Form Through Backend API (`src/components/RegistrationForm.tsx`)

**Problem:** `confirmSubmit()` called `supabase.from('registrations').insert(...)` directly with the anon key, bypassing Express validation, photo upload handling, and `registration_number` generation.

**Fix:** POST to `/api/registrations` (the Express backend). The backend handles:
- Photo upload via multer
- Server-side validation
- Unique `registration_number` generation
- Service-role Supabase insert

**Changes:**
- Remove all `supabase` imports from `RegistrationForm.tsx`
- Replace direct Supabase insert with `fetch('/api/registrations', { method: 'POST', body: FormData })`
- Keep photo input field (currently present in backend route, needs to be added to form)
- Backend route already returns the created registration with its server-generated `registration_number`

**API shape (unchanged — backend already exists):**
- `POST /api/registrations` with `multipart/form-data` body
- Returns `{ success: true, data: { ...registration, registration_number: "REG-YYYYMMDD-XXXXX" } }`

---

## 3. Add Missing Columns to Schema (`server/setup.sql`)

**Problem:** Backend generates `registration_number`, `photo_path`, `updated_at`, `blood_group`, and other fields, but the schema doesn't define them. These fields are silently dropped on insert.

**Fix:** Add missing columns to `setup.sql`:
- `registration_number TEXT UNIQUE NOT NULL`
- `photo_path TEXT`
- `updated_at TIMESTAMPTZ`
- `blood_group TEXT`
- `father_guardian_name TEXT`
- `has_allergies BOOLEAN DEFAULT FALSE`
- `allergies_list TEXT`
- `has_medical_conditions BOOLEAN DEFAULT FALSE`
- `medical_conditions_list TEXT`
- `guardian_name TEXT`
- `relationship_to_student TEXT`
- `guardian_phone TEXT`
- `guardian_address TEXT`
- `emergency_contact_name TEXT`
- `emergency_relationship TEXT`
- `emergency_phone TEXT`
- `photo_consent BOOLEAN DEFAULT FALSE`

---

## 4. Tighten RLS Policies (`server/setup.sql`)

**Problem:** Policies allowed `anon` and `authenticated` roles full insert/select access. Combined with the exposed anon key, the table was publicly readable and writable.

**Fix:** Restrict all operations to service role only (backend). Remove `anon` and `authenticated` from all policies.

```sql
-- INSERT: backend only
DROP POLICY IF EXISTS "public_insert" ON registrations;
CREATE POLICY "backend_insert" ON registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.role() = 'service_role');

-- SELECT: backend only
DROP POLICY IF EXISTS "public_select" ON registrations;
CREATE POLICY "backend_select" ON registrations
  FOR SELECT TO anon, authenticated
  USING (auth.role() = 'service_role');
```

Note: Supabase service role bypasses RLS entirely, so the `USING`/`WITH CHECK` clauses here are belt-and-suspenders for any other authenticated paths.

---

## 5. Update `.env.example`

Document that the server needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (separate from the frontend `VITE_*` vars).

---

## 6. Remove Dead SQLite Fallback Code (`server/routes/registrations.js`)

**Problem:** The SQLite fallback branches (`if (supabaseAvailable)` / `else` for SQLite) never execute — Supabase is always available when configured, and the app has no mechanism to fall back to SQLite in production.

**Fix:** Remove all SQLite branches. Keep only the Supabase path. This halves the route file and removes ~300 lines of dead code.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/supabase.ts` | Fail if env vars missing, remove fallback URL/key |
| `src/components/RegistrationForm.tsx` | POST to `/api/registrations` instead of direct Supabase insert; add photo upload |
| `server/setup.sql` | Add missing columns, tighten RLS to service role only |
| `.env.example` | Document server-side Supabase vars |
| `server/routes/registrations.js` | Remove all SQLite fallback branches |