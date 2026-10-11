import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type {
  StudentFormValues,
  StudentStatus,
  StudentGender,
  TransferStudentFormValues,
} from '../schemas/students.schema.ts';

export type { StudentStatus, StudentGender };

export interface Student {
  id: string;
  schoolId: string;
  boardId: string;
  gradeId: string;
  userId?: string | null;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: StudentGender | null;
  email?: string | null;
  phone?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  address?: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ListStudentsParams {
  limit?: number;
  cursor?: string;
  status?: StudentStatus;
  gender?: StudentGender;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'admissionNumber' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const studentsApi = {
  listByGrade: async (
    gradeId: string,
    params?: ListStudentsParams,
  ): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<PaginatedResponse<Student>>(
      `/grades/${gradeId}/students`,
      { params },
    );
    return response.data;
  },

  getById: async (studentId: string): Promise<Student> => {
    const response = await apiClient.get<{ data: Student }>(
      `/students/${studentId}`,
    );
    return response.data.data;
  },

  create: async (
    gradeId: string,
    data: StudentFormValues,
  ): Promise<Student> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<{ data: Student }>(
      `/grades/${gradeId}/students`,
      payload,
    );
    return response.data.data;
  },

  update: async (
    studentId: string,
    data: Partial<StudentFormValues>,
  ): Promise<Student> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: Student }>(
      `/students/${studentId}`,
      payload,
    );
    return response.data.data;
  },

  transfer: async (
    studentId: string,
    data: TransferStudentFormValues,
  ): Promise<Student> => {
    const response = await apiClient.patch<{ data: Student }>(
      `/students/${studentId}/transfer`,
      data,
    );
    return response.data.data;
  },

  delete: async (studentId: string): Promise<void> => {
    await apiClient.delete(`/students/${studentId}`);
  },
};
