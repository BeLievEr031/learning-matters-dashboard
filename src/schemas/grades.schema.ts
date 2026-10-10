import { z } from 'zod';

export const GRADE_STATUSES = ['active', 'inactive', 'archived'] as const;
export type GradeStatus = (typeof GRADE_STATUSES)[number];

export const gradeFormSchema = z.object({
  boardId: z.string().uuid('Please select a curriculum board'),
  name: z
    .string()
    .min(1, 'Grade name is required')
    .max(255, 'Grade name must not exceed 255 characters'),
  code: z
    .string()
    .min(1, 'Grade code is required')
    .max(50, 'Grade code must not exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain alphanumeric characters, hyphens, and underscores'),
  gradeNumber: z
    .number()
    .int('Grade number must be an integer')
    .min(0, 'Grade number must be 0 (KG/Prep) or greater'),
  section: z
    .string()
    .max(50, 'Section must not exceed 50 characters')
    .nullable()
    .optional(),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .nullable()
    .optional(),
  status: z.enum(GRADE_STATUSES),
});

export const assignClassTeacherSchema = z.object({
  teacherId: z.string().uuid('Invalid teacher ID format').nullable().optional(),
});

export type GradeFormValues = z.infer<typeof gradeFormSchema>;
export type AssignClassTeacherValues = z.infer<typeof assignClassTeacherSchema>;
