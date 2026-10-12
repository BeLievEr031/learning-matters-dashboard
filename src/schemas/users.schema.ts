import { z } from 'zod';
import type { UserRole } from '../types/auth.types.ts';

export const USER_ROLES: readonly UserRole[] = [
  'super_admin',
  'admin',
  'principal',
  'class_teacher',
  'teacher',
  'student',
] as const;

export const createUserFormSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([
    'super_admin',
    'admin',
    'principal',
    'class_teacher',
    'teacher',
    'student',
  ] as const),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const updateUserFormSchema = z.object({
  email: z.string().email('Invalid email address').max(255).optional(),
  role: z
    .enum([
      'super_admin',
      'admin',
      'principal',
      'class_teacher',
      'teacher',
      'student',
    ] as const)
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
