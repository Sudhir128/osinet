/**
 * OSINET Backend — Target Service
 * Business logic for target intake, normalization, and deduplication.
 */
import * as targetRepo from '../repositories/targetRepository';
import * as caseRepo from '../repositories/caseRepository';
import * as auditRepo from '../repositories/auditRepository';
import { normalizeTarget } from './normalization';
import { AppError } from '../middleware/errorHandler';
import type { Target, AuthenticatedUser, TargetType } from '../types';
import type { CreateTargetInput } from '../validators/targetValidator';

export interface CreateTargetResult {
  target: Target;
  normalized_value: string;
  normalization_warnings: string[];
  was_duplicate: boolean;
}

export async function addTarget(
  caseId: string,
  dto: CreateTargetInput,
  user: AuthenticatedUser
): Promise<CreateTargetResult> {
  // Verify case exists and user has access
  const caseRecord = await caseRepo.findCaseById(caseId, user.id);
  if (!caseRecord) {
    throw new AppError('Case not found or access denied', 404, 'CASE_NOT_FOUND');
  }

  // Normalize the raw value
  const { normalized, valid, warnings } = normalizeTarget(
    dto.type as TargetType,
    dto.raw_value
  );

  // Check for duplicate within the same case
  const existing = await targetRepo.findDuplicateTarget(caseId, dto.type, normalized);
  if (existing) {
    throw new AppError(
      `A ${dto.type} target with value "${normalized}" already exists in this case`,
      409,
      'DUPLICATE_TARGET'
    );
  }

  const target = await targetRepo.createTarget({
    caseId,
    type: dto.type,
    rawValue: dto.raw_value,
    normalizedValue: normalized,
    notes: dto.notes,
    createdBy: user.id,
  });

  void auditRepo.createAuditLog({
    actorId: user.id,
    action: 'TARGET_CREATED',
    entityType: 'target',
    entityId: target.id,
    metadata: {
      case_id: caseId,
      type: dto.type,
      normalized_value: normalized,
      valid,
      warnings: warnings.length > 0 ? warnings : undefined,
    },
  });

  return {
    target,
    normalized_value: normalized,
    normalization_warnings: warnings,
    was_duplicate: false,
  };
}

export async function getTargetsForCase(
  caseId: string,
  user: AuthenticatedUser
): Promise<Target[]> {
  // Verify case access
  const caseRecord = await caseRepo.findCaseById(caseId, user.id);
  if (!caseRecord) {
    throw new AppError('Case not found or access denied', 404, 'CASE_NOT_FOUND');
  }

  return targetRepo.findTargetsByCaseId(caseId);
}
