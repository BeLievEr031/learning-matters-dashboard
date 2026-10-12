import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { UserRole } from '../types/auth.types.ts';

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  limit?: number;
  cursor?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: UserRole;
}

export const usersApi = {
  list: async (params?: ListUsersParams): Promise<PaginatedResponse<UserAccount>> => {
    const response = await apiClient.get<PaginatedResponse<UserAccount>>('/users', {
      params,
    });
    return response.data;
  },

  create: async (data: CreateUserPayload): Promise<UserAccount> => {
    const response = await apiClient.post<{ data: UserAccount }>('/users', data);
    return response.data.data;
  },
};
