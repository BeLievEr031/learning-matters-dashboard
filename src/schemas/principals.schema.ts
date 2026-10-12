import { z } from 'zod';

export const PRINCIPAL_STATUSES = ['active', 'inactive'] as const;

export type PrincipalStatus = (typeof PRINCIPAL_STATUSES)[number];

export const principalFormSchema = z.object({
  userId: z.string().min(1, 'User account is required'),
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
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(20, 'Phone must not exceed 20 characters').optional(),
  status: z.enum(PRINCIPAL_STATUSES),
});

export type PrincipalFormValues = z.infer<typeof principalFormSchema>;
