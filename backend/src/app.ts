/**
 * OSINET Backend — Express Application
 * Sets up all middleware, routes, and error handling.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import v1Router from './routes/v1/index';
import { logger } from './utils/logger';
import { sendError } from './utils/response';

const app = express();

// ========================
// Security Middleware
// ========================
app.use(helmet({
  contentSecurityPolicy: config.isProduction,
  crossOriginEmbedderPolicy: config.isProduction,
}));

app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
  },
});
app.use('/api', limiter);

// ========================
// Parsing & Logging
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ========================
// API Routes
// ========================
app.use('/api/v1', v1Router);

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  sendError(res, 404, 'ENDPOINT_NOT_FOUND', `Endpoint ${req.method} ${req.path} not found`);
});

// ========================
// Frontend passthrough (for future SSR/proxy if needed)
// ========================
app.get('/api-info', (req, res) => {
  res.json({
    name: 'OSINET API',
    version: '0.1.0',
    environment: config.server.nodeEnv,
    docs: 'See README.md for API documentation',
  });
});

// ========================
// Centralized Error Handler — must be last
// ========================
app.use(errorHandler);

logger.info('[App] Express application configured');

export default app;
