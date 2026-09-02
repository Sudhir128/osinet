/**
 * OSINET Backend — Audit Log Repository
 * Writes audit events to the audit_logs table.
 * Failures are logged but never cause the parent operation to fail.
 */
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import type { AuditAction } from '../types';

export interface CreateAuditParams {
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function createAuditLog(params: CreateAuditParams): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      actor_id: params.actorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? null,
      ip_address: params.ipAddress ?? null,
    });

    if (error) {
      logger.error('[AuditRepo] Failed to write audit log', {
        action: params.action,
        entityType: params.entityType,
        error: error.message,
      });
    }
  } catch (err) {
    logger.error('[AuditRepo] Unexpected error writing audit log', {
      error: String(err),
    });
  }
}

export async function getAuditLogs(options: {
  limit?: number;
  offset?: number;
  entityType?: string;
  entityId?: string;
  actorId?: string;
}) {
  const { limit = 50, offset = 0, entityType, entityId, actorId } = options;

  let query = supabase
    .from('audit_logs')
    .select('*, profiles(display_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (entityType) query = query.eq('entity_type', entityType);
  if (entityId) query = query.eq('entity_id', entityId);
  if (actorId) query = query.eq('actor_id', actorId);

  const { data, error, count } = await query;

  if (error) {
    logger.error('[AuditRepo] Error fetching audit logs', { error: error.message });
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  return { data: data ?? [], total: count ?? 0 };
}
