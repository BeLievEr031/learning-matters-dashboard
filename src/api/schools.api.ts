import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

export const schoolsApi = {
  list: async (params?: { limit?: number; status?: string }): Promise<PaginatedResponse<School>> => {
    const response = await apiClient.get<PaginatedResponse<School>>('/schools', { params });
    return response.data;
  },

  getById: async (id: string): Promise<School> => {
    const response = await apiClient.get<School>(`/schools/${id}`);
    return response.data;
  },
};
