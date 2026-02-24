const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in your .env file');
}

// Initialize Supabase client with timeout settings
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: (url, options = {}) => {
      // Set a 10 second timeout for all requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));
    }
  }
});

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('registrations').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      console.log('Supabase connection test failed - using local SQLite fallback');
      return false;
    } else {
      console.log('Supabase connected successfully');
      return true;
    }
  } catch (err) {
    console.log('Supabase connection error - using local SQLite fallback:', err.message);
    return false;
  }
};

// Initialize on module load
testConnection();

module.exports = supabase;
module.exports.testConnection = testConnection;
