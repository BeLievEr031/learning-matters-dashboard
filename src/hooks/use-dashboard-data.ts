import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store.ts';
import { healthApi } from '../api/health.api.ts';
import { schoolsApi } from '../api/schools.api.ts';
import { apiClient } from '../api/client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';

export function useDashboardData() {
  const { user, activeSchoolId, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const isSuperAdmin = effectiveRole === 'super_admin';
  const effectiveSchoolId = activeSchoolId || user?.schoolId || null;

  // System Health query
  const healthQuery = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => healthApi.getLiveness(),
    staleTime: 1000 * 30, // 30s
    refetchInterval: 1000 * 60, // 1 min poll
  });

  // System Readiness query
  const readinessQuery = useQuery({
    queryKey: ['system', 'readiness'],
    queryFn: () => healthApi.getReadiness(),
    staleTime: 1000 * 30,
    retry: 1,
  });

  // Global Schools count (super admin)
  const schoolsQuery = useQuery({
    queryKey: ['dashboard', 'schools-count'],
    queryFn: () => schoolsApi.list({ limit: 100 }),
    enabled: isSuperAdmin,
  });

  // Global Users count (super admin / admin)
  const usersQuery = useQuery({
    queryKey: ['dashboard', 'users-count', effectiveSchoolId],
    queryFn: async () => {
      const url = effectiveSchoolId ? `/users?schoolId=${effectiveSchoolId}` : '/users';
      const res = await apiClient.get<PaginatedResponse<unknown>>(url);
      return res.data;
    },
    enabled: isSuperAdmin || effectiveRole === 'admin',
  });

  // School-scoped counts (students, teachers, grades, boards)
  const schoolStudentsQuery = useQuery({
    queryKey: ['dashboard', 'students-count', effectiveSchoolId],
    queryFn: async () => {
      if (!effectiveSchoolId) return { data: [], meta: { total: 0 } };
      const res = await apiClient.get<PaginatedResponse<unknown>>(
        `/schools/${effectiveSchoolId}/students`,
      );
      return res.data;
    },
    enabled: Boolean(effectiveSchoolId),
  });

  const schoolTeachersQuery = useQuery({
    queryKey: ['dashboard', 'teachers-count', effectiveSchoolId],
    queryFn: async () => {
      if (!effectiveSchoolId) return { data: [], meta: { total: 0 } };
      const res = await apiClient.get<PaginatedResponse<unknown>>(
        `/schools/${effectiveSchoolId}/teachers`,
      );
      return res.data;
    },
    enabled: Boolean(effectiveSchoolId),
  });

  const schoolGradesQuery = useQuery({
    queryKey: ['dashboard', 'grades-count', effectiveSchoolId],
    queryFn: async () => {
      if (!effectiveSchoolId) return { data: [], meta: { total: 0 } };
      const res = await apiClient.get<PaginatedResponse<unknown>>(
        `/schools/${effectiveSchoolId}/grades`,
      );
      return res.data;
    },
    enabled: Boolean(effectiveSchoolId),
  });

  const schoolBoardsQuery = useQuery({
    queryKey: ['dashboard', 'boards-count', effectiveSchoolId],
    queryFn: async () => {
      if (!effectiveSchoolId) return { data: [], meta: { total: 0 } };
      const res = await apiClient.get<PaginatedResponse<unknown>>(
        `/schools/${effectiveSchoolId}/boards`,
      );
      return res.data;
    },
    enabled: Boolean(effectiveSchoolId),
  });

  const isLoading =
    healthQuery.isLoading ||
    (isSuperAdmin && schoolsQuery.isLoading) ||
    schoolStudentsQuery.isLoading;

  return {
    health: healthQuery.data,
    readiness: readinessQuery.data,
    isHealthy: healthQuery.data?.status === 'ok',
    counts: {
      schools: schoolsQuery.data?.meta?.total ?? schoolsQuery.data?.data?.length ?? 0,
      users: usersQuery.data?.meta?.total ?? usersQuery.data?.data?.length ?? 0,
      students: schoolStudentsQuery.data?.meta?.total ?? schoolStudentsQuery.data?.data?.length ?? 0,
      teachers: schoolTeachersQuery.data?.meta?.total ?? schoolTeachersQuery.data?.data?.length ?? 0,
      grades: schoolGradesQuery.data?.meta?.total ?? schoolGradesQuery.data?.data?.length ?? 0,
      boards: schoolBoardsQuery.data?.meta?.total ?? schoolBoardsQuery.data?.data?.length ?? 0,
    },
    recentSchools: schoolsQuery.data?.data?.slice(0, 5) ?? [],
    isLoading,
  };
}
