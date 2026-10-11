import { z } from 'zod';

export const STUDENT_STATUSES = [
  'active',
  'inactive',
  'transferred',
  'graduated',
  'suspended',
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const STUDENT_GENDERS = ['male', 'female', 'other'] as const;

export type StudentGender = (typeof STUDENT_GENDERS)[number];

export const studentFormSchema = z.object({
  admissionNumber: z
    .string()
    .min(1, 'Admission number is required')
    .max(50, 'Admission number must not exceed 50 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must not exceed 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must not exceed 100 characters'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(STUDENT_GENDERS).optional(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .or(z.literal(''))
    .optional(),
  phone: z.string().max(20, 'Phone must not exceed 20 characters').optional(),
  guardianName: z.string().max(200, 'Guardian name must not exceed 200 characters').optional(),
  guardianPhone: z.string().max(20, 'Guardian phone must not exceed 20 characters').optional(),
  guardianEmail: z
    .string()
    .email('Invalid guardian email address')
    .max(255)
    .or(z.literal(''))
    .optional(),
  address: z.string().max(500, 'Address must not exceed 500 characters').optional(),
  status: z.enum(STUDENT_STATUSES),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

export const transferStudentSchema = z.object({
  targetGradeId: z.string().min(1, 'Target grade is required'),
});

export type TransferStudentFormValues = z.infer<typeof transferStudentSchema>;
