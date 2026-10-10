import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { GradeFormValues, GradeStatus } from '../schemas/grades.schema.ts';
import type { Teacher } from './teachers.api.ts';

export interface Grade {
  id: string;
  schoolId: string;
  boardId: string;
  name: string;
  code: string;
  gradeNumber: number;
  section?: string | null;
  capacity?: number | null;
  classTeacherId?: string | null;
  classTeacher?: Teacher | null;
  status: GradeStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ListGradesParams {
  limit?: number;
  cursor?: string;
  status?: GradeStatus;
  section?: string;
  gradeNumber?: number;
  search?: string;
  sortBy?: 'name' | 'code' | 'gradeNumber' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const gradesApi = {
  list: async (
    boardId: string,
    params?: ListGradesParams,
  ): Promise<PaginatedResponse<Grade>> => {
    const response = await apiClient.get<PaginatedResponse<Grade>>(
      `/boards/${boardId}/grades`,
      { params },
    );
    return response.data;
  },

  getById: async (gradeId: string): Promise<Grade> => {
    const response = await apiClient.get<{ data: Grade }>(`/grades/${gradeId}`);
    return response.data.data;
  },

  create: async (boardId: string, data: Omit<GradeFormValues, 'boardId'>): Promise<Grade> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<{ data: Grade }>(
      `/boards/${boardId}/grades`,
      payload,
    );
    return response.data.data;
  },

  update: async (
    gradeId: string,
    data: Partial<Omit<GradeFormValues, 'boardId'>>,
  ): Promise<Grade> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: Grade }>(`/grades/${gradeId}`, payload);
    return response.data.data;
  },

  delete: async (gradeId: string): Promise<void> => {
    await apiClient.delete(`/grades/${gradeId}`);
  },

  assignClassTeacher: async (
    gradeId: string,
    teacherId: string | null,
  ): Promise<Grade> => {
    const response = await apiClient.put<{ data: Grade }>(
      `/grades/${gradeId}/class-teacher`,
      { teacherId },
    );
    return response.data.data;
  },

  getClassTeacher: async (gradeId: string): Promise<Teacher | null> => {
    const response = await apiClient.get<{ data: Teacher | null }>(
      `/grades/${gradeId}/class-teacher`,
    );
    return response.data.data;
  },
};
