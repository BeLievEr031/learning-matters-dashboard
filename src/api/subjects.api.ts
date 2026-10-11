import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { SubjectFormValues, SubjectStatus } from '../schemas/subjects.schema.ts';

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description?: string | null;
  status: SubjectStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface GradeSubjectItem extends Subject {
  gradeSubjectId: string;
  gradeSubjectStatus: 'active' | 'inactive';
}

export interface ListSubjectsParams {
  limit?: number;
  cursor?: string;
  status?: SubjectStatus;
  search?: string;
  sortBy?: 'name' | 'code' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const subjectsApi = {
  listByGrade: async (
    gradeId: string,
    params?: ListSubjectsParams,
  ): Promise<PaginatedResponse<GradeSubjectItem>> => {
    const response = await apiClient.get<PaginatedResponse<GradeSubjectItem>>(
      `/grades/${gradeId}/subjects`,
      { params },
    );
    return response.data;
  },

  assignOrCreate: async (
    gradeId: string,
    data: SubjectFormValues,
  ): Promise<GradeSubjectItem> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<{ data: GradeSubjectItem }>(
      `/grades/${gradeId}/subjects`,
      payload,
    );
    return response.data.data;
  },

  removeGradeAssignment: async (gradeId: string, subjectId: string): Promise<void> => {
    await apiClient.delete(`/grades/${gradeId}/subjects/${subjectId}`);
  },

  getById: async (subjectId: string): Promise<Subject> => {
    const response = await apiClient.get<{ data: Subject }>(`/subjects/${subjectId}`);
    return response.data.data;
  },

  update: async (
    subjectId: string,
    data: Partial<SubjectFormValues>,
  ): Promise<Subject> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: Subject }>(`/subjects/${subjectId}`, payload);
    return response.data.data;
  },

  delete: async (subjectId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}`);
  },
};
