# PREPX IQ Admin Panel — Design Spec

## Overview

Dedicated admin panel at `/admin` with separate username/password auth, allowing PREPX IQ staff to manage student registrations, view stats, export data, and manage courses.

---

## Architecture

### Stack
- **Frontend**: React + TypeScript, same Vite/Tailwind stack as main app
- **Backend**: Express.js, same server, new route group
- **Database**: Supabase (PostgreSQL), same connection as main app
- **Auth**: Session-based, admin credentials in `admin_users` table

### File Structure

```
src/admin/
  pages/
    LoginPage.tsx        # /admin/login
    DashboardPage.tsx     # /admin
    RegistrationsPage.tsx # /admin/registrations
    CoursesPage.tsx      # /admin/courses
  components/
    AdminLayout.tsx       # Sidebar + header wrapper
    StatsCard.tsx
    RegistrationTable.tsx
    RegistrationDetailModal.tsx
    CourseForm.tsx
  api/
    adminApi.ts           # Fetch wrapper with auth headers

server/
  middleware/
    adminAuth.js          # Session validation middleware
  routes/
    adminAuth.js          # POST /admin/login, POST /admin/logout, GET /admin/me
    adminDashboard.js     # GET /admin/api/stats, GET /admin/api/registrations
    adminCourses.js       # GET/POST/PUT /admin/api/courses
```

### Route Mapping

| Route | File | Description |
|-------|------|-------------|
| GET /admin | Dashboard | Stats overview |
| GET /admin/login | Login | Admin login form |
| GET /admin/registrations | Registrations | Student list |
| GET /admin/courses | Courses | Course management |
| POST /admin/login | Server | Authenticate admin |
| POST /admin/logout | Server | Clear session |
| GET /admin/api/stats | Server | Dashboard numbers |
| GET /admin/api/registrations | Server | List/filter registrations |
| GET /admin/api/registrations/:id | Server | Single registration |
| PUT /admin/api/registrations/:id/status | Server | Approve/reject/waitlist |
| GET /admin/api/courses | Server | List courses |
| POST /admin/api/courses | Server | Add course |
| PUT /admin/api/courses/:id | Server | Update course |
| DELETE /admin/api/courses/:id | Server | Delete course |

---

## Data Model

### admin_users table
```sql
CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### courses table (new)
```sql
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,       -- Foundation, Science, Arts, Commerce, Competitive
  program TEXT NOT NULL,        -- 6th Class, 11th PCM, JEE, etc.
  batch_timing TEXT,            -- Morning, Evening, Weekend
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Registrations table already exists from `server/setup.sql`. No schema changes needed.

---

## Admin Auth

### Login Flow
1. Admin submits username + password to `POST /admin/login`
2. Server bcrypt-compares against stored hash
3. On success, returns `{ token: "<jwt>" }` stored in localStorage
4. All subsequent API calls include `Authorization: Bearer <token>` header

### Middleware (adminAuth.js)
- Validates token on every `/admin/api/*` route
- Returns 401 if missing/invalid
- Attaches `req.adminUser` with admin id and username

---

## Pages

### 1. Login Page (`/admin/login`)
- Centered card with PREPX IQ logo
- Username field, password field, submit button
- Error message on failed attempt
- Redirect to `/admin` if already logged in

### 2. Dashboard (`/admin`)
- 4 stat cards in a row: Total Registrations, Pending, Approved, Rejected
- Each card: icon, number, label, subtle background color
- "Review Pending" button → links to registrations page with `?status=pending` filter
- Quick stats: registrations this month, last month comparison

### 3. Registrations (`/admin/registrations`)
**Table columns:**
| Column | Content |
|--------|---------|
| Reg Number | REG-YYYYMMDD-XXXXX |
| Name | Student full name |
| Course | course_program value |
| Date | registration_date |
| Status | Badge (pending=amber, approved=green, rejected=red, waitlisted=gray) |
| Actions | View button → opens modal |

**Filters (top of page):**
- Search input (searches name, reg number, mobile)
- Status dropdown (All, Pending, Approved, Rejected, Waitlisted)
- Course dropdown (from courses table)
- Date range (from / to)

**Detail Modal:**
- Student photo (if uploaded)
- All registration fields displayed
- Current status badge
- Action buttons: Approve / Reject / Waitlist
- Confirm via inline "Confirm?" prompt (not a separate dialog)

**Status change:**
1. Admin clicks action button
2. Button shows "Confirm?" inline — click again to confirm
3. API call to update status
4. Email triggered to student (approved/rejected only)
5. UI updates immediately

### 4. Courses (`/admin/courses`)
**Table columns:**
| Column | Content |
|--------|---------|
| Category | Foundation, Science, etc. |
| Program | 6th Class, 11th PCM, etc. |
| Timing | Morning, Evening |
| Status | Active/Inactive |
| Actions | Edit, Delete |

**Add/Edit form (slide-over or modal):**
- Category field
- Program field
- Batch timing field
- Active toggle

---

## Email Notifications

Triggered server-side when status changes to `approved` or `rejected`.

**Approved email:**
```
To: student email
Subject: Your PREPX IQ Registration is Approved
Body: Congratulations [Name], your registration ([Reg Number]) for [Course]
has been approved. Welcome to PREPX IQ! Batch timing: [timing]
```

**Rejected email:**
```
To: student email
Subject: Your PREPX IQ Registration Update
Body: Dear [Name], your registration ([Reg Number]) could not be approved
at this time. Please contact us at hello@prepxiq.com for more information.
```

Email via Nodemailer (replaces Twilio SMS for email — simpler setup). If student has no email in record, skip.

---

## Security

- bcrypt password hashing (cost factor 10)
- JWT session token, 24h expiry
- Auth middleware on all `/admin/api/*` routes
- Login rate limit: 5 attempts per 15 minutes per IP (in-memory counter)
- No registration data exposed to client beyond what's needed for display

---

## Exports

**CSV Export** — available on Registrations page:
- Button: "Export CSV"
- Downloads all filtered results (or all if no filter applied)
- Columns match table columns
- Filename: `prepxiq-registrations-YYYY-MM-DD.csv`

**PDF Export** — already exists at `GET /api/registrations/:id/pdf`, accessible to admin via existing route.

---

## Initial Admin Setup

First admin user created via seed script or manual SQL insert:
```sql
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$...'); -- bcrypt hash of desired password
```

---

## Future Additions (out of scope for v1)

- Bulk approve/reject with checkboxes
- Parent portal
- Attendance tracking
- Payment management
- Advanced analytics charts