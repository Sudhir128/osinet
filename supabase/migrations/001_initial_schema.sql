-- ============================================================
-- OSINET — Migration 001: Initial Schema
-- Apply to: Supabase project pbbsbbjfuokgvovsbzra
-- 
-- CAUTION: Run INSPECT queries first before executing.
-- This migration is additive — it uses IF NOT EXISTS guards
-- to avoid destroying existing data.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES
-- Extends Supabase's auth.users with OSINET-specific fields.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email        TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT 'INVESTIGATOR'
                 CHECK (role IN ('INVESTIGATOR', 'SUPERVISOR', 'CASE_ADMIN', 'SYSTEM_ADMIN', 'AUDITOR')),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'OSINET user profiles extending Supabase auth.users';
COMMENT ON COLUMN public.profiles.role IS 'OSINET RBAC role: INVESTIGATOR | SUPERVISOR | CASE_ADMIN | SYSTEM_ADMIN | AUDITOR';

-- ============================================================
-- 2. CASES
-- Core investigation case entity.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cases (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL CHECK (length(trim(title)) >= 3),
  client_ref    TEXT,
  status        TEXT NOT NULL DEFAULT 'OPEN'
                  CHECK (status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'ARCHIVED')),
  priority      TEXT NOT NULL DEFAULT 'MEDIUM'
                  CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  jurisdiction  TEXT,
  description   TEXT,
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  retention_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_owner_id    ON public.cases(owner_id);
CREATE INDEX IF NOT EXISTS idx_cases_status      ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority    ON public.cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_created_at  ON public.cases(created_at DESC);

COMMENT ON TABLE public.cases IS 'OSINET investigation cases';

-- ============================================================
-- 3. CASE MEMBERS
-- Associates additional users with a case (for shared access).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.case_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id    UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'INVESTIGATOR'
               CHECK (role IN ('INVESTIGATOR', 'SUPERVISOR', 'CASE_ADMIN')),
  added_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_case_members_case_id ON public.case_members(case_id);
CREATE INDEX IF NOT EXISTS idx_case_members_user_id ON public.case_members(user_id);

COMMENT ON TABLE public.case_members IS 'Users assigned to a case beyond the owner';

-- ============================================================
-- 4. TARGETS
-- Investigation target entities within a case.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.targets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  type              TEXT NOT NULL
                      CHECK (type IN ('PERSON','EMAIL','PHONE','USERNAME','DOMAIN','IP','COMPANY','URL')),
  raw_value         TEXT NOT NULL,
  normalized_value  TEXT NOT NULL,
  notes             TEXT,
  created_by        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent duplicate targets of same type+normalized_value within a case
  UNIQUE (case_id, type, normalized_value)
);

CREATE INDEX IF NOT EXISTS idx_targets_case_id    ON public.targets(case_id);
CREATE INDEX IF NOT EXISTS idx_targets_type       ON public.targets(type);
CREATE INDEX IF NOT EXISTS idx_targets_created_at ON public.targets(created_at DESC);

COMMENT ON TABLE public.targets IS 'Investigation targets (persons, emails, domains, IPs, etc.)';

-- ============================================================
-- 5. AUDIT LOGS
-- Immutable audit trail of all significant platform events.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  metadata     JSONB,
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id    ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity      ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON public.audit_logs(created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail — do not allow DELETE or UPDATE';

-- ============================================================
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_targets_updated_at ON public.targets;
CREATE TRIGGER update_targets_updated_at
  BEFORE UPDATE ON public.targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 7. AUTO-CREATE PROFILE ON NEW USER REGISTRATION
-- Fires when a new user signs up via Supabase Auth.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    'INVESTIGATOR'  -- Default role; SYSTEM_ADMIN must be granted manually
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
