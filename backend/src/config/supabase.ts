/**
 * OSINET Backend — Supabase Client Configuration
 *
 * Two clients are exported:
 *   supabase      — anon key client (respects RLS, used for most operations)
 *   supabaseAdmin — service role client (bypasses RLS, for privileged backend ops)
 *
 * supabaseAdmin will be null if SUPABASE_SERVICE_ROLE_KEY is not configured.
 * Privileged operations that require it must guard with a null check and log a
 * clear configuration error rather than failing silently.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';
import { logger } from '../utils/logger';

export const supabase: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export let supabaseAdmin: SupabaseClient | null = null;

if (config.supabase.serviceRoleKey) {
  supabaseAdmin = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  logger.info('[Supabase] Admin client initialized (service role key present)');
} else {
  logger.warn(
    '[Supabase] SUPABASE_SERVICE_ROLE_KEY not configured. ' +
    'Privileged admin operations will be unavailable until this key is provided. ' +
    'See backend/.env.example for documentation.'
  );
}
