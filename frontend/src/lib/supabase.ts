/**
 * OSINET Frontend — Supabase Client
 * Uses the publishable (anon) key for client-side Supabase auth.
 * Never use or expose service-role keys in frontend code.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
