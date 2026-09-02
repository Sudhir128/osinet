/**
 * OSINET Backend — Shared TypeScript Types
 * Mirrors database schema and domain concepts.
 */

// ========================
// Auth & Roles
// ========================
export type OsinetRole =
  | 'INVESTIGATOR'
  | 'SUPERVISOR'
  | 'CASE_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'AUDITOR';

export interface AuthenticatedUser {
  id: string;            // Supabase auth user ID (UUID)
  email: string;
  role: OsinetRole;
  profileId: string;
}

// ========================
// Cases
// ========================
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'CLOSED' | 'ARCHIVED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Case {
  id: string;
  title: string;
  client_ref?: string | null;
  status: CaseStatus;
  priority: CasePriority;
  jurisdiction?: string | null;
  description?: string | null;
  owner_id: string;
  retention_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseWithOwner extends Case {
  owner?: {
    id: string;
    display_name: string;
    email: string;
  };
}

export interface CreateCaseDto {
  title: string;
  client_ref?: string;
  priority?: CasePriority;
  jurisdiction?: string;
  description?: string;
  retention_at?: string;
}

export interface UpdateCaseDto {
  title?: string;
  client_ref?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  jurisdiction?: string;
  description?: string;
  retention_at?: string;
}

// ========================
// Targets
// ========================
export type TargetType =
  | 'PERSON'
  | 'EMAIL'
  | 'PHONE'
  | 'USERNAME'
  | 'DOMAIN'
  | 'IP'
  | 'COMPANY'
  | 'URL';

export interface Target {
  id: string;
  case_id: string;
  type: TargetType;
  raw_value: string;
  normalized_value: string;
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTargetDto {
  type: TargetType;
  raw_value: string;
  notes?: string;
}

// ========================
// Audit Logs
// ========================
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'CASE_CLOSED'
  | 'CASE_ARCHIVED'
  | 'TARGET_CREATED'
  | 'TARGET_UPDATED'
  | 'TARGET_DELETED'
  | 'ADMIN_ACTION'
  | 'USER_CREATED'
  | 'ROLE_CHANGED';

export interface AuditLog {
  id: string;
  actor_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

// ========================
// Providers (Foundation)
// ========================
export type ProviderCategory =
  | 'HOST_INTELLIGENCE'
  | 'EMAIL_ENRICHMENT'
  | 'SEARCH'
  | 'BREACH'
  | 'DOMAIN_INTELLIGENCE'
  | 'MOCK_DEV';

export interface ProviderCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
}

export interface ProviderResult<T = unknown> {
  provider: string;
  category: ProviderCategory;
  success: boolean;
  data?: T;
  error?: string;
  retrievedAt: string;
  provenanceNote: string;
}

// ========================
// Express extensions
// ========================
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
