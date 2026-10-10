import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { BoardFormValues, BoardStatus } from '../schemas/boards.schema.ts';

export interface Board {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description?: string | null;
  status: BoardStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ListBoardsParams {
  limit?: number;
  cursor?: string;
  status?: BoardStatus;
  search?: string;
  sortBy?: 'name' | 'code' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const boardsApi = {
  list: async (schoolId: string, params?: ListBoardsParams): Promise<PaginatedResponse<Board>> => {
    const response = await apiClient.get<PaginatedResponse<Board>>(`/schools/${schoolId}/boards`, {
      params,
    });
    return response.data;
  },

  getById: async (boardId: string): Promise<Board> => {
    const response = await apiClient.get<{ data: Board }>(`/boards/${boardId}`);
    return response.data.data;
  },

  create: async (schoolId: string, data: BoardFormValues): Promise<Board> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<{ data: Board }>(`/schools/${schoolId}/boards`, payload);
    return response.data.data;
  },

  update: async (boardId: string, data: Partial<BoardFormValues>): Promise<Board> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: Board }>(`/boards/${boardId}`, payload);
    return response.data.data;
  },

  delete: async (boardId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}`);
  },
};
