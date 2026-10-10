import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';

export type TeacherStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

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
  sortBy?: 'firstName' | 'lastName' | 'employeeId' | 'createdAt' | 'status';
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
};
