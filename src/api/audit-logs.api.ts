import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actorRole?: string | null;
  schoolId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  diff?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface ListAuditLogsParams {
  limit?: number;
  cursor?: string;
  schoolId?: string;
  actorId?: string;
  resourceType?: string;
  action?: string;
}

export const auditLogsApi = {
  list: async (
    params?: ListAuditLogsParams,
  ): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      '/audit-logs',
      { params },
    );
    return response.data;
  },

  getById: async (id: string): Promise<AuditLog> => {
    const response = await apiClient.get<{ data: AuditLog }>(
      `/audit-logs/${id}`,
    );
    return response.data.data;
  },
};
