-- ============================================================
-- OSINET — Migration 002: Row Level Security Policies
-- Apply AFTER 001_initial_schema.sql
--
-- Philosophy:
--   - Default DENY: no access unless explicitly granted
--   - Case isolation: users see only their own / member cases
--   - Server-side backend uses anon key + user JWT for RLS
--   - SYSTEM_ADMIN and AUDITOR roles have broader read access
-- ============================================================

-- ========================
-- Enable RLS
-- ========================
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs  ENABLE ROW LEVEL SECURITY;

-- ========================
-- Drop existing policies (idempotent re-run safety)
-- ========================
DROP POLICY IF EXISTS "profiles_self_read"        ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"        ON public.profiles;

DROP POLICY IF EXISTS "cases_owner_all"           ON public.cases;
DROP POLICY IF EXISTS "cases_member_read"         ON public.cases;
DROP POLICY IF EXISTS "cases_admin_all"           ON public.cases;

DROP POLICY IF EXISTS "case_members_member_read"  ON public.case_members;
DROP POLICY IF EXISTS "case_members_owner_manage" ON public.case_members;
DROP POLICY IF EXISTS "case_members_admin_all"    ON public.case_members;

DROP POLICY IF EXISTS "targets_case_member_read"  ON public.targets;
DROP POLICY IF EXISTS "targets_investigator_write" ON public.targets;
DROP POLICY IF EXISTS "targets_admin_all"         ON public.targets;

DROP POLICY IF EXISTS "audit_admin_read"          ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert_authenticated" ON public.audit_logs;

-- ========================
-- PROFILES policies
-- ========================
-- Users can read their own profile
CREATE POLICY "profiles_self_read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "profiles_self_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- SYSTEM_ADMIN can read all profiles
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'SYSTEM_ADMIN'
    )
  );

-- ========================
-- CASES policies
-- ========================
-- Case owners can do everything with their own cases
CREATE POLICY "cases_owner_all"
  ON public.cases FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Case members can read cases they are assigned to
CREATE POLICY "cases_member_read"
  ON public.cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_members cm
      WHERE cm.case_id = id AND cm.user_id = auth.uid()
    )
  );

-- SYSTEM_ADMIN and CASE_ADMIN can access all cases
CREATE POLICY "cases_admin_all"
  ON public.cases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('SYSTEM_ADMIN', 'CASE_ADMIN')
    )
  );

-- AUDITOR can read all cases
CREATE POLICY "cases_auditor_read"
  ON public.cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'AUDITOR'
    )
  );

-- ========================
-- CASE_MEMBERS policies
-- ========================
-- Members can see memberships for cases they are part of
CREATE POLICY "case_members_member_read"
  ON public.case_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND c.owner_id = auth.uid()
    )
  );

-- Only case owners can add/remove members
CREATE POLICY "case_members_owner_manage"
  ON public.case_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND c.owner_id = auth.uid()
    )
  );

-- Admins can manage all memberships
CREATE POLICY "case_members_admin_all"
  ON public.case_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('SYSTEM_ADMIN', 'CASE_ADMIN')
    )
  );

-- ========================
-- TARGETS policies
-- ========================
-- Any user who can see the case can see its targets
CREATE POLICY "targets_case_member_read"
  ON public.targets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id
        AND (
          c.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.case_members cm
            WHERE cm.case_id = c.id AND cm.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('SYSTEM_ADMIN', 'CASE_ADMIN', 'AUDITOR')
          )
        )
    )
  );

-- Authenticated users with case access can insert targets
CREATE POLICY "targets_investigator_write"
  ON public.targets FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id
        AND (
          c.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.case_members cm
            WHERE cm.case_id = c.id AND cm.user_id = auth.uid()
          )
        )
    )
  );

-- Admins can manage all targets
CREATE POLICY "targets_admin_all"
  ON public.targets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('SYSTEM_ADMIN', 'CASE_ADMIN')
    )
  );

-- ========================
-- AUDIT_LOGS policies
-- ========================
-- SYSTEM_ADMIN and AUDITOR can read audit logs
CREATE POLICY "audit_admin_read"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('SYSTEM_ADMIN', 'AUDITOR')
    )
  );

-- Any authenticated user can insert audit events (their own)
CREATE POLICY "audit_insert_authenticated"
  ON public.audit_logs FOR INSERT
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- NOTE: No UPDATE or DELETE policy on audit_logs — the table is append-only.
-- Enforce this via Supabase column-level permissions or application logic.
