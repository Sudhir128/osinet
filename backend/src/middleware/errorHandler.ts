/**
 * OSINET Backend — Centralized Error Handler
 * Must be registered as the last middleware in Express.
 * Never exposes stack traces in production.
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`[ErrorHandler] Operational error: ${err.code} — ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Unexpected errors — log with detail, respond safely
  logger.error('[ErrorHandler] Unexpected error', {
    message: err.message,
    stack: config.isDevelopment ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
    },
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
