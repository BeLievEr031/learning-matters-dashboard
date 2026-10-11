import { z } from 'zod';

export const ASSIGNMENT_STATUSES = ['active', 'inactive'] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const assignmentFormSchema = z.object({
  teacherId: z.string().uuid('Please select a valid teacher'),
  gradeId: z.string().uuid('Please select a valid grade level / section'),
  subjectId: z.string().uuid('Please select a valid subject course'),
  effectiveDate: z.string().optional(),
  status: z.enum(ASSIGNMENT_STATUSES),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
