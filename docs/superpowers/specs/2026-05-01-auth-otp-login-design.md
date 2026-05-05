# Auth System — OTP Login + Dashboard
**Date:** 2026-05-01
**Status:** Implemented

## Overview

Build a phone/OTP authentication system: a login page that sends OTP via the existing backend, an OTP verification page, a simple dashboard for authenticated users, and proper `AuthContext` wiring.

---

## Routing

```
/login       → LoginPage    (phone entry)
/verify-otp  → OtpPage      (6-digit OTP entry)
/dashboard   → DashboardPage (authenticated shell)
```

All routes use `react-router-dom` v6. Unauthenticated access to `/dashboard` redirects to `/login`.

---

## LoginPage (`/login`)

**UI:**
- PREP X IQ header/branding (matching existing app style)
- Phone input: +91 prefix + 10-digit mobile field
- Channel toggle: WhatsApp / SMS (pill toggle)
- "Send OTP" button
- Error message display
- Link: "Remember password? Login here" (placeholder, no-op for now)

**Flow:**
1. User enters phone (validated: exactly 10 digits)
2. Clicks "Send OTP"
3. POST `/api/send-otp` with `{ phone, channel }`
4. On success → navigate to `/verify-otp?phone=<phone>`
5. On failure → show error message below form

---

## OtpPage (`/verify-otp`)

**UI:**
- Back link → `/login`
- Phone display: "OTP sent to +91 XXXXX XXXXX" (last 5 digits shown)
- 6 individual digit input boxes (auto-advance on input)
- 5:00 countdown timer (mm:ss format)
- "Resend OTP" link (disabled until timer expires, then links back to send-otp)
- "Verify OTP" button

**Flow:**
1. On mount, read `phone` from query params
2. User enters 6 digits (auto-focus next box on input)
3. When all 6 entered, "Verify OTP" becomes active
4. POST `/api/verify-otp` with `{ phone, otp }`
5. On success → store returned token in `AuthContext`, redirect to `/dashboard`
6. On failure → show inline error "Invalid OTP", clear boxes, refocus first box

**Timer expiry:** When countdown hits 0, show "Resend OTP" as active link.

---

## DashboardPage (`/dashboard`)

**UI (empty shell):**
- Navbar with logo + logout button
- Welcome message: "Welcome, +91 XXXXX XXXXX" (phone from AuthContext)
- Centered empty state: icon + "Your dashboard is being built" + "Come back soon"
- Consistent page wrapper matching rest of app

---

## AuthContext (`src/auth/AuthContext.tsx`)

**State:**
- `token: string | null` — JWT or demo token from backend
- `phone: string | null` — last authenticated phone
- `isAuthenticated: boolean` — derived from !!token

**Persisted:** `token` and `phone` in `localStorage` (read on init)

**Methods:**
```ts
sendOtp(phone: string, channel: 'whatsapp' | 'sms'): Promise<{ ok: boolean; message?: string }>
  → POST /api/send-otp { phone, channel }

verifyOtp(phone: string, otp: string): Promise<{ ok: boolean; token?: string; message?: string }>
  → POST /api/verify-otp { phone, otp }
  → on success: store token + phone, return { ok: true }

logout(): void
  → clear token + phone, redirect to /login
```

---

## Navbar Update (`src/components/Navbar.tsx`)

- Show "Login" button when `!isAuthenticated` (links to `/login`)
- Show phone + "Logout" when `isAuthenticated`
- Existing Register button unchanged

---

## Dependencies

- `react-router-dom` v6 (add to package.json)

---

## Files

| File | Change |
|------|--------|
| `src/auth/AuthContext.tsx` | Wire sendOtp/verifyOtp to backend; add logout |
| `src/App.tsx` | Add BrowserRouter + routes |
| `src/pages/LoginPage.tsx` | New — phone entry + send OTP |
| `src/pages/OtpPage.tsx` | New — 6-digit OTP + verify |
| `src/pages/DashboardPage.tsx` | New — authenticated shell |
| `src/components/Navbar.tsx` | Add login/logout state |
| `package.json` | Add react-router-dom |
| `server/index.js` | Add `auth: true` to cors() for credentials |