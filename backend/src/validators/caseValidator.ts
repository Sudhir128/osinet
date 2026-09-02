/**
 * OSINET Backend — Case Validators (Zod)
 */
import { z } from 'zod';

const CaseStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'ARCHIVED']);
const CasePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const CreateCaseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  client_ref: z.string().max(100).trim().optional(),
  priority: CasePriorityEnum.default('MEDIUM'),
  jurisdiction: z.string().max(100).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  retention_at: z
    .string()
    .datetime({ message: 'retention_at must be a valid ISO 8601 datetime' })
    .optional(),
});

export const UpdateCaseSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  client_ref: z.string().max(100).trim().optional(),
  status: CaseStatusEnum.optional(),
  priority: CasePriorityEnum.optional(),
  jurisdiction: z.string().max(100).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  retention_at: z.string().datetime().optional(),
});

export const CaseQuerySchema = z.object({
  status: CaseStatusEnum.optional(),
  priority: CasePriorityEnum.optional(),
  search: z.string().max(200).trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;
export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;
export type CaseQueryInput = z.infer<typeof CaseQuerySchema>;
