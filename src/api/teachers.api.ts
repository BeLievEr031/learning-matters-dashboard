import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { TeacherFormValues, TeacherStatus } from '../schemas/teachers.schema.ts';

export type { TeacherStatus };

export interface Teacher {
  id: string;
  schoolId: string;
  userId?: string | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  joiningDate?: string | null;
  qualification?: string | null;
  status: TeacherStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListTeachersParams {
  limit?: number;
  cursor?: string;
  status?: TeacherStatus;
  search?: string;
  sortBy?:
    | 'firstName'
    | 'lastName'
    | 'employeeId'
    | 'email'
    | 'joiningDate'
    | 'createdAt'
    | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const teachersApi = {
  listBySchool: async (
    schoolId: string,
    params?: ListTeachersParams,
  ): Promise<PaginatedResponse<Teacher>> => {
    const response = await apiClient.get<PaginatedResponse<Teacher>>(
      `/schools/${schoolId}/teachers`,
      { params },
    );
    return response.data;
  },

  getById: async (teacherId: string): Promise<Teacher> => {
    const response = await apiClient.get<{ data: Teacher }>(`/teachers/${teacherId}`);
    return response.data.data;
  },

  create: async (schoolId: string, data: TeacherFormValues): Promise<Teacher> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<{ data: Teacher }>(
      `/schools/${schoolId}/teachers`,
      payload,
    );
    return response.data.data;
  },

  update: async (
    teacherId: string,
    data: Partial<TeacherFormValues>,
  ): Promise<Teacher> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: Teacher }>(
      `/teachers/${teacherId}`,
      payload,
    );
    return response.data.data;
  },

  delete: async (teacherId: string): Promise<void> => {
    await apiClient.delete(`/teachers/${teacherId}`);
  },
};
