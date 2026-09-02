/**
 * OSINET Backend — Target Repository
 * Data access layer for investigation targets.
 */
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import type { Target } from '../types';

export async function findTargetsByCaseId(caseId: string): Promise<Target[]> {
  const { data, error } = await supabase
    .from('targets')
    .select('*, profiles!targets_created_by_fkey(display_name)')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('[TargetRepo] Error fetching targets', { caseId, error: error.message });
    throw new AppError(`Failed to fetch targets: ${error.message}`, 500, 'DB_ERROR');
  }

  return (data as Target[]) ?? [];
}

export async function findTargetById(id: string): Promise<Target | null> {
  const { data, error } = await supabase
    .from('targets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new AppError(`Failed to fetch target: ${error.message}`, 500, 'DB_ERROR');
  }

  return data as Target;
}

export async function createTarget(params: {
  caseId: string;
  type: string;
  rawValue: string;
  normalizedValue: string;
  notes?: string;
  createdBy: string;
}): Promise<Target> {
  const { data, error } = await supabase
    .from('targets')
    .insert({
      case_id: params.caseId,
      type: params.type,
      raw_value: params.rawValue,
      normalized_value: params.normalizedValue,
      notes: params.notes ?? null,
      created_by: params.createdBy,
    })
    .select()
    .single();

  if (error) {
    logger.error('[TargetRepo] Error creating target', { error: error.message });
    throw new AppError(`Failed to create target: ${error.message}`, 500, 'DB_ERROR');
  }

  return data as Target;
}

export async function findDuplicateTarget(
  caseId: string,
  type: string,
  normalizedValue: string
): Promise<Target | null> {
  const { data, error } = await supabase
    .from('targets')
    .select('*')
    .eq('case_id', caseId)
    .eq('type', type)
    .eq('normalized_value', normalizedValue)
    .maybeSingle();

  if (error) {
    logger.error('[TargetRepo] Error checking duplicate', { error: error.message });
    return null; // Non-fatal: allow creation if check fails
  }

  return data as Target | null;
}
