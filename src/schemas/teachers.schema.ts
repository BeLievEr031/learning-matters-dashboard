import { z } from 'zod';

export const TEACHER_STATUSES = ['active', 'inactive', 'on_leave', 'terminated'] as const;
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export const teacherFormSchema = z.object({
  employeeId: z
    .string()
    .min(1, 'Employee ID is required')
    .max(50, 'Employee ID must not exceed 50 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must not exceed 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must not exceed 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  phone: z
    .string()
    .max(20, 'Phone must not exceed 20 characters')
    .optional(),
  qualification: z
    .string()
    .max(255, 'Qualification must not exceed 255 characters')
    .optional(),
  joiningDate: z
    .string()
    .optional(),
  status: z.enum(TEACHER_STATUSES),
});

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;
