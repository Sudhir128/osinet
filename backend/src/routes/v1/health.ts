/**
 * OSINET Backend — Health Route
 */
import { Router } from 'express';
import { healthCheck } from '../../controllers/healthController';

const router = Router();

// GET /api/v1/health
router.get('/', healthCheck);

export default router;
