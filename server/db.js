// Database module - now using Supabase PostgreSQL instead of SQLite
// This file is kept for compatibility but SQLite is no longer used

// Export a mock database object for backward compatibility
const db = {
  exec: function() {},
  prepare: function() {
    return {
      run: function() { return {}; },
      get: function() { return null; },
      all: function() { return []; }
    };
  }
};

module.exports = db;
