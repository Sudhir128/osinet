/**
 * OSINET Backend — Structured Logger
 * Uses Winston. Masks sensitive patterns in log output.
 * Does NOT log API keys, tokens, or credentials.
 */
import winston from 'winston';
import { config } from '../config/env';

const SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|token|secret|password|credential|auth)[=:\s]+\S+/gi,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWT pattern
  /sk[-_][A-Za-z0-9]+/g, // Generic secret key pattern
];

function maskSensitive(message: string): string {
  let masked = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    masked = masked.replace(pattern, '[REDACTED]');
  }
  return masked;
}

const maskingFormat = winston.format((info) => {
  if (typeof info.message === 'string') {
    info.message = maskSensitive(info.message);
  }
  return info;
});

export const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    maskingFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    config.isDevelopment
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length
              ? ' ' + JSON.stringify(meta)
              : '';
            return `${timestamp} [${level}]: ${message}${metaStr}`;
          })
        )
      : winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
});
