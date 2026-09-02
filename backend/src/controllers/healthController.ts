/**
 * OSINET Backend — Health Controller
 */
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();

  // Check Supabase connectivity
  let supabaseStatus: 'ok' | 'error' = 'ok';
  let supabaseLatency: number | undefined;

  try {
    const t0 = Date.now();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    supabaseLatency = Date.now() - t0;
    if (error) {
      supabaseStatus = 'error';
      logger.warn('[Health] Supabase connectivity check failed', { error: error.message });
    }
  } catch (err) {
    supabaseStatus = 'error';
    logger.warn('[Health] Supabase connectivity check threw', { error: String(err) });
  }

  sendSuccess(res, {
    status: 'ok',
    version: '0.1.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTimeMs: Date.now() - startTime,
    services: {
      supabase: {
        status: supabaseStatus,
        latencyMs: supabaseLatency,
      },
    },
  });
}
