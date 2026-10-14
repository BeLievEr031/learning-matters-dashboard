import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { TeacherFormValues, TeacherStatus } from '../schemas/teachers.schema.ts';
import type {
  AssignedGrade,
  AssignedSubject,
  GradeSubjectsResponse,
  SubjectChaptersResponse,
} from '../types/teacher-workspace.types.ts';
import type { Student, ListStudentsParams } from './students.api.ts';

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

  /**
   * Teacher Workspace: Retrieve grades assigned to logged-in teacher
   */
  getMyAssignedGrades: async (): Promise<AssignedGrade[]> => {
    const response = await apiClient.get<{ data: AssignedGrade[] }>('/teachers/me/grades');
    return response.data.data;
  },

  /**
   * Teacher Workspace: Retrieve all distinct subjects assigned across all grades
   */
  getMyAllAssignedSubjects: async (): Promise<AssignedSubject[]> => {
    const response = await apiClient.get<{ data: AssignedSubject[] }>('/teachers/me/subjects');
    return response.data.data;
  },

  /**
   * Teacher Workspace: Retrieve assigned subjects in a specific grade
   */
  getMyAssignedGradeSubjects: async (gradeId: string): Promise<GradeSubjectsResponse> => {
    const response = await apiClient.get<{ data: GradeSubjectsResponse }>(
      `/teachers/me/grades/${gradeId}/subjects`,
    );
    return response.data.data;
  },

  /**
   * Teacher Workspace: Retrieve active syllabus chapters for an assigned subject
   */
  getMyAssignedSubjectChapters: async (subjectId: string): Promise<SubjectChaptersResponse> => {
    const response = await apiClient.get<{ data: SubjectChaptersResponse }>(
      `/teachers/me/subjects/${subjectId}/chapters`,
    );
    return response.data.data;
  },

  /**
   * Retrieve assigned grades for a specific teacher ID
   */
  getTeacherAssignedGrades: async (teacherId: string): Promise<AssignedGrade[]> => {
    const response = await apiClient.get<{ data: AssignedGrade[] }>(
      `/teachers/${teacherId}/grades`,
    );
    return response.data.data;
  },

  /**
   * Teacher Workspace: Retrieve students of an assigned grade
   */
  getMyAssignedGradeStudents: async (
    gradeId: string,
    params?: ListStudentsParams,
  ): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<PaginatedResponse<Student>>(
      `/teachers/me/grades/${gradeId}/students`,
      { params },
    );
    return response.data;
  },

  /**
   * Teacher Workspace: Retrieve all students across all assigned grades
   */
  getMyAllAssignedStudents: async (
    params?: ListStudentsParams,
  ): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<PaginatedResponse<Student>>(
      '/teachers/me/students',
      { params },
    );
    return response.data;
  },
};
