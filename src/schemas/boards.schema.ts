import { z } from 'zod';

export const BOARD_STATUSES = ['active', 'inactive', 'archived'] as const;
export type BoardStatus = (typeof BOARD_STATUSES)[number];

export const boardFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Board name is required')
    .max(255, 'Board name must not exceed 255 characters'),
  code: z
    .string()
    .min(1, 'Board code is required')
    .max(50, 'Board code must not exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: z.enum(BOARD_STATUSES),
});

export type BoardFormValues = z.infer<typeof boardFormSchema>;
