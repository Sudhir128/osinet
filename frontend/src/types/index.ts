/**
 * OSINET Frontend — Shared TypeScript Types
 * Mirror of backend types for frontend use.
 */

export type OsinetRole =
  | 'INVESTIGATOR'
  | 'SUPERVISOR'
  | 'CASE_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'AUDITOR';

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  role: OsinetRole;
  created_at: string;
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
  profiles?: {
    id: string;
    display_name: string;
    email: string;
  };
}

export interface CreateCaseFormData {
  title: string;
  client_ref: string;
  priority: CasePriority;
  jurisdiction: string;
  description: string;
  retention_at: string;
}

export interface UpdateCaseFormData extends Partial<CreateCaseFormData> {
  status?: CaseStatus;
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
  profiles?: {
    display_name: string;
  };
}

export interface CreateTargetFormData {
  type: TargetType;
  raw_value: string;
  notes?: string;
}

// ========================
// Audit
// ========================
export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

// ========================
// Dashboard
// ========================
export interface DashboardStats {
  total: number;
  open: number;
  in_progress: number;
  on_hold: number;
  closed: number;
  archived: number;
}

// ========================
// API Response
// ========================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
