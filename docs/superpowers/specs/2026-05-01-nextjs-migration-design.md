# Migration Design: Vite+Express → Next.js

**Date:** 2026-05-01
**Status:** Draft

---

## Overview

Migrate the existing Vite+React frontend and Express backend to Next.js App Router, consolidating both into a single deployment.

---

## Architecture

### Target Stack
- **Framework:** Next.js 14+ (App Router)
- **Auth:** NextAuth.js v5 (Auth.js)
- **Database:** Supabase (unchanged)
- **File Storage:** Local `/public/uploads` (managed by Next.js)
- **Styling:** Tailwind CSS (unchanged)
- **PDF Generation:** pdfkit (kept in lib/)
- **Email:** nodemailer (kept in lib/)

### Project Structure

```
/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public routes group
│   │   ├── page.tsx            # Home/landing page
│   │   ├── login/page.tsx      # User login
│   │   └── verify-otp/page.tsx # OTP verification
│   ├── (protected)/            # Auth-protected user routes
│   │   └── dashboard/page.tsx  # User dashboard
│   ├── admin/                  # Admin section
│   │   ├── (protected)/        # Admin auth-protected
│   │   │   ├── page.tsx        # Admin dashboard
│   │   │   ├── registrations/page.tsx
│   │   │   └── courses/page.tsx
│   │   └── api/               # Admin API routes (Route Handlers)
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── registrations/route.ts
│   │       ├── registrations/[id]/route.ts
│   │       ├── registrations/[id]/status/route.ts
│   │       ├── registrations/[id]/pdf/route.ts
│   │       ├── registrations/stats/summary/route.ts
│   │       ├── courses/route.ts
│   │       ├── dashboard/stats/route.ts
│   │       └── export/route.ts
│   ├── api/                   # Public API routes
│   │   ├── send-otp/route.ts
│   │   ├── verify-otp/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx              # Root layout with providers
│   └── globals.css
├── components/                 # Shared React components
├── lib/                       # Shared utilities
│   ├── auth.ts               # NextAuth config
│   ├── supabase.ts           # Supabase client
│   ├── pdf.ts                # PDF generation (from server/)
│   ├── email.ts              # Email sending (from server/)
│   └── uploads/              # Upload handling utilities
├── public/
│   └── uploads/              # User-uploaded files (photos, pdfs)
└── package.json
```

---

## Component Migration Map

| Current (Vite) | Target (Next.js) |
|----------------|------------------|
| `src/App.tsx` | `app/layout.tsx` + route groups |
| `src/pages/LoginPage.tsx` | `app/(public)/login/page.tsx` |
| `src/pages/OtpPage.tsx` | `app/(public)/verify-otp/page.tsx` |
| `src/pages/DashboardPage.tsx` | `app/(protected)/dashboard/page.tsx` |
| `src/admin/pages/LoginPage.tsx` | `app/admin/(protected)/login/page.tsx` |
| `src/admin/pages/DashboardPage.tsx` | `app/admin/(protected)/page.tsx` |
| `src/admin/pages/RegistrationsPage.tsx` | `app/admin/(protected)/registrations/page.tsx` |
| `src/admin/pages/CoursesPage.tsx` | `app/admin/(protected)/courses/page.tsx` |
| `src/components/*` | `components/*` (mostly unchanged) |
| `src/auth/AuthContext.tsx` | NextAuth.js SessionProvider |

---

## API Route Migration

| Express Route | Next.js Route Handler |
|----------------|------------------------|
| `POST /api/send-otp` | `app/api/send-otp/route.ts` |
| `POST /api/verify-otp` | `app/api/verify-otp/route.ts` |
| `GET /api/health` | `app/api/health/route.ts` |
| `GET /api/registrations` | `app/admin/api/registrations/route.ts` |
| `POST /api/registrations` | `app/admin/api/registrations/route.ts` |
| `GET /api/registrations/:id` | `app/admin/api/registrations/[id]/route.ts` |
| `PUT /api/registrations/:id` | `app/admin/api/registrations/[id]/route.ts` |
| `DELETE /api/registrations/:id` | `app/admin/api/registrations/[id]/route.ts` |
| `PUT /api/registrations/:id/status` | `app/admin/api/registrations/[id]/status/route.ts` |
| `GET /api/registrations/:id/pdf` | `app/admin/api/registrations/[id]/pdf/route.ts` |
| `GET /api/registrations/stats/summary` | `app/admin/api/registrations/stats/summary/route.ts` |
| `POST /admin/auth/login` | NextAuth.js Credentials provider |
| `GET /admin/api/dashboard/stats` | `app/admin/api/dashboard/stats/route.ts` |
| `GET/POST /admin/api/courses` | `app/admin/api/courses/route.ts` |
| `GET /admin/api/export` | `app/admin/api/export/route.ts` |

---

## Authentication Design

### User Auth (OTP Flow)
1. User enters phone → `POST /api/send-otp` → Twilio SMS/WhatsApp or demo mode
2. User enters OTP → `POST /api/verify-otp` → Returns session token
3. NextAuth.js Credentials provider validates token and creates session
4. Session stored in HTTP-only cookie via NextAuth

### Admin Auth
- Separate NextAuth.js instance with Credentials provider
- JWT stored in HTTP-only cookie
- Protected via NextAuth.js `auth()` helper and middleware

### Auth Utilities
- `lib/auth.ts` — NextAuth configuration
- `middleware.ts` — Route protection at edge

---

## File Handling

### Upload Flow
1. Multipart form → Next.js Route Handler
2. Multer processes file (same config as Express)
3. File saved to `public/uploads/photos/` or `public/uploads/pdfs/`
4. Path stored in Supabase

### Serving Uploads
- Files in `public/uploads/` served statically by Next.js
- PDF generation endpoint streams file or returns path

---

## Dependencies to Add

```json
{
  "next": "^15.0.0",
  "next-auth": "^5.0.0-beta.25",
  "@auth/supabase-adapter": "^1.0.0"
}
```

**Keep from current:**
- `@supabase/supabase-js`
- `tailwindcss`
- `lucide-react`
- `bcrypt`, `jsonwebtoken` (for JWT in NextAuth)
- `multer`, `pdfkit`, `nodemailer`
- `twilio`

**Remove:**
- `vite`, `@vitejs/plugin-react`, `react-router-dom`
- `express`, `cors` (replaced by Next.js)

---

## Implementation Phases

### Phase 1: Project Setup
- Initialize Next.js app with Tailwind
- Configure NextAuth.js
- Set up middleware for route protection
- Migrate environment variables

### Phase 2: Public Routes
- Landing page (home)
- Login page
- OTP verification page
- Public API routes (send-otp, verify-otp)

### Phase 3: Protected User Routes
- Dashboard page
- User auth context → NextAuth SessionProvider

### Phase 4: Admin Section
- Admin login page
- Admin dashboard, registrations, courses pages
- All admin API routes

### Phase 5: Cleanup
- Remove old Vite/Express code
- Update package.json
- Test all flows

---

## Key Decisions

1. **Route Groups**: Use `(public)` and `(protected)` to group routes without affecting URL structure
2. **NextAuth Session**: Use database sessions with Supabase adapter for persistent sessions
3. **Server Actions**: Use for mutations that don't need API routes (form submissions)
4. **Multer Alternative**: Consider `@next/multer` or keep using multer in API routes
5. **Admin Separation**: Admin uses `/admin/*` routes with separate auth check in middleware

---

## Out of Scope

- Database schema changes
- New features or UI redesigns
- Vercel-specific optimizations beyond standard Next.js
- Mobile app or other platforms