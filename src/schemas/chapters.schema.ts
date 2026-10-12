import { z } from 'zod';

export const CHAPTER_STATUSES = ['active', 'inactive', 'archived'] as const;
export type ChapterStatus = (typeof CHAPTER_STATUSES)[number];

export const chapterFormSchema = z.object({
  chapterNumber: z.coerce
    .number()
    .int('Chapter number must be an integer')
    .positive('Chapter number must be a positive number (1, 2, 3...)'),
  title: z
    .string()
    .trim()
    .min(1, 'Chapter title is required')
    .max(255, 'Chapter title cannot exceed 255 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(CHAPTER_STATUSES).default('active'),
});

export type ChapterFormValues = z.infer<typeof chapterFormSchema>;
