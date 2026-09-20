// ============================================
// Supabase Client (Singleton Instance)
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Single client instance used for all database, auth, and storage requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Check if we should use mock data (env flag or missing credentials)
export const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  !supabaseUrl ||
  supabaseUrl === 'https://your-project.supabase.co' ||
  !supabaseAnonKey ||
  supabaseAnonKey === 'your-anon-key-here';
