/**
 * OSINET Backend — Cases Route
 */
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireInvestigator, requireAnyRole } from '../../middleware/rbac';
import {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  getDashboardStats,
  getAuditLogs,
} from '../../controllers/caseController';
import { getTargets, addTarget } from '../../controllers/targetController';

const router = Router();

// All case routes require authentication
router.use(authenticate);

// GET /api/v1/cases/stats/dashboard
router.get('/stats/dashboard', requireAnyRole, getDashboardStats);

// GET /api/v1/cases/audit
router.get('/audit', requireAnyRole, getAuditLogs);

// GET /api/v1/cases
router.get('/', requireAnyRole, listCases);

// POST /api/v1/cases
router.post('/', requireInvestigator, createCase);

// GET /api/v1/cases/:id
router.get('/:id', requireAnyRole, getCaseById);

// PATCH /api/v1/cases/:id
router.patch('/:id', requireInvestigator, updateCase);

// GET /api/v1/cases/:caseId/targets
router.get('/:caseId/targets', requireAnyRole, getTargets);

// POST /api/v1/cases/:caseId/targets
router.post('/:caseId/targets', requireInvestigator, addTarget);

export default router;
