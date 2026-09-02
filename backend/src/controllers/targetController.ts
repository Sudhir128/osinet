/**
 * OSINET Backend — Target Controller
 */
import { Request, Response } from 'express';
import * as targetService from '../services/targetService';
import { CreateTargetSchema } from '../validators/targetValidator';
import {
  sendSuccess,
  sendCreated,
  sendValidationError,
} from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getTargets = asyncHandler(async (req: Request, res: Response) => {
  const { caseId } = req.params;
  const targets = await targetService.getTargetsForCase(caseId, req.user!);
  sendSuccess(res, targets);
});

export const addTarget = asyncHandler(async (req: Request, res: Response) => {
  const { caseId } = req.params;
  const parseResult = CreateTargetSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error.issues);
    return;
  }

  const result = await targetService.addTarget(caseId, parseResult.data, req.user!);
  sendCreated(res, {
    target: result.target,
    normalized_value: result.normalized_value,
    normalization_warnings: result.normalization_warnings,
  });
});
