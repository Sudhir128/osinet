/**
 * OSINET Backend — Target Validators (Zod)
 */
import { z } from 'zod';

export const TargetTypeEnum = z.enum([
  'PERSON',
  'EMAIL',
  'PHONE',
  'USERNAME',
  'DOMAIN',
  'IP',
  'COMPANY',
  'URL',
]);

export const CreateTargetSchema = z.object({
  type: TargetTypeEnum,
  raw_value: z
    .string()
    .min(1, 'Target value cannot be empty')
    .max(2000, 'Target value too long')
    .trim(),
  notes: z.string().max(2000).trim().optional(),
});

export type CreateTargetInput = z.infer<typeof CreateTargetSchema>;
