import { z } from 'zod';

export const schoolStatusEnum = z.enum(['active', 'inactive', 'suspended']);

export const schoolFormSchema = z.object({
  name: z.string().min(1, 'School name is required').max(255),
  code: z
    .string()
    .min(1, 'School code is required')
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase()),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  status: schoolStatusEnum,
});

export type SchoolFormValues = z.infer<typeof schoolFormSchema>;
