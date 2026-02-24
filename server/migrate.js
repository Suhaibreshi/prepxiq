const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase database connection string
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  console.log('\nTo get your DATABASE_URL:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Database');
  console.log('4. Copy the "Connection string" (URI format)');
  console.log('5. Add it to your .env file as DATABASE_URL=your-connection-string');
  console.log('\nNote: Replace [YOUR-PASSWORD] with your database password');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  const client = await pool.connect();
  
  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Executing SQL schema...\n');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 The following has been created:');
    console.log('   - registrations table');
    console.log('   - Indexes for faster lookups');
    console.log('   - Trigger for updated_at timestamp');
    console.log('   - Row Level Security policies');
    console.log('   - registration_stats view');
    
    // Verify the table exists
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'registrations'
    `);
    
    if (result.rows[0].count > 0) {
      console.log('\n✅ Verified: registrations table exists in database');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check if it's a "already exists" error
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some objects already exist. This is normal if you\'ve run the migration before.');
      console.log('   The migration script uses "IF NOT EXISTS" where possible.\n');
    } else {
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});
