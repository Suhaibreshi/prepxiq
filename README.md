# PREP X IQ

Student registration system for coaching/institute management. Built with React + Vite (frontend) and Express + Supabase (backend).

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
**Backend**: Express.js, Supabase (PostgreSQL), Multer (file uploads)

## Project Structure

```
/
├── src/                    # React frontend
│   ├── assets/             # Static assets
│   ├── auth/               # Auth context & hooks
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utilities & Supabase client
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   ├── index.js            # Server entry point
│   ├── supabase.js         # Supabase client
│   ├── db.js               # Database helpers
│   ├── migrate.js          # Migration script
│   ├── run-migration.js    # Migration runner
│   └── setup.sql           # Database schema
└── public/                 # Static public assets
```

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` (Vite default).

### Backend

```bash
cd server
npm install
cp .env.example .env   # Then edit .env with your Supabase credentials
npm start
```

The server runs on `http://localhost:4000`.

## Backend Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In the Supabase SQL Editor, run the contents of `server/setup.sql`
3. Copy `server/.env.example` to `server/.env` and fill in your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## Environment Variables

**Frontend** (create `.env.local` if needed):
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000
```

**Backend** (`server/.env`):
```
PORT=4000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/registrations` | List registrations (paginated) |
| GET | `/api/registrations/:id` | Get by ID |
| GET | `/api/registrations/number/:regNumber` | Get by registration number |
| POST | `/api/registrations` | Create registration (multipart) |
| PUT | `/api/registrations/:id` | Update registration |
| PATCH | `/api/registrations/:id/status` | Update status |
| DELETE | `/api/registrations/:id` | Delete registration |
| GET | `/api/registrations/stats/summary` | Registration statistics |

## Features

- Student registration with photo upload
- OTP-based login (Twilio SMS/WhatsApp, falls back to console log in dev)
- Registration status management (pending/approved/rejected/waitlisted)
- Search and filter registrations
- Responsive design with Tailwind CSS