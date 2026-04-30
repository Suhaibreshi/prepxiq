# PREPX IQ Admin Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production admin panel at `/admin` with separate auth, managing student registrations, stats, CSV export, and course management.

**Architecture:** Same codebase. New `/admin` route group in Express. JWT-based admin auth with credentials in `admin_users` Supabase table. Admin React pages with sidebar layout, using existing Supabase client.

**Tech Stack:** React 18 + TypeScript (Vite), Express.js, Supabase (PostgreSQL), bcrypt, jsonwebtoken, nodemailer.

---

## File Map

### New Backend Files
- `server/middleware/adminAuth.js` — JWT verification middleware
- `server/routes/adminAuth.js` — POST /admin/login, POST /admin/logout, GET /admin/me
- `server/routes/adminDashboard.js` — GET /admin/api/stats, GET /admin/api/registrations, PUT /admin/api/registrations/:id/status
- `server/routes/adminCourses.js` — GET/POST/PUT/DELETE /admin/api/courses
- `server/routes/adminExport.js` — GET /admin/api/export/csv

### New Frontend Files
- `src/admin/pages/LoginPage.tsx` — /admin/login
- `src/admin/pages/DashboardPage.tsx` — /admin
- `src/admin/pages/RegistrationsPage.tsx` — /admin/registrations
- `src/admin/pages/CoursesPage.tsx` — /admin/courses
- `src/admin/components/AdminLayout.tsx` — Sidebar + header shell
- `src/admin/components/StatsCard.tsx` — Metric card component
- `src/admin/components/RegistrationTable.tsx` — Paginated table
- `src/admin/components/RegistrationDetailModal.tsx` — Student detail modal
- `src/admin/api/adminApi.ts` — Fetch wrapper with auth

### Modified Files
- `server/index.js` — Mount admin routes at `/admin`
- `server/routes/registrations.js` — Add status update + email trigger
- `src/App.tsx` — Add admin routes with ProtectedRoute

---

## Task 1: Admin Auth Backend

**Files:**
- Create: `server/middleware/adminAuth.js`
- Create: `server/routes/adminAuth.js`
- Modify: `server/index.js:1-121` (add admin routes)

- [ ] **Step 1: Create `server/middleware/adminAuth.js`**

```javascript
const jwt = require('jsonwebtoken');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'prepxiq-admin-secret-change-in-production';

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.adminUser = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { adminAuth, ADMIN_JWT_SECRET };
```

- [ ] **Step 2: Create `server/routes/adminAuth.js`**

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const { ADMIN_JWT_SECRET } = require('../middleware/adminAuth');

// Login rate limiting (in-memory)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// POST /admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  // Rate limit check
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `login:${ip}`;
  const record = loginAttempts.get(key);
  const now = Date.now();

  if (record && record.count >= MAX_ATTEMPTS && now < record.resetAt) {
    const waitMs = record.resetAt - now;
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Try again in ${Math.ceil(waitMs / 60000)} minutes.`
    });
  }

  // Fetch admin
  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  if (error || !admin) {
    // Track failed attempt
    if (!record) {
      loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count++;
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatch) {
    if (!record) {
      loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count++;
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Clear rate limit on success
  loginAttempts.delete(key);

  // Generate JWT
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    ADMIN_JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({ success: true, token, username: admin.username });
});

// POST /admin/logout
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out' });
});

// GET /admin/me - Verify token and get admin info
router.get('/me', require('../middleware/adminAuth').adminAuth, (req, res) => {
  return res.json({ success: true, username: req.adminUser.username });
});

module.exports = router;
```

- [ ] **Step 3: Modify `server/index.js` — add admin route import and mount**

Add after line: `const registrationRoutes = require('./routes/registrations');`

```javascript
// Admin Auth Routes
const adminAuthRoutes = require('./routes/adminAuth');
app.use('/admin', adminAuthRoutes);
```

- [ ] **Step 4: Commit**

```bash
git add server/middleware/adminAuth.js server/routes/adminAuth.js server/index.js
git commit -m "feat(admin): add admin auth backend with JWT login"
```

---

## Task 2: Admin Registrations Backend

**Files:**
- Modify: `server/routes/registrations.js:200-231` (add status update endpoint)
- Modify: `server/routes/registrations.js` (add email sending helper)
- Create: `server/routes/adminDashboard.js`

- [ ] **Step 1: Add email helper to `server/routes/registrations.js`**

Add at the top of the file after the supabase require:

```javascript
const nodemailer = require('nodemailer');

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendStatusEmail(registration, newStatus) {
  if (!registration.email_address) return;

  const subject = newStatus === 'approved'
    ? 'Your PREPX IQ Registration is Approved'
    : 'Your PREPX IQ Registration Update';

  const body = newStatus === 'approved'
    ? `Congratulations ${registration.name},\n\nYour registration (${registration.registration_number}) for ${registration.course_program} has been approved. Welcome to PREPX IQ!\n\nBatch timing: ${registration.batch_class_timing || 'To be announced'}\n\nRegards,\nPREPX IQ Team`
    : `Dear ${registration.name},\n\nYour registration (${registration.registration_number}) could not be approved at this time. Please contact us at hello@prepxiq.com for more information.\n\nRegards,\nPREPX IQ Team`;

  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'hello@prepxiq.com',
      to: registration.email_address,
      subject,
      text: body
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Don't fail the status update if email fails
  }
}
```

- [ ] **Step 2: Add status update endpoint to `server/routes/registrations.js`**

Add after the existing PUT route (around line 783, before the DELETE route):

```javascript
// PUT /api/registrations/:id/status - Admin status update
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const validStatuses = ['pending', 'approved', 'rejected', 'waitlisted'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  // Get current registration for email
  const { data: current } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!current) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const { data, error } = await supabase
    .from('registrations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  // Send email on approve or reject
  if (status === 'approved' || status === 'rejected') {
    sendStatusEmail(current, status).catch(console.error);
  }

  return res.json({ success: true, data });
});
```

- [ ] **Step 3: Create `server/routes/adminDashboard.js`**

```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

// All admin dashboard routes require auth
router.use(adminAuth);

// GET /admin/api/stats
router.get('/stats', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('status', { count: 'exact', head: false });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const counts = { total: data.length, pending: 0, approved: 0, rejected: 0, waitlisted: 0 };
  data.forEach(r => {
    if (counts[r.status] !== undefined) counts[r.status]++;
  });

  // Monthly comparison
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthCount = data.filter(r => {
    const d = new Date(r.created_at);
    return d >= thisMonth;
  }).length;

  const lastMonthCount = data.filter(r => {
    const d = new Date(r.created_at);
    return d >= lastMonth && d <= lastMonthEnd;
  }).length;

  return res.json({
    success: true,
    data: {
      ...counts,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount
    }
  });
});

// GET /admin/api/registrations
router.get('/registrations', async (req, res) => {
  const {
    page = '1',
    limit = '20',
    status,
    search,
    course,
    dateFrom,
    dateTo
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (course && course !== 'all') {
    query = query.eq('course_program', course);
  }

  if (dateFrom) {
    query = query.gte('registration_date', dateFrom);
  }

  if (dateTo) {
    query = query.lte('registration_date', dateTo);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({
    success: true,
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum)
    }
  });
});

// GET /admin/api/registrations/:id
router.get('/registrations/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  return res.json({ success: true, data });
});

module.exports = router;
```

- [ ] **Step 4: Add admin dashboard route import to `server/index.js`**

Add after the adminAuthRoutes line:
```javascript
const adminDashboardRoutes = require('./routes/adminDashboard');
app.use('/admin/api', adminDashboardRoutes);
```

- [ ] **Step 5: Commit**

```bash
git add server/routes/registrations.js server/routes/adminDashboard.js server/index.js
git commit -m "feat(admin): registrations backend with status update and email"
```

---

## Task 3: Admin Courses Backend

**Files:**
- Create: `server/routes/adminCourses.js`
- Modify: `server/index.js`

- [ ] **Step 1: Create `server/routes/adminCourses.js`**

```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);

// GET /admin/api/courses
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('category', { ascending: true })
    .order('program', { ascending: true });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({ success: true, data });
});

// POST /admin/api/courses
router.post('/', async (req, res) => {
  const { category, program, batch_timing, is_active = true } = req.body || {};

  if (!category || !program) {
    return res.status(400).json({ success: false, message: 'category and program are required' });
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('category', category)
    .eq('program', program)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ success: false, message: 'Course already exists' });
  }

  const { data, error } = await supabase
    .from('courses')
    .insert([{ category, program, batch_timing, is_active }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({ success: true, data });
});

// PUT /admin/api/courses/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { category, program, batch_timing, is_active } = req.body || {};

  const { data, error } = await supabase
    .from('courses')
    .update({ category, program, batch_timing, is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  if (!data) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  return res.json({ success: true, data });
});

// DELETE /admin/api/courses/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({ success: true });
});

module.exports = router;
```

- [ ] **Step 2: Mount courses route in `server/index.js`**

Add after adminDashboardRoutes:
```javascript
const adminCoursesRoutes = require('./routes/adminCourses');
app.use('/admin/api', adminCoursesRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add server/routes/adminCourses.js server/index.js
git commit -m "feat(admin): courses CRUD backend"
```

---

## Task 4: CSV Export Backend

**Files:**
- Create: `server/routes/adminExport.js`
- Modify: `server/index.js`

- [ ] **Step 1: Create `server/routes/adminExport.js`**

```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);

// GET /admin/api/export/csv
router.get('/csv', async (req, res) => {
  const { status, search, course, dateFrom, dateTo } = req.query;

  let query = supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (course && course !== 'all') {
    query = query.eq('course_program', course);
  }

  if (dateFrom) {
    query = query.gte('registration_date', dateFrom);
  }

  if (dateTo) {
    query = query.lte('registration_date', dateTo);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  // Build CSV
  const headers = [
    'Registration Number', 'Registration Date', 'Name', 'Father/Guardian Name',
    'Gender', 'Current Class', 'Mobile', 'Email', 'Course', 'Batch Timing',
    'Status', 'Created At'
  ];

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(r => [
    escape(r.registration_number),
    escape(r.registration_date),
    escape(r.name),
    escape(r.father_guardian_name),
    escape(r.gender),
    escape(r.current_class),
    escape(r.mobile_number),
    escape(r.email_address),
    escape(r.course_program),
    escape(r.batch_class_timing),
    escape(r.status),
    escape(r.created_at)
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  const dateStr = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="prepxiq-registrations-${dateStr}.csv"`);
  return res.send(csv);
});

module.exports = router;
```

- [ ] **Step 2: Mount export route in `server/index.js`**

```javascript
const adminExportRoutes = require('./routes/adminExport');
app.use('/admin/api', adminExportRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add server/routes/adminExport.js server/index.js
git commit -m "feat(admin): CSV export endpoint"
```

---

## Task 5: Admin Frontend — AdminLayout + LoginPage

**Files:**
- Create: `src/admin/api/adminApi.ts`
- Create: `src/admin/components/AdminLayout.tsx`
- Create: `src/admin/pages/LoginPage.tsx`

- [ ] **Step 1: Create `src/admin/api/adminApi.ts`**

```typescript
const API_BASE = '/admin/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('prepxiq_admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('prepxiq_admin_token');
    localStorage.removeItem('prepxiq_admin_user');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Request failed');
  }

  return json.data;
}

export const adminApi = {
  login: (username: string, password: string) =>
    fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(r => r.json()),

  logout: () =>
    fetch('/admin/logout', { method: 'POST' }),

  getMe: () => request<{ username: string }>('/me'),

  getStats: () => request<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    waitlisted: number;
    thisMonth: number;
    lastMonth: number;
  }>('/stats'),

  getRegistrations: (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    course?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') qs.set(k, String(v));
    });
    return request<{
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/registrations?${qs}`);
  },

  getRegistration: (id: number) =>
    request<any>(`/registrations/${id}`),

  updateStatus: (id: number, status: string) =>
    fetch(`/api/registrations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
      body: JSON.stringify({ status }),
    }).then(r => r.json()),

  getCourses: () => request<any[]>('/courses'),

  createCourse: (data: { category: string; program: string; batch_timing?: string; is_active?: boolean }) =>
    fetch('/admin/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateCourse: (id: number, data: { category: string; program: string; batch_timing?: string; is_active?: boolean }) =>
    fetch(`/admin/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteCourse: (id: number) =>
    fetch(`/admin/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
    }).then(r => r.json()),

  exportCsv: (params: { status?: string; search?: string; course?: string; dateFrom?: string; dateTo?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'all') qs.set(k, String(v));
    });
    const token = localStorage.getItem('prepxiq_admin_token');
    window.open(`/admin/api/export/csv?${qs}`, '_blank');
  },
};
```

- [ ] **Step 2: Create `src/admin/components/AdminLayout.tsx`**

```typescript
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
  { path: '/admin/courses', label: 'Courses', icon: '📚' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('prepxiq_admin_user') || 'Admin';

  const handleLogout = async () => {
    await adminApi.logout();
    localStorage.removeItem('prepxiq_admin_token');
    localStorage.removeItem('prepxiq_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-yellow-400">PREPX IQ</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path
                  ? 'bg-yellow-500 text-gray-900 font-semibold'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2">{username}</div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/admin/pages/LoginPage.tsx`**

```typescript
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminApi.login(username, password);
      if (res.success && res.token) {
        localStorage.setItem('prepxiq_admin_token', res.token);
        localStorage.setItem('prepxiq_admin_user', res.username);
        navigate('/admin');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-yellow-500 rounded-xl mb-4">
            <span className="text-xl font-bold text-gray-900">PREPX IQ</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/admin/api/adminApi.ts src/admin/components/AdminLayout.tsx src/admin/pages/LoginPage.tsx
git commit -m "feat(admin): AdminLayout and LoginPage frontend"
```

---

## Task 6: DashboardPage

**Files:**
- Create: `src/admin/components/StatsCard.tsx`
- Create: `src/admin/pages/DashboardPage.tsx`

- [ ] **Step 1: Create `src/admin/components/StatsCard.tsx`**

```typescript
interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
  bgColor: string;
  textColor?: string;
  subText?: string;
  subTextColor?: string;
}

export default function StatsCard({ label, value, icon, bgColor, textColor = 'text-gray-900', subText, subTextColor = 'text-gray-500' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold ${textColor}`}>{value.toLocaleString()}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        {subText && <div className={`text-xs mt-1 ${subTextColor}`}>{subText}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/admin/pages/DashboardPage.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';
import { adminApi } from '../api/adminApi';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  thisMonth: number;
  lastMonth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </AdminLayout>
    );
  }

  const monthChange = stats && stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)
    : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Registrations"
            value={stats?.total ?? 0}
            icon="👥"
            bgColor="bg-blue-100"
          />
          <StatsCard
            label="Pending Review"
            value={stats?.pending ?? 0}
            icon="⏳"
            bgColor="bg-amber-100"
            textColor="text-amber-700"
          />
          <StatsCard
            label="Approved"
            value={stats?.approved ?? 0}
            icon="✅"
            bgColor="bg-green-100"
            textColor="text-green-700"
          />
          <StatsCard
            label="Rejected"
            value={stats?.rejected ?? 0}
            icon="❌"
            bgColor="bg-red-100"
            textColor="text-red-700"
          />
        </div>

        {/* Quick Actions Row */}
        <div className="flex gap-4 flex-wrap">
          <Link
            to="/admin/registrations?status=pending"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            ⏳ Review {stats?.pending ?? 0} Pending
          </Link>
          <Link
            to="/admin/registrations"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            📋 View All Registrations
          </Link>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.thisMonth ?? 0}</div>
              <div className="text-sm text-gray-500">Registrations this month</div>
            </div>
            {monthChange !== null && (
              <div className={`text-sm font-medium ${parseFloat(monthChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(monthChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(monthChange))}% vs last month
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/admin/components/StatsCard.tsx src/admin/pages/DashboardPage.tsx
git commit -m "feat(admin): Dashboard page with stats cards"
```

---

## Task 7: RegistrationsPage + RegistrationTable + RegistrationDetailModal

**Files:**
- Create: `src/admin/components/RegistrationTable.tsx`
- Create: `src/admin/components/RegistrationDetailModal.tsx`
- Create: `src/admin/pages/RegistrationsPage.tsx`

- [ ] **Step 1: Create `src/admin/components/RegistrationTable.tsx`**

```typescript
interface Registration {
  id: number;
  registration_number: string;
  name: string;
  father_guardian_name: string;
  gender: string;
  current_class: string;
  mobile_number: string;
  email_address: string;
  course_program: string;
  batch_class_timing: string;
  registration_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  created_at: string;
}

interface Props {
  registrations: Registration[];
  loading: boolean;
  onView: (id: number) => void;
  onPageChange: (page: number) => void;
  pagination: { page: number; totalPages: number; total: number };
}

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-gray-100 text-gray-800',
};

export default function RegistrationTable({ registrations, loading, onView, onPageChange, pagination }: Props) {
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (registrations.length === 0) {
    return <div className="text-center py-12 text-gray-500">No registrations found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reg Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Course</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(reg => (
            <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="py-3 px-4 text-sm font-mono text-gray-700">{reg.registration_number}</td>
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900">{reg.name}</div>
                <div className="text-xs text-gray-500">{reg.mobile_number}</div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">{reg.course_program || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {new Date(reg.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status]}`}>
                  {reg.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => onView(reg.id)}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing {registrations.length} of {pagination.total}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-transparent"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/admin/components/RegistrationDetailModal.tsx`**

```typescript
import { useState } from 'react';
import { adminApi } from '../api/adminApi';

interface Registration {
  id: number;
  registration_number: string;
  name: string;
  father_guardian_name: string;
  gender: string;
  current_class: string;
  blood_group: string;
  mobile_number: string;
  email_address: string;
  course_program: string;
  batch_class_timing: string;
  guardian_name: string;
  relationship_to_student: string;
  guardian_phone: string;
  guardian_address: string;
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  has_allergies: boolean;
  allergies_list: string;
  has_medical_conditions: boolean;
  medical_conditions_list: string;
  photo_path: string;
  photo_consent: boolean;
  declaration_agreed: boolean;
  status: string;
  registration_date: string;
  created_at: string;
}

interface Props {
  registration: Registration;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-gray-100 text-gray-800',
};

export default function RegistrationDetailModal({ registration, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState(registration.status);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleStatusAction = async (newStatus: string) => {
    if (confirmAction !== newStatus) {
      setConfirmAction(newStatus);
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const res = await adminApi.updateStatus(registration.id, newStatus);
      if (res.success) {
        setStatus(newStatus);
        setConfirmAction(null);
        onUpdated();
      } else {
        setError(res.message || 'Update failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const fields: [string, string][] = [
    ['Registration Number', registration.registration_number],
    ['Registration Date', new Date(registration.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Full Name', registration.name],
    ["Father's/Guardian Name", registration.father_guardian_name || '—'],
    ['Gender', registration.gender || '—'],
    ['Current Class', registration.current_class || '—'],
    ['Blood Group', registration.blood_group || '—'],
    ['Mobile', registration.mobile_number || '—'],
    ['Email', registration.email_address || '—'],
    ['Course', registration.course_program || '—'],
    ['Batch Timing', registration.batch_class_timing || '—'],
    ['Guardian Name', registration.guardian_name || '—'],
    ['Relationship', registration.relationship_to_student || '—'],
    ['Guardian Phone', registration.guardian_phone || '—'],
    ['Guardian Address', registration.guardian_address || '—'],
    ['Emergency Contact', registration.emergency_contact_name || '—'],
    ['Emergency Phone', registration.emergency_phone || '—'],
    ['Has Allergies', registration.has_allergies ? 'Yes' : 'No'],
    ['Allergies', registration.allergies_list || '—'],
    ['Medical Conditions', registration.has_medical_conditions ? 'Yes' : 'No'],
    ['Conditions List', registration.medical_conditions_list || '—'],
    ['Photo Consent', registration.photo_consent ? 'Yes' : 'No'],
    ['Declaration Agreed', registration.declaration_agreed ? 'Yes' : 'No'],
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registration Details</h2>
            <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>
              {status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo */}
          {registration.photo_path && (
            <div className="flex justify-center">
              <img
                src={`/uploads/photos/${registration.photo_path.split('/').pop()}`}
                alt="Student"
                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
              />
            </div>
          )}

          {/* Fields Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {fields.map(([label, value]) => (
              <div key={label}>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
                <div className="text-sm text-gray-900 font-medium mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          {status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleStatusAction('approved')}
                disabled={updating}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  confirmAction === 'approved'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-100 hover:bg-green-200 text-green-800'
                }`}
              >
                {confirmAction === 'approved' ? '✓ Confirm Approve' : '✓ Approve'}
              </button>
              <button
                onClick={() => handleStatusAction('rejected')}
                disabled={updating}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  confirmAction === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-100 hover:bg-red-200 text-red-800'
                }`}
              >
                {confirmAction === 'rejected' ? '✓ Confirm Reject' : '✗ Reject'}
              </button>
              <button
                onClick={() => handleStatusAction('waitlisted')}
                disabled={updating}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  confirmAction === 'waitlisted'
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {confirmAction === 'waitlisted' ? '✓ Confirm Waitlist' : '⏸ Waitlist'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/admin/pages/RegistrationsPage.tsx`**

```typescript
import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import RegistrationTable from '../components/RegistrationTable';
import RegistrationDetailModal from '../components/RegistrationDetailModal';
import { adminApi } from '../api/adminApi';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedReg, setSelectedReg] = useState<any>(null);

  useEffect(() => {
    loadRegistrations();
  }, [page, statusFilter, courseFilter, search]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    if (statusParam) setStatusFilter(statusParam);
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getRegistrations({
        page,
        limit: 20,
        status: statusFilter,
        course: courseFilter,
        search,
      });
      setRegistrations(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id: number) => {
    setSelectedId(id);
    try {
      const reg = await adminApi.getRegistration(id);
      setSelectedReg(reg);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRegistrations();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, reg number, phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            />
          </form>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
          </select>

          <select
            value={courseFilter}
            onChange={e => { setCourseFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          >
            <option value="">All Courses</option>
            <option value="6th Class">6th Class</option>
            <option value="7th Class">7th Class</option>
            <option value="8th Class">8th Class</option>
            <option value="9th Class">9th Class</option>
            <option value="10th Class">10th Class</option>
            <option value="11th - PCM">11th - PCM</option>
            <option value="11th - PCB">11th - PCB</option>
            <option value="12th - PCM">12th - PCM</option>
            <option value="12th - PCB">12th - PCB</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="JKSSB">JKSSB</option>
          </select>

          <button
            onClick={() => adminApi.exportCsv({ status: statusFilter, search, course: courseFilter })}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <RegistrationTable
            registrations={registrations}
            loading={loading}
            onView={handleView}
            onPageChange={handlePageChange}
            pagination={pagination}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReg && (
        <RegistrationDetailModal
          registration={selectedReg}
          onClose={() => { setSelectedReg(null); setSelectedId(null); }}
          onUpdated={loadRegistrations}
        />
      )}
    </AdminLayout>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/admin/components/RegistrationTable.tsx src/admin/components/RegistrationDetailModal.tsx src/admin/pages/RegistrationsPage.tsx
git commit -m "feat(admin): RegistrationsPage with table and detail modal"
```

---

## Task 8: CoursesPage

**Files:**
- Create: `src/admin/components/CourseForm.tsx`
- Create: `src/admin/pages/CoursesPage.tsx`

- [ ] **Step 1: Create `src/admin/components/CourseForm.tsx`**

```typescript
import { useState } from 'react';
import { adminApi } from '../api/adminApi';

interface Course {
  id: number;
  category: string;
  program: string;
  batch_timing: string;
  is_active: boolean;
}

interface Props {
  course?: Course;
  onSave: () => void;
  onCancel: () => void;
}

const CATEGORIES = ['Foundation', 'Science', 'Arts', 'Commerce', 'Competitive'];

export default function CourseForm({ course, onSave, onCancel }: Props) {
  const [category, setCategory] = useState(course?.category || '');
  const [program, setProgram] = useState(course?.program || '');
  const [batchTiming, setBatchTiming] = useState(course?.batch_timing || '');
  const [isActive, setIsActive] = useState(course?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { category, program, batch_timing: batchTiming, is_active: isActive };
      if (course) {
        await adminApi.updateCourse(course.id, payload);
      } else {
        await adminApi.createCourse(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
        >
          <option value="">Select category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
        <input
          type="text"
          value={program}
          onChange={e => setProgram(e.target.value)}
          required
          placeholder="e.g. 11th - PCM"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Batch Timing</label>
        <input
          type="text"
          value={batchTiming}
          onChange={e => setBatchTiming(e.target.value)}
          placeholder="e.g. Morning, Evening"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create `src/admin/pages/CoursesPage.tsx`**

```typescript
import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import CourseForm from '../components/CourseForm';
import { adminApi } from '../api/adminApi';

interface Course {
  id: number;
  category: string;
  program: string;
  batch_timing: string;
  is_active: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await adminApi.getCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    try {
      await adminApi.deleteCourse(id);
      loadCourses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddNew = () => {
    setEditingCourse(undefined);
    setShowForm(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {courses.length} Course{courses.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            + Add Course
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Course List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Program</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Timing</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{course.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{course.program}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{course.batch_timing || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No courses yet. Click "Add Course" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <CourseForm
                course={editingCourse}
                onSave={() => { setShowForm(false); loadCourses(); }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/admin/components/CourseForm.tsx src/admin/pages/CoursesPage.tsx
git commit -m "feat(admin): CoursesPage with CRUD"
```

---

## Task 9: App.tsx + Auth Guard + Environment Variables

**Files:**
- Modify: `src/App.tsx`
- Modify: `.env.example`
- Modify: `server/.env.example`

- [ ] **Step 1: Update `src/App.tsx` — add admin routes with auth guard**

Add to the imports:
```typescript
import AdminLoginPage from './admin/pages/LoginPage';
import AdminDashboardPage from './admin/pages/DashboardPage';
import AdminRegistrationsPage from './admin/pages/RegistrationsPage';
import AdminCoursesPage from './admin/pages/CoursesPage';
```

Add admin routes after the dashboard route (before the catch-all `*` route):

```typescript
// Admin routes with auth check
function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('prepxiq_admin_token');
  const location = useLocation();

  if (!token && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  if (token && location.pathname === '/admin/login') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

<Route path="/admin/login" element={<AdminLoginPage />} />
<Route path="/admin" element={
  <AdminRoute>
    <AdminDashboardPage />
  </AdminRoute>
} />
<Route path="/admin/registrations" element={
  <AdminRoute>
    <AdminRegistrationsPage />
  </AdminRoute>
} />
<Route path="/admin/courses" element={
  <AdminRoute>
    <AdminCoursesPage />
  </AdminRoute>
} />
```

- [ ] **Step 2: Update `.env.example` — add admin env vars**

Add to `.env.example`:
```
# Admin Panel
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-change-in-production
```

Add to `server/.env.example`:
```
# Admin JWT
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-change-in-production

# SMTP (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=hello@prepxiq.com
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx .env.example server/.env.example
git commit -m "feat(admin): wire admin routes in App.tsx with auth guard"
```

---

## Task 10: Create Admin User + Supabase Tables + Nodemailer

**Files:**
- Modify: `server/setup.sql`
- Create: `server/setup-admin.sql` (seed script)

- [ ] **Step 1: Update `server/setup.sql` — add courses and admin_users tables**

Add at the end of setup.sql:

```sql
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
```

- [ ] **Step 2: Create `server/setup-admin.sql` — seed initial admin user**

```sql
-- Run this ONCE after setup.sql to create the first admin user
-- Password: admin123 (change this immediately after first login)

INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$rQ7jZ9kX5vT3wQr4sH1eXeY9Z7K8mL0hPw2vBn1gHsD0cV5fG6hJ8')
ON CONFLICT (username) DO NOTHING;
```

Note: The bcrypt hash above is for `admin123` — generate your own with:
```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

- [ ] **Step 3: Commit**

```bash
git add server/setup.sql server/setup-admin.sql
git commit -m "feat(admin): add admin_users and courses tables to schema"
```

---

## Task 11: Nodemailer dependency + Server env setup

**Files:**
- Modify: `server/package.json` (add nodemailer + bcrypt + jsonwebtoken)
- Modify: `server/routes/registrations.js` (add email helper)

- [ ] **Step 1: Add to server/package.json dependencies**

```json
"nodemailer": "^6.9.8",
"bcrypt": "^5.1.1",
"jsonwebtoken": "^9.0.2"
```

Run `cd server && npm install` after.

- [ ] **Step 2: Commit**

```bash
git add server/package.json
git commit -m "chore(admin): add nodemailer, bcrypt, jsonwebtoken deps to server"
```

---

## Verification

After implementation, verify:

1. **Login page accessible** at `/admin/login` — shows PREPX IQ branded login form
2. **Bad credentials rejected** — wrong username/password shows error
3. **Good credentials redirect** to `/admin` dashboard
4. **Auth protected routes** — navigating to `/admin/registrations` without login redirects to login
5. **Stats cards render** — dashboard shows Total, Pending, Approved, Rejected counts
6. **Registrations table loads** — data appears with status badges and View button
7. **Detail modal opens** — clicking View opens registration detail with photo and all fields
8. **Status change works** — clicking Approve/Reject/Waitlist updates status with "Confirm?" prompt
9. **Email sent on status change** — approved/rejected triggers email (if SMTP configured)
10. **CSV export works** — clicking Export CSV downloads a properly formatted CSV
11. **Courses CRUD works** — can add, edit, delete courses
12. **Logout clears session** — logout button clears token and redirects to login

---

## Notes

- Admin auth JWT secret must be set in production environment — generate a strong random string
- Default admin credentials should be changed immediately after first login
- SMTP credentials need to be configured for email notifications to work
- Course list in registrations filter (RegistrationsPage.tsx) is hardcoded — consider loading dynamically from `/admin/api/courses` in a follow-up