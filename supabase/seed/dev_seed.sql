-- ============================================================
-- OSINET — Development Seed Data
-- ⚠️  DEVELOPMENT/DEMO ONLY — DO NOT APPLY TO PRODUCTION ⚠️
--
-- This creates minimal demo data for local development.
-- It does NOT insert fake intelligence or investigation data.
-- Real users are created through Supabase Auth — this only
-- seeds a system admin profile placeholder.
-- ============================================================

-- NOTE: The actual user UUID must come from auth.users after creating
-- the user through Supabase Auth UI or API. 
-- Replace <YOUR_ADMIN_USER_UUID> with a real auth.users.id value.

-- Example: promote an existing user to SYSTEM_ADMIN
-- UPDATE public.profiles 
-- SET role = 'SYSTEM_ADMIN' 
-- WHERE email = 'your-admin@example.com';

-- ============================================================
-- Example: Create a demo case (requires a real user to exist)
-- ============================================================
-- INSERT INTO public.cases (title, client_ref, status, priority, jurisdiction, description, owner_id)
-- VALUES (
--   '[DEMO] Example Investigation Case',
--   'DEMO-2024-001',
--   'OPEN',
--   'MEDIUM',
--   'US',
--   'This is a demonstration case for development purposes only. Not a real investigation.',
--   '<YOUR_USER_UUID>'
-- );

-- NOTE: Run migrations 001 and 002 first, then create your admin user
-- through Supabase Auth, then update their role to SYSTEM_ADMIN using:
-- UPDATE public.profiles SET role = 'SYSTEM_ADMIN' WHERE email = '<your-email>';
