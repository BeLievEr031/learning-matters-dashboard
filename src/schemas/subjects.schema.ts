import { z } from 'zod';

export const SUBJECT_STATUSES = ['active', 'inactive', 'archived'] as const;
export type SubjectStatus = (typeof SUBJECT_STATUSES)[number];

export const subjectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Subject name is required')
    .max(255, 'Subject name must not exceed 255 characters'),
  code: z
    .string()
    .min(1, 'Subject code is required')
    .max(50, 'Subject code must not exceed 50 characters')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Code can only contain alphanumeric characters, hyphens, and underscores',
    ),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: z.enum(SUBJECT_STATUSES),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
