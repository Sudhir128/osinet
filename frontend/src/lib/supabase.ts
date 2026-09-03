/**
 * OSINET Frontend — Supabase Client
 * Uses the publishable (anon) key for client-side Supabase auth.
 * Never use or expose service-role keys in frontend code.
 */
import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://pbbsbbjfuokgvovsbzra.supabase.co';
const defaultKey = 'sb_publishable_8IwphT3JchgamUtHf9ad6A_BKKuQPAS';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || defaultKey;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY not configured in environment; using default project credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
