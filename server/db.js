const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data', 'registrations.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create tables
const initDatabase = () => {
  // Main registrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_number TEXT UNIQUE NOT NULL,
      registration_date TEXT NOT NULL,
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
      has_allergies INTEGER DEFAULT 0,
      allergies_list TEXT,
      has_medical_conditions INTEGER DEFAULT 0,
      medical_conditions_list TEXT,
      blood_group TEXT,
      photo_consent INTEGER DEFAULT 0,
      declaration_agreed INTEGER DEFAULT 0,
      photo_path TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_registration_number ON registrations(registration_number);
    CREATE INDEX IF NOT EXISTS idx_mobile_number ON registrations(mobile_number);
    CREATE INDEX IF NOT EXISTS idx_email ON registrations(email_address);
    CREATE INDEX IF NOT EXISTS idx_status ON registrations(status);
  `);

  console.log('Database initialized successfully');
};

// Initialize on module load
initDatabase();

module.exports = db;
