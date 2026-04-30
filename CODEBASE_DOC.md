# PREPX IQ - Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Component Details](#component-details)
9. [Configuration Files](#configuration-files)
10. [Environment Variables](#environment-variables)
11. [Data Flow](#data-flow)
12. [Known Notes & Quirks](#known-notes--quirks)

---

## Project Overview

**PREPX IQ** is a comprehensive student registration and learning management system for a coaching institute based in Achabal, Anantnag (Jammu & Kashmir), India. The platform provides exam preparation for:
- Class 6-12 students
- Foundation courses
- NEET (Medical entrance)
- JEE (Engineering entrance)
- JKSSB (Jammu & Kashmir State Service Commission exams)

**Live URL**: https://prepxiq.com
**Contact**: hello@prepxiq.com | +91 9149747791

---

## Tech Stack

### Frontend
- **Runtime**: React 18.3.1 with TypeScript
- **Bundler**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1 + custom CSS
- **Icons**: Lucide React 0.344.0
- **Database Client**: Supabase JS 2.57.4

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: Supabase (PostgreSQL) with SQLite fallback
- **File Upload**: Multer 1.4.5
- **PDF Generation**: PDFKit 0.17.2
- **SMS/OTP**: Twilio 4.9.0 (optional)

### Deployment
- **Frontend**: Vercel (static build)
- **Backend**: Vercel Serverless Functions / Node server

---

## Project Structure

```
prepxiq/
├── src/                          # React Frontend
│   ├── main.tsx                  # Entry point - ReactDOM.createRoot
│   ├── App.tsx                   # Main app - state-based view routing
│   ├── index.css                 # Tailwind imports + custom grid pattern
│   ├── vite-env.d.ts             # Vite type declarations
│   ├── auth/
│   │   └── AuthContext.tsx       # Auth state management (OTP disabled)
│   ├── lib/
│   │   └── supabase.ts           # Supabase client (hardcoded fallback keys)
│   └── components/
│       ├── Navbar.tsx            # Fixed nav with course dropdowns
│       ├── Hero.tsx              # Landing hero section
│       ├── Courses.tsx           # Course grid (links to YouTube playlists)
│       ├── Features.tsx          # Feature cards + Why Choose Us
│       ├── Trust.tsx             # Trust factors + commitments
│       ├── Footer.tsx            # Footer with contact info + socials
│       ├── ScrollToTop.tsx       # Scroll-to-top FAB
│       ├── RegistrationForm.tsx  # Multi-section registration form
│       ├── MockTestsQA.tsx       # Placeholder for Mock Tests feature
│       ├── ExpertDoubtSolving.tsx # Expert chat interface
│       ├── ComingSoon.tsx        # Placeholder for upcoming features
│       ├── Logo.tsx              # Logo component (header-logo.png)
│       └── ExpertDoubt/
│           ├── ExpertProfile.tsx # Expert card with rating/chat button
│           ├── DoubtForm.tsx     # Submit doubt modal
│           └── ExpertChat.tsx    # Chat modal with message history
├── server/                       # Express Backend
│   ├── index.js                  # Server entry - Express setup + OTP routes
│   ├── supabase.js               # Supabase client with connection test
│   ├── db.js                     # Mock SQLite db (backwards compat)
│   ├── setup.sql                 # PostgreSQL schema for Supabase
│   ├── migrate.js                # PostgreSQL migration runner (pg Pool)
│   ├── run-migration.js          # Table existence checker
│   ├── routes/
│   │   └── registrations.js      # All registration CRUD endpoints
│   ├── uploads/                  # File upload storage
│   │   ├── photos/               # Student photo uploads
│   │   └── pdfs/                 # Generated PDF receipts
│   ├── .env.example              # Server env template
│   └── package.json
├── public/
│   ├── header-logo.png           # Navbar/Footer logo
│   └── footer-logo.png
├── vercel.json                   # Vercel routing config
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite config with API proxy
├── tailwind.config.js            # Tailwind content paths
├── tsconfig.json                 # TypeScript project refs
├── tsconfig.app.json             # Frontend TypeScript options
├── tsconfig.node.json            # Node TypeScript options
├── postcss.config.js             # PostCSS with Tailwind + Autoprefixer
├── eslint.config.js              # ESLint + TypeScript rules
├── .env                          # Frontend env vars (VITE_*)
└── .env.example                  # Frontend env template
```

---

## Frontend Architecture

### Entry Point Flow
```
main.tsx (createRoot)
    └── App.tsx (AuthProvider wrapper)
            └── Conditional rendering based on state:
                ├── RegistrationForm (showRegistration=true)
                ├── MockTestsQA (showMockTests=true)
                ├── ExpertDoubtSolving (showExpertDoubt=true)
                ├── ComingSoon (comingSoonFeature=string)
                └── Default: Navbar + Hero + Courses + Features + Trust + Footer + ScrollToTop
```

### State Management
- **App.tsx**: Local React state (`useState`) for view navigation
- **AuthContext.tsx**: Global auth state (token, phone) stored in localStorage
- **Component-level state**: Forms use local `useState`

### Key Dependencies
- `supabase.ts` - Client-side Supabase instance for direct DB access
- AuthContext provides `loginWithToken()`, `logout()`, `sendOtp()`, `verifyOtp()` (OTP disabled)

---

## Backend Architecture

### Server Entry (index.js)
```javascript
// Line 1-10: Load .env, express, cors, path, fs
// Line 15-17: Middleware - cors(), express.json(), express.urlencoded()
// Line 19: PORT = process.env.PORT || 4000
// Line 22-25: Ensure data directory exists
// Line 28: Serve /uploads statically
// Line 31-35: In-memory OTP store (Map) + generateOtp()
// Line 38-66: POST /api/send-otp - sends via Twilio or logs (demo mode)
// Line 68-83: POST /api/verify-otp - validates OTP, returns demo token
// Line 86-87: Registration routes mounted at /api/registrations
// Line 90-92: GET /api/health
// Line 95-109: Error handling middleware
// Line 112-115: 404 handler
// Line 117-121: app.listen(PORT, ...)
```

### Registration Routes (routes/registrations.js)
All routes support both Supabase and SQLite fallback (though SQLite is legacy):

| Method | Endpoint | Function | Lines |
|--------|----------|----------|-------|
| GET | `/` | List with pagination, search, filter | 116-197 |
| GET | `/:id` | Get single by ID | 200-231 |
| GET | `/number/:regNumber` | Get by registration number | 234-265 |
| GET | `/:id/pdf` | Generate PDF receipt | 268-497 |
| POST | `/` | Create with photo upload | 500-624 |
| PUT | `/:id` | Full update with photo | 627-783 |
| DELETE | `/:id` | Delete registration + photo | 786-854 |
| GET | `/stats/summary` | Get counts by status | 857-900 |

### Supabase Client (supabase.js)
- Creates client with service role key for server-side operations
- 10-second timeout on all requests via AbortController
- `testConnection()` function verifies connectivity

---

## Database Schema

### PostgreSQL (Supabase) - setup.sql
```sql
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

-- Indexes
CREATE INDEX idx_reg_mobile  ON registrations(mobile_number);
CREATE INDEX idx_reg_status  ON registrations(status);
CREATE INDEX idx_reg_created ON registrations(created_at);

-- RLS Policies (anyone can insert/select - no auth required)
```

### Frontend Form Field Mapping (RegistrationForm.tsx → Supabase)
| Form Field | State Key | Supabase Column |
|------------|-----------|-----------------|
| Full Name | `name` | `name` |
| Father's Name | `fatherName` | `father_name` |
| Gender | `gender` | `gender` |
| Current Class | `currentClass` | `current_class` |
| Mobile Number | `mobileNumber` | `mobile_number` |
| Email Address | `emailAddress` | `email_address` |
| Course Category | `courseCategory` (local) | (combined with courseProgram) |
| Course Program | `courseProgram` | `course_program` |
| Timing | `batchClassTiming` | `batch_class_timing` |
| Declaration | `declaration` | `declaration_agreed` |
| Registration Number | `registrationNumber` (auto) | `registration_number` |
| Registration Date | `registrationDate` (auto) | `registration_date` |

---

## API Endpoints

### Frontend → Supabase Direct (src/lib/supabase.ts)
```typescript
// Client-side Supabase directly inserts into registrations table
supabase.from('registrations').insert([{...}])
```

### Backend API (server/index.js)

#### OTP Endpoints
| Method | Path | Request Body | Response | Notes |
|--------|------|--------------|----------|-------|
| POST | `/api/send-otp` | `{phone, channel}` | `{message}` | Twilio or console log |
| POST | `/api/verify-otp` | `{phone, otp}` | `{token}` | Demo token returned |

#### Registration Endpoints
| Method | Path | Query/Body | Response | Notes |
|--------|------|------------|----------|-------|
| GET | `/api/registrations` | `?page&limit&status&search` | `{success, data[], pagination}` | Paginated list |
| GET | `/api/registrations/:id` | - | `{success, data}` | By ID |
| GET | `/api/registrations/number/:regNumber` | - | `{success, data}` | By reg number |
| GET | `/api/registrations/:id/pdf` | - | `{success, pdfPath}` | Generates PDF |
| POST | `/api/registrations` | `multipart/form-data` | `{success, data}` | With photo upload |
| PUT | `/api/registrations/:id` | `multipart/form-data` | `{success, data}` | Full update |
| DELETE | `/api/registrations/:id` | - | `{success}` | Delete + photo |
| GET | `/api/registrations/stats/summary` | - | `{success, data}` | Count by status |

---

## Component Details

### Navbar.tsx
**Purpose**: Fixed navigation header with course dropdown

**Key Features**:
- Fixed position with backdrop blur
- Desktop: Horizontal nav with Courses dropdown (multi-level)
- Mobile: Hamburger menu with accordion
- Course links point to YouTube playlists (real content)
- Register Now CTA button

**Course Categories** (lines 9-51):
```javascript
const courseCategories = [
  { name: 'Foundation', subOptions: [6th-10th Class] },
  { name: 'Science', subOptions: [11th-12th PCM/PCB] },
  { name: 'Arts', subOptions: [11th-12th Arts] },
  { name: 'Commerce', subOptions: [11th-12th Commerce] },
  { name: 'Competitive Exams', subOptions: [JEE, NEET, JKSSB] }
]
```

**Behavior**:
- `handleMouseEnter`/`handleMouseLeave` for desktop dropdown delay
- Click outside closes dropdown (lines 65-74)
- Mobile accordion state: `mobileCoursesOpen`, `mobileActiveCategory`

---

### RegistrationForm.tsx
**Purpose**: Multi-section student registration form

**Form Sections**:
1. **Registration Info** (auto-generated, read-only)
   - `registrationNumber`: Format `REG-YYYYMMDD-XXXXX`
   - `registrationDate`: Today's date (ISO format)

2. **Student Information**
   - Full Name (letters only, required)
   - Father's Name (letters only, optional)
   - Gender (select: Male/Female/Other)
   - Current Class (select: 6th-12th, 12+)
   - Mobile Number (10 digits, numeric)
   - Email Address (validation)
   - Batch Timing (Morning/Evening)

3. **Course Selection** (lines 54-75)
   ```javascript
   const COURSE_CATEGORIES = [
     { name: 'Foundation', options: ['6th Class'...'10th Class'] },
     { name: 'Science', options: ['11th - PCM', '12th - PCM', '11th - PCB', '12th - PCB'] },
     { name: 'Arts', options: ['11th - Arts', '12th - Arts'] },
     { name: 'Commerce', options: ['11th - Commerce', '12th - Commerce'] },
     { name: 'Competitive Exams', options: ['JEE', 'NEET', 'JKSSB'] }
   ]
   ```

4. **Declaration** (checkbox, required)

**Validation**:
- `touched` state tracks which fields user has interacted with
- `errors` object holds validation messages
- `showError(field)` returns true if touched AND has error
- `fieldClass(field)` returns conditional Tailwind classes for styling

**View States**:
1. **Main Form** (default) - Input fields
2. **Review Screen** (`showReview=true`) - Confirmation before submit
3. **Success Screen** (`isSubmitted=true`) - Confirmation after submit

**Submit Flow** (lines 130-169):
```typescript
1. confirmSubmit() called from review screen
2. setIsSubmitting(true)
3. supabase.from('registrations').insert([{...}])
4. On success: setIsSubmitted(true), serverRegNumber = formData.registrationNumber
5. After 5s: reset form to initial state
6. On error: setSubmitError(err.message)
```

---

### ExpertDoubtSolving.tsx
**Purpose**: Expert chat interface for doubt solving

**Views** (rendered as full page when `onBack` prop exists):
- Header with key features (Expert Faculty, 1-on-1 Chat, 24/7, Instant Help)
- Active Conversations list
- CTA: "Raise Your Doubt" button
- Experts Grid (4 experts)
- DoubtForm modal (when `showDoubtForm=true`)
- ExpertChat modal (when `activeChat` set)

**Pre-populated Data** (lines 42-63):
```typescript
conversations = [
  { id: 1, expertId: 1, expertName: 'Dr. Rajesh Kumar', subject: 'Physics', status: 'resolved' },
  { id: 2, expertId: 2, expertName: 'Priya Sharma', subject: 'Chemistry', status: 'active' }
]
```

**Experts** (lines 65-106):
- Dr. Rajesh Kumar (Physics) - 15+ years, 4.9 rating
- Priya Sharma (Chemistry) - 12+ years, 4.8 rating
- Amit Verma (Mathematics) - 18+ years, 4.9 rating
- Dr. Neha Singh (Biology) - 13+ years, 4.7 rating

---

### ExpertChat.tsx
**Purpose**: Real-time chat modal with expert

**Features**:
- Fixed overlay (full screen mobile, centered modal desktop)
- Message bubbles (student: right/blue, expert: left/white)
- Typing indicator (3 bouncing dots)
- Auto-scroll to bottom on new messages
- Simulated expert responses (1.5s delay)

**Message Structure**:
```typescript
interface Message {
  id: number;
  sender: 'student' | 'expert';
  text: string;
  timestamp: Date;
  avatar: string;
  name: string;
}
```

---

### Trust.tsx
**Purpose**: Trust factors and commitments section

**Trust Factors** (lines 3-24):
- Quality Assured (Shield icon)
- Expert Faculty (Users icon)
- Comprehensive Coverage (BookOpen icon)
- Proven Results (Trophy icon)

**Commitments** (lines 26-33):
- Regular performance tracking
- Personalized learning paths
- Updated content aligned with latest exam patterns
- Affordable pricing with flexible payment options
- Regular parent-teacher interaction sessions
- Dedicated student support team

---

## Configuration Files

### vite.config.ts
```typescript
plugins: [react()]
optimizeDeps: { exclude: ['lucide-react'] }  // Avoids ESM build issues
server: {
  proxy: {
    '/api': { target: 'http://localhost:4000', changeOrigin: true }
  }
}
```
**Why proxy?**: Dev server forwards `/api/*` requests to Express backend on port 4000.

### tailwind.config.js
```javascript
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']
```
Defines which files Tailwind scans for class names.

### tsconfig.app.json
```javascript
target: 'ES2020'
jsx: 'react-jsx'              // New JSX transform (no React import needed)
strict: true                  // Full type checking
moduleResolution: 'bundler'   // Vite-style imports
noEmit: true                  // TypeScript only, no output files
```

### vercel.json
```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build", "config": {"distDir": "dist"} },
    { "src": "server/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },
    { "src": "/uploads/(.*)", "dest": "/server/index.js" },
    { "src": "/(.*)", "dest": "/dist/index.html" }
  ]
}
```
**Routing Logic**:
- `/api/*` → Express server
- `/uploads/*` → Express server (static files)
- `/*` → Frontend SPA (index.html)

---

## Environment Variables

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://luvbuvwjseeurwpypvda.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...  # Hardcoded fallback in supabase.ts
```

### Server (server/.env)
```bash
PORT=4000
NODE_ENV=development

# Twilio (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_SMS_FROM=

# Supabase (required for production)
SUPABASE_URL=https://luvbuvwjseeurwpypvda.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Service role key
SUPABASE_ANON_KEY=eyJhbGc...          # Anon key fallback

# Direct PostgreSQL (for migrations only)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.luvbuvwjseeurwpypvda.supabase.co:5432/postgres
```

---

## Data Flow

### Registration Flow
```
User fills form (RegistrationForm.tsx)
    ↓
Validates client-side (touched + errors state)
    ↓
Review & Submit button → Shows review screen
    ↓
Confirm & Submit → confirmSubmit()
    ↓
supabase.from('registrations').insert([{...}])  ← Frontend directly calls Supabase
    ↓
Supabase inserts with RLS bypass (anon key has INSERT policy)
    ↓
Success: Shows registration number
    ↓
Auto-reset after 5 seconds
```

### Note**: The backend registrations route is NOT used for inserts. The frontend inserts directly to Supabase.

### Mock Tests / Q&A Flow
```
User clicks Mock Tests or Q&A in Features
    ↓
setComingSoonFeature('Mock Tests') or setComingSoonFeature('Q&A Practice')
    ↓
App renders ComingSoon component
    ↓
Shows animated "Coming Soon" with feature title
```

### Expert Doubt Flow
```
User clicks "Start Now" on Expert Doubt feature card
    ↓
setShowExpertDoubt(true)  ← Renders full ExpertDoubtSolving page
    ↓
User clicks "Raise Your Doubt" → DoubtForm modal
    ↓
User fills subject/topic/question → handleDoubtSubmit()
    ↓
Creates new conversation, auto-opens ExpertChat
    ↓
User types message → handleSendMessage()
    ↓
1.5s simulated delay → Expert auto-replies
```

---

## Known Notes & Quirks

### 1. OTP System Disabled
In `src/auth/AuthContext.tsx` (lines 41-47):
```typescript
async function sendOtp(_phone: string, _channel: 'whatsapp' | 'sms') {
  return { ok: false, message: 'OTP verification is currently unavailable...' };
}
async function verifyOtp(_phone: string, _otp: string) {
  return { ok: false, message: 'OTP verification is currently unavailable...' };
}
```
The backend still has OTP code, but frontend always returns disabled.

### 2. Hardcoded Supabase Keys
In `src/lib/supabase.ts` (lines 4-5):
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://luvbuvwjseeurwpypvda.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```
Fallback keys are hardcoded - the real keys are in `server/.env`.

### 3. SQLite Fallback Code is Dead
The backend has extensive SQLite fallback code (see lines 153-191, 217-226, etc. in registrations.js), but Supabase is always used in production. This code is never executed.

### 4. No Backend Route for Registration Insert
The frontend inserts directly to Supabase (bypassing the Express server):
```typescript
// RegistrationForm.tsx line 134
const { data, error } = await supabase.from('registrations').insert([{...}])
```
The backend `POST /api/registrations` route exists but isn't called by the frontend.

### 5. YouTube Playlists are Real Content
The course links in `Navbar.tsx` and `Courses.tsx` link to actual YouTube playlists - this is the actual educational content being provided.

### 6. Photo Upload Goes to Backend
Unlike registration data, photo uploads DO go through the Express server:
- `multer` handles the upload to `server/uploads/photos/`
- Photo path is stored in Supabase
- Max size: 5MB, formats: JPEG, JPG, PNG

### 7. PDF Generation
`GET /api/registrations/:id/pdf` generates a PDF receipt using PDFKit:
- Saves to `server/uploads/pdfs/registration-{regNumber}.pdf`
- Returns path in response
- Includes student info, photo (if exists), all form fields

### 8. Two-Layer Navigation State
App.tsx uses a confusing dual-layer navigation:
```typescript
const [showRegistration, setShowRegistration] = useState(false);
const [showMockTests, setShowMockTests] = useState(false);
const [showExpertDoubt, setShowExpertDoubt] = useState(false);
const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);
```
Each is independent, so only one view shows at a time.

### 9. Vercel Deployment Config
The `vercel.json` routes `/api/*` to `server/index.js` which runs as a Vercel Node serverless function.

---

## Development Commands

### Frontend
```bash
npm install           # Install dependencies
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type check
```

### Backend
```bash
cd server
npm install          # Install server dependencies
npm start           # Start Express server (port 4000)
npm run migrate     # Run PostgreSQL migration
npm run check-db    # Check if table exists
```

### Combined (Development)
Terminal 1: `npm run dev` (frontend on :5173)
Terminal 2: `cd server && npm start` (backend on :4000)

---

*Documentation generated: April 2026*