import { apiClient } from './client.ts';
import type {
  PrincipalFormValues,
  PrincipalStatus,
} from '../schemas/principals.schema.ts';

export type { PrincipalStatus };

export interface Principal {
  id: string;
  schoolId: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: PrincipalStatus;
  createdAt: string;
  updatedAt: string;
}

export const principalsApi = {
  getBySchool: async (schoolId: string): Promise<Principal | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Principal }>(
        `/schools/${schoolId}/principal`,
      );
      return response.data.data;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { status?: number } }).response?.status === 404
      ) {
        return null;
      }
      throw err;
    }
  },

  upsert: async (
    schoolId: string,
    data: PrincipalFormValues,
  ): Promise<Principal> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.put<{ success: boolean; data: Principal }>(
      `/schools/${schoolId}/principal`,
      payload,
    );
    return response.data.data;
  },
};
