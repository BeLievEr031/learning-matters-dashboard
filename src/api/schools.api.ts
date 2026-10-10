import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { SchoolFormValues } from '../schemas/schools.schema.ts';

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

export interface ListSchoolsParams {
  limit?: number;
  cursor?: string;
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  sortBy?: 'name' | 'code' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const schoolsApi = {
  list: async (params?: ListSchoolsParams): Promise<PaginatedResponse<School>> => {
    const response = await apiClient.get<PaginatedResponse<School>>('/schools', { params });
    return response.data;
  },

  getById: async (id: string): Promise<School> => {
    const response = await apiClient.get<School>(`/schools/${id}`);
    return response.data;
  },

  create: async (data: SchoolFormValues): Promise<School> => {
    // Scrub empty strings to null or undefined
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<School>('/schools', payload);
    return response.data;
  },

  update: async (id: string, data: Partial<SchoolFormValues>): Promise<School> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<School>(`/schools/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/schools/${id}`);
    return response.data;
  },
};
