import { apiClient } from './client.ts';
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
} from '../types/auth.types.ts';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  refresh: async (refreshToken?: string): Promise<RefreshResponse> => {
    const response = await apiClient.post<RefreshResponse>(
      '/auth/refresh',
      refreshToken ? { refreshToken } : {},
    );
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout', { refreshToken });
    return response.data;
  },

  logoutAll: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout-all');
    return response.data;
  },

  getMe: async (): Promise<{ user: AuthUser }> => {
    const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
    return response.data;
  },
};
