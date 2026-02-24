const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTable() {
  console.log('🚀 Checking Supabase database...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

  // Verify if the table already exists
  console.log('🔍 Checking if table "registrations" exists...\n');
  
  const { data, error } = await supabase
    .from('registrations')
    .select('count', { count: 'exact', head: true });
  
  if (error) {
    if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('not found')) {
      console.log('❌ Table "registrations" does not exist.\n');
      console.log('━'.repeat(60));
      console.log('📋 MANUAL MIGRATION REQUIRED');
      console.log('━'.repeat(60));
      console.log('\nTo run the migration, please follow these steps:\n');
      console.log('1. Open your browser and go to:');
      console.log('   https://supabase.com/dashboard\n');
      console.log('2. Select your project\n');
      console.log('3. Click on "SQL Editor" in the left sidebar\n');
      console.log('4. Click "New Query"\n');
      console.log('5. Copy the SQL from server/supabase-schema.sql and paste it\n');
      console.log('6. Click "Run" to execute the migration\n');
      console.log('━'.repeat(60));
    } else {
      console.log('❌ Error checking table:', error.message);
      console.log('   Code:', error.code);
      console.log('\nPlease run the migration manually in Supabase SQL Editor.\n');
    }
  } else {
    console.log('✅ Table "registrations" already exists!');
    console.log(`   Current row count: ${data?.count || 0}\n`);
    console.log('✨ Migration appears to have been run previously.');
    console.log('   No further action needed.\n');
  }
}

checkTable().catch(err => {
  console.error('❌ Check failed:', err.message);
  process.exit(1);
});
