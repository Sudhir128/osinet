/**
 * OSINET Backend — Request Logger Middleware
 * Logs all requests with method, path, status, and duration.
 * Masks Authorization headers in logs.
 */
import morgan from 'morgan';
import { logger } from '../utils/logger';
import { config } from '../config/env';

morgan.token('masked-auth', (req) => {
  const auth = req.headers.authorization;
  if (!auth) return 'none';
  if (auth.startsWith('Bearer ')) return 'Bearer [REDACTED]';
  return '[REDACTED]';
});

const FORMAT = config.isDevelopment
  ? ':method :url :status :response-time ms'
  : ':method :url :status :response-time ms :remote-addr';

export const requestLogger = morgan(FORMAT, {
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    },
  },
});
