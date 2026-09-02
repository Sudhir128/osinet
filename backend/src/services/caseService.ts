/**
 * OSINET Backend — Case Service
 * Business logic layer for case management.
 */
import * as caseRepo from '../repositories/caseRepository';
import * as auditRepo from '../repositories/auditRepository';
import { AppError } from '../middleware/errorHandler';
import type { Case, AuthenticatedUser } from '../types';
import type { CreateCaseInput, UpdateCaseInput, CaseQueryInput } from '../validators/caseValidator';

export async function listCases(
  user: AuthenticatedUser,
  query: CaseQueryInput
): Promise<{ data: Case[]; total: number }> {
  return caseRepo.findCases(user.id, query);
}

export async function getCaseById(
  id: string,
  user: AuthenticatedUser
): Promise<Case> {
  const caseRecord = await caseRepo.findCaseById(id, user.id);
  if (!caseRecord) {
    throw new AppError('Case not found or access denied', 404, 'CASE_NOT_FOUND');
  }
  return caseRecord;
}

export async function createCase(
  dto: CreateCaseInput,
  user: AuthenticatedUser
): Promise<Case> {
  const created = await caseRepo.createCase(dto, user.id);

  // Non-blocking audit log
  void auditRepo.createAuditLog({
    actorId: user.id,
    action: 'CASE_CREATED',
    entityType: 'case',
    entityId: created.id,
    metadata: {
      title: created.title,
      priority: created.priority,
    },
  });

  return created;
}

export async function updateCase(
  id: string,
  dto: UpdateCaseInput,
  user: AuthenticatedUser
): Promise<Case> {
  // Verify exists and user has access
  const existing = await caseRepo.findCaseById(id, user.id);
  if (!existing) {
    throw new AppError('Case not found or access denied', 404, 'CASE_NOT_FOUND');
  }

  // Only owner, CASE_ADMIN, or SYSTEM_ADMIN can update
  const canUpdate =
    existing.owner_id === user.id ||
    user.role === 'CASE_ADMIN' ||
    user.role === 'SYSTEM_ADMIN' ||
    user.role === 'SUPERVISOR';

  if (!canUpdate) {
    throw new AppError('Insufficient permissions to update this case', 403, 'FORBIDDEN');
  }

  const updated = await caseRepo.updateCase(id, dto, user.id);
  if (!updated) {
    throw new AppError('Case not found or update failed', 404, 'CASE_NOT_FOUND');
  }

  // Determine specific audit action
  let action: 'CASE_UPDATED' | 'CASE_CLOSED' | 'CASE_ARCHIVED' = 'CASE_UPDATED';
  if (dto.status === 'CLOSED') action = 'CASE_CLOSED';
  if (dto.status === 'ARCHIVED') action = 'CASE_ARCHIVED';

  void auditRepo.createAuditLog({
    actorId: user.id,
    action,
    entityType: 'case',
    entityId: id,
    metadata: {
      changes: dto,
      previousStatus: existing.status,
    },
  });

  return updated;
}

export async function getDashboardStats(user: AuthenticatedUser) {
  return caseRepo.getDashboardStats(user.id);
}
