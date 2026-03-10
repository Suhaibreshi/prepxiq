import { createClient } from '@supabase/supabase-js'

// Supabase anon key is a PUBLIC client-side key — safe to include in source
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://luvbuvwjseeurwpypvda.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dmJ1dndqc2VldXJ3cHlwdmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDI3NTcsImV4cCI6MjA4NzUxODc1N30.QE1R4sDDjWF9NSTwogXRUtpGp1p1h4LjbBh8mcVjdaI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabase
