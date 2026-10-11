import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env.ts';
import { useAuthStore } from '../store/auth.store.ts';
import type { ApiErrorResponse } from '../types/api.types.ts';
import type { RefreshResponse } from '../types/auth.types.ts';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request queue for handling simultaneous requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

// Request Interceptor: Attach Bearer Token & Active School ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken, activeSchoolId } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (activeSchoolId && config.headers) {
      config.headers['x-school-id'] = activeSchoolId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 & Automatic Refresh Token Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const { refreshToken, logout, setTokens } = useAuthStore.getState();

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<RefreshResponse>(
          `${ENV.API_BASE_URL}/auth/refresh`,
          refreshToken ? { refreshToken } : {},
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          },
        );

        const newAccessToken =
          response.data.tokens?.accessToken ?? response.data.accessToken ?? '';
        const newRefreshToken =
          response.data.tokens?.refreshToken ?? response.data.refreshToken ?? '';

        if (newAccessToken) {
          setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        }

        processQueue(null, newAccessToken || null);

        if (originalRequest.headers && newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Helper to extract clean error messages from server response
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data as ApiErrorResponse | undefined;
    if (serverError?.error?.message) {
      return serverError.error.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
