import axios from 'axios';
import { ENV } from '../config/env.ts';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
}

export interface ReadinessStatus {
  status: 'ok' | 'ready' | 'degraded' | 'unhealthy';
  db?: 'up' | 'down';
  redis?: 'up' | 'down';
  checks?: {
    database?: 'ok' | 'error';
    redis?: 'ok' | 'error';
  };
  services?: {
    database?: { status: 'up' | 'down'; error?: string };
    redis?: { status: 'up' | 'down'; error?: string };
  };
  timestamp?: string;
  error?: string;
}

const rootBaseUrl = ENV.API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const healthApi = {
  getLiveness: async (): Promise<HealthStatus> => {
    const response = await axios.get<HealthStatus>(`${rootBaseUrl}/health`);
    return response.data;
  },

  getReadiness: async (): Promise<ReadinessStatus> => {
    const response = await axios.get<ReadinessStatus>(`${rootBaseUrl}/ready`);
    return response.data;
  },
};
