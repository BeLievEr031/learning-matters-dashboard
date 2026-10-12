import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { UserRole } from '../types/auth.types.ts';
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from '../schemas/users.schema.ts';

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isActive: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  limit?: number;
  cursor?: string;
}

export const usersApi = {
  list: async (params?: ListUsersParams): Promise<PaginatedResponse<UserAccount>> => {
    const response = await apiClient.get<PaginatedResponse<UserAccount>>('/users', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<UserAccount> => {
    const response = await apiClient.get<{ data: UserAccount }>(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserFormValues): Promise<UserAccount> => {
    const response = await apiClient.post<{ data: UserAccount }>('/users', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserFormValues): Promise<UserAccount> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: UserAccount }>(`/users/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
