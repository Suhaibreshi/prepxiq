# PREP X IQ Server - Registration Backend

This is the backend server for the PREP X IQ Student Registration System.

## Features

- **Student Registration API**: Full CRUD operations for student registrations
- **Photo Upload**: Support for student photo uploads (up to 5MB, JPEG/PNG)
- **Supabase Database**: Cloud-hosted PostgreSQL database via Supabase
- **OTP Verification**: SMS/WhatsApp OTP support via Twilio (optional)

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API and copy:
   - **Project URL** (SUPABASE_URL)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY) - for server-side operations
   - Or **Anon Key** (SUPABASE_ANON_KEY) - for client-side operations

4. Run the SQL schema in Supabase SQL Editor:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy the contents of `supabase-schema.sql` and run it

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Start the Server

```bash
npm start
```

The server will start on port 4000 by default.

## API Endpoints

### Registration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/registrations` | List all registrations (with pagination) |
| GET | `/api/registrations/:id` | Get single registration by ID |
| GET | `/api/registrations/number/:regNumber` | Get by registration number |
| POST | `/api/registrations` | Create new registration |
| PUT | `/api/registrations/:id` | Update registration |
| PATCH | `/api/registrations/:id/status` | Update registration status |
| DELETE | `/api/registrations/:id` | Delete registration |
| GET | `/api/registrations/stats/summary` | Get registration statistics |

### Query Parameters for GET /api/registrations

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (pending, approved, rejected, waitlisted)
- `search`: Search by name, registration number, mobile, or email

### Example: Create Registration

```bash
curl -X POST http://localhost:4000/api/registrations \
  -F "name=John Doe" \
  -F "fatherGuardianName=James Doe" \
  -F "gender=male" \
  -F "mobileNumber=9876543210" \
  -F "emailAddress=john@example.com" \
  -F "courseProgram=JEE Preparation" \
  -F "photo=@/path/to/photo.jpg"
```

### Example Response

```json
{
  "success": true,
  "message": "Registration created successfully",
  "data": {
    "id": 1,
    "registration_number": "REG-20260220-12345",
    "registration_date": "2026-02-20",
    "name": "John Doe",
    "father_guardian_name": "James Doe",
    "gender": "male",
    "mobile_number": "9876543210",
    "email_address": "john@example.com",
    "course_program": "JEE Preparation",
    "status": "pending",
    "created_at": "2026-02-20T10:30:00.000Z"
  }
}
```

## Database Schema

The application uses Supabase (PostgreSQL) as the database. Run `supabase-schema.sql` in your Supabase SQL Editor to create the table.

### Registrations Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| registration_number | TEXT | Unique registration number |
| registration_date | DATE | Date of registration |
| name | TEXT | Student name |
| father_guardian_name | TEXT | Father/Guardian name |
| gender | TEXT | Gender (male/female/other) |
| current_class | TEXT | Current class/qualification |
| mobile_number | TEXT | Mobile number |
| email_address | TEXT | Email address |
| course_program | TEXT | Course applied for |
| batch_class_timing | TEXT | Batch timing |
| guardian_name | TEXT | Guardian name (for minors) |
| relationship_to_student | TEXT | Guardian relationship |
| guardian_phone | TEXT | Guardian phone |
| guardian_address | TEXT | Guardian address |
| emergency_contact_name | TEXT | Emergency contact name |
| emergency_relationship | TEXT | Emergency contact relationship |
| emergency_phone | TEXT | Emergency contact phone |
| has_allergies | BOOLEAN | Has allergies |
| allergies_list | TEXT | List of allergies |
| has_medical_conditions | BOOLEAN | Has medical conditions |
| medical_conditions_list | TEXT | List of medical conditions |
| blood_group | TEXT | Blood group |
| photo_consent | BOOLEAN | Photo consent given |
| declaration_agreed | BOOLEAN | Declaration agreed |
| photo_path | TEXT | Path to uploaded photo |
| status | TEXT | Registration status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## File Storage

- Uploaded photos are stored in `server/uploads/photos/`
- Photos are renamed with timestamp + random suffix for uniqueness
- Maximum file size: 5MB
- Allowed formats: JPEG, JPG, PNG

**Note**: For production, consider using Supabase Storage for file uploads instead of local storage.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 4000 |
| NODE_ENV | Environment | development |
| SUPABASE_URL | Supabase project URL | - |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | - |
| SUPABASE_ANON_KEY | Supabase anon key (alternative) | - |
| TWILIO_ACCOUNT_SID | Twilio Account SID | - |
| TWILIO_AUTH_TOKEN | Twilio Auth Token | - |
| TWILIO_WHATSAPP_FROM | Twilio WhatsApp number | - |
| TWILIO_SMS_FROM | Twilio SMS number | - |

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start index.js --name prepxiq-server
   ```
3. Set up a reverse proxy (nginx/Apache)
4. Configure SSL/TLS certificates
5. Use Supabase's connection pooling for better performance

## Migration from SQLite

If you were previously using SQLite, the data structure is compatible. You can export your SQLite data and import it into Supabase using the CSV import feature or by writing INSERT statements.

## Troubleshooting

### Connection Issues

1. Verify your Supabase URL and keys are correct
2. Check if your Supabase project is running (not paused)
3. Ensure the `registrations` table exists (run `supabase-schema.sql`)
4. Check Row Level Security policies are configured correctly

### Permission Errors

If you get permission errors, make sure:
1. You're using the Service Role Key for server-side operations
2. RLS policies are set up correctly (see `supabase-schema.sql`)

## License

MIT License
