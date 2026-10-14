import { useQuery } from '@tanstack/react-query';
import { teachersApi } from '../api/teachers.api.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { Student, ListStudentsParams } from '../api/students.api.ts';
import type {
  AssignedGrade,
  AssignedSubject,
  GradeSubjectsResponse,
  SubjectChaptersResponse,
} from '../types/teacher-workspace.types.ts';

/**
 * Hook to retrieve all grades assigned to the authenticated teacher
 */
export function useTeacherGrades() {
  return useQuery<AssignedGrade[]>({
    queryKey: ['teacher', 'grades'],
    queryFn: () => teachersApi.getMyAssignedGrades(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

/**
 * Hook to retrieve all distinct subjects assigned to the authenticated teacher across grades
 */
export function useTeacherSubjects() {
  return useQuery<AssignedSubject[]>({
    queryKey: ['teacher', 'subjects'],
    queryFn: () => teachersApi.getMyAllAssignedSubjects(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to retrieve subjects assigned to the teacher within a specific grade
 */
export function useTeacherGradeSubjects(gradeId?: string) {
  return useQuery<GradeSubjectsResponse>({
    queryKey: ['teacher', 'grade-subjects', gradeId],
    queryFn: () => {
      if (!gradeId) throw new Error('gradeId is required');
      return teachersApi.getMyAssignedGradeSubjects(gradeId);
    },
    enabled: Boolean(gradeId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to retrieve syllabus chapters for an assigned subject
 */
export function useTeacherSubjectChapters(subjectId?: string) {
  return useQuery<SubjectChaptersResponse>({
    queryKey: ['teacher', 'subject-chapters', subjectId],
    queryFn: () => {
      if (!subjectId) throw new Error('subjectId is required');
      return teachersApi.getMyAssignedSubjectChapters(subjectId);
    },
    enabled: Boolean(subjectId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to retrieve students of an assigned grade
 */
export function useTeacherGradeStudents(gradeId?: string, params?: ListStudentsParams) {
  return useQuery<PaginatedResponse<Student>>({
    queryKey: ['teacher', 'grade-students', gradeId, params],
    queryFn: () => {
      if (!gradeId) throw new Error('gradeId is required');
      return teachersApi.getMyAssignedGradeStudents(gradeId, params);
    },
    enabled: Boolean(gradeId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to retrieve all students across all assigned grades
 */
export function useTeacherAllStudents(params?: ListStudentsParams) {
  return useQuery<PaginatedResponse<Student>>({
    queryKey: ['teacher', 'all-students', params],
    queryFn: () => teachersApi.getMyAllAssignedStudents(params),
    staleTime: 1000 * 60 * 2,
  });
}
