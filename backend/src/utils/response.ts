/**
 * OSINET Backend — Standard API Response Helpers
 * Enforces consistent JSON response format across all endpoints.
 */
import { Response } from 'express';

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

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response {
  const response: ApiResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    error: { code, message },
  };
  if (details && process.env.NODE_ENV === 'development') {
    response.error!.details = details;
  }
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendNotFound(res: Response, resource = 'Resource'): Response {
  return sendError(res, 404, 'NOT_FOUND', `${resource} not found`);
}

export function sendUnauthorized(res: Response, message = 'Unauthorized'): Response {
  return sendError(res, 401, 'UNAUTHORIZED', message);
}

export function sendForbidden(res: Response, message = 'Forbidden'): Response {
  return sendError(res, 403, 'FORBIDDEN', message);
}

export function sendValidationError(res: Response, details: unknown): Response {
  return sendError(res, 422, 'VALIDATION_ERROR', 'Validation failed', details);
}

export function sendConflict(res: Response, message: string): Response {
  return sendError(res, 409, 'CONFLICT', message);
}
