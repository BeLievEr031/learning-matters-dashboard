import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type {
  AssignmentFormValues,
  AssignmentStatus,
} from '../schemas/assignments.schema.ts';

export type { AssignmentStatus };

export interface TeacherAssignmentDetail {
  id: string;
  schoolId: string;
  teacherId: string;
  gradeId: string;
  subjectId: string;
  assignedBy?: string | null;
  status: AssignmentStatus;
  effectiveDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  teacherFirstName?: string | null;
  teacherLastName?: string | null;
  teacherEmail?: string | null;
  teacherEmployeeId?: string | null;
  gradeName?: string | null;
  gradeCode?: string | null;
  subjectName?: string | null;
  subjectCode?: string | null;
}

export interface ListAssignmentsParams {
  limit?: number;
  cursor?: string;
  schoolId?: string;
  teacherId?: string;
  gradeId?: string;
  subjectId?: string;
  status?: AssignmentStatus;
  search?: string;
  sortBy?: 'createdAt' | 'effectiveDate' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const assignmentsApi = {
  list: async (
    params?: ListAssignmentsParams,
  ): Promise<PaginatedResponse<TeacherAssignmentDetail>> => {
    const response = await apiClient.get<
      PaginatedResponse<TeacherAssignmentDetail>
    >('/teacher-assignments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<TeacherAssignmentDetail> => {
    const response = await apiClient.get<{ data: TeacherAssignmentDetail }>(
      `/teacher-assignments/${id}`,
    );
    return response.data.data;
  },

  create: async (
    data: AssignmentFormValues,
  ): Promise<TeacherAssignmentDetail> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<{ data: TeacherAssignmentDetail }>(
      '/teacher-assignments',
      payload,
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<AssignmentFormValues>,
  ): Promise<TeacherAssignmentDetail> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: TeacherAssignmentDetail }>(
      `/teacher-assignments/${id}`,
      payload,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teacher-assignments/${id}`);
  },
};
