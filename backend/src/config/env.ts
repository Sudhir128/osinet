/**
 * OSINET Backend — Environment Configuration
 * Validates required environment variables at startup.
 * Fails fast if critical variables are missing.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`[Config] Required environment variable "${name}" is missing or empty.`);
  }
  return value.trim();
}

function optionalEnv(name: string, defaultValue = ''): string {
  return (process.env[name] ?? defaultValue).trim();
}

export const config = {
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    anonKey: requireEnv('SUPABASE_ANON_KEY'),
    // Service role key is optional at startup — documented requirement for privileged ops.
    serviceRoleKey: optionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  server: {
    port: parseInt(optionalEnv('PORT', '5000'), 10),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    corsOrigin: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),
  },
  providers: {
    shodanApiKey: optionalEnv('SHODAN_API_KEY'),
    censysApiId: optionalEnv('CENSYS_API_ID'),
    censysApiSecret: optionalEnv('CENSYS_API_SECRET'),
    ipinfoToken: optionalEnv('IPINFO_API_TOKEN'),
    serpapiKey: optionalEnv('SERPAPI_API_KEY'),
    hunterKey: optionalEnv('HUNTER_API_KEY'),
    hibpKey: optionalEnv('HIBP_API_KEY'),
    whoisxmlKey: optionalEnv('WHOISXML_API_KEY'),
  },
  isDevelopment: optionalEnv('NODE_ENV', 'development') === 'development',
  isProduction: optionalEnv('NODE_ENV', 'development') === 'production',
} as const;
