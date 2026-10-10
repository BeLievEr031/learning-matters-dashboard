import { apiClient } from './client.ts';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
}

export interface ReadinessStatus {
  status: 'ok' | 'degraded';
  services: {
    database: { status: 'up' | 'down'; error?: string };
    redis: { status: 'up' | 'down'; error?: string };
  };
}

export const healthApi = {
  getLiveness: async (): Promise<HealthStatus> => {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  },

  getReadiness: async (): Promise<ReadinessStatus> => {
    const response = await apiClient.get<ReadinessStatus>('/ready');
    return response.data;
  },
};
