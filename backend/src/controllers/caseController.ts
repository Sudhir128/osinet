/**
 * OSINET Backend — Case Controller
 */
import { Request, Response } from 'express';
import * as caseService from '../services/caseService';
import * as auditRepo from '../repositories/auditRepository';
import {
  CreateCaseSchema,
  UpdateCaseSchema,
  CaseQuerySchema,
} from '../validators/caseValidator';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendValidationError,
} from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const listCases = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = CaseQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error.issues);
    return;
  }

  const { data, total } = await caseService.listCases(req.user!, parseResult.data);
  sendSuccess(res, data, 200, {
    total,
    page: parseResult.data.page,
    limit: parseResult.data.limit,
  });
});

export const getCaseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const caseRecord = await caseService.getCaseById(id, req.user!);
  sendSuccess(res, caseRecord);
});

export const createCase = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = CreateCaseSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error.issues);
    return;
  }

  const created = await caseService.createCase(parseResult.data, req.user!);
  sendCreated(res, created);
});

export const updateCase = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = UpdateCaseSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error.issues);
    return;
  }

  const updated = await caseService.updateCase(id, parseResult.data, req.user!);
  sendSuccess(res, updated);
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await caseService.getDashboardStats(req.user!);
  sendSuccess(res, stats);
});

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(String(req.query.limit ?? '50'), 10);
  const offset = parseInt(String(req.query.offset ?? '0'), 10);
  const result = await auditRepo.getAuditLogs({ limit, offset });
  sendSuccess(res, result.data, 200, { total: result.total });
});
