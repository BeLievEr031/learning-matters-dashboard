import { z } from 'zod';

export const auditLogFilterSchema = z.object({
  schoolId: z.string().optional(),
  actorId: z.string().optional(),
  resourceType: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
});

export type AuditLogFilterValues = z.infer<typeof auditLogFilterSchema>;
