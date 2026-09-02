/**
 * OSINET Backend — v1 API Router
 */
import { Router } from 'express';
import healthRouter from './health';
import casesRouter from './cases';

const router = Router();

router.use('/health', healthRouter);
router.use('/cases', casesRouter);

// Future routes (Phase 2+):
// router.use('/entities', entitiesRouter);
// router.use('/providers', providersRouter);
// router.use('/reports', reportsRouter);
// router.use('/admin', adminRouter);

export default router;
