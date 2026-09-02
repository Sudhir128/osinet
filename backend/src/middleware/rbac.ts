/**
 * OSINET Backend — RBAC Middleware
 *
 * Role hierarchy (highest to lowest privilege):
 *   SYSTEM_ADMIN > CASE_ADMIN > SUPERVISOR > INVESTIGATOR
 *   AUDITOR — read-only across cases they have access to
 *
 * Authorization is server-side authoritative.
 * Frontend role checks are UI conveniences only; they do NOT substitute this.
 */
import { Request, Response, NextFunction } from 'express';
import type { OsinetRole } from '../types';
import { sendForbidden, sendUnauthorized } from '../utils/response';
import { logger } from '../utils/logger';

const ROLE_HIERARCHY: Record<OsinetRole, number> = {
  SYSTEM_ADMIN: 100,
  CASE_ADMIN: 80,
  SUPERVISOR: 60,
  INVESTIGATOR: 40,
  AUDITOR: 20,
};

/**
 * Require that the authenticated user has at least one of the specified roles.
 */
export function requireRole(...roles: OsinetRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const requiredLevel = Math.min(...roles.map((r) => ROLE_HIERARCHY[r] ?? 0));

    if (userLevel >= requiredLevel) {
      next();
      return;
    }

    logger.warn(`[RBAC] Access denied: user ${req.user.id} (${req.user.role}) requires one of [${roles.join(', ')}]`);
    sendForbidden(res, `Insufficient permissions. Required role: ${roles.join(' or ')}`);
  };
}

/**
 * Require SYSTEM_ADMIN role.
 */
export const requireAdmin = requireRole('SYSTEM_ADMIN');

/**
 * Require CASE_ADMIN or higher.
 */
export const requireCaseAdmin = requireRole('CASE_ADMIN', 'SYSTEM_ADMIN');

/**
 * Require SUPERVISOR or higher.
 */
export const requireSupervisor = requireRole('SUPERVISOR', 'CASE_ADMIN', 'SYSTEM_ADMIN');

/**
 * Require INVESTIGATOR or higher (any operational role).
 */
export const requireInvestigator = requireRole(
  'INVESTIGATOR',
  'SUPERVISOR',
  'CASE_ADMIN',
  'SYSTEM_ADMIN'
);

/**
 * Allow any authenticated user (including AUDITOR).
 */
export const requireAnyRole = requireRole(
  'AUDITOR',
  'INVESTIGATOR',
  'SUPERVISOR',
  'CASE_ADMIN',
  'SYSTEM_ADMIN'
);
