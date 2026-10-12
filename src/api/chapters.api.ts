import { apiClient } from './client.ts';
import type { PaginatedResponse } from '../types/api.types.ts';
import type { ChapterFormValues, ChapterStatus } from '../schemas/chapters.schema.ts';

export interface Chapter {
  id: string;
  schoolId: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  description?: string | null;
  status: ChapterStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ListChaptersParams {
  limit?: number;
  cursor?: string;
  status?: ChapterStatus;
  search?: string;
  sortBy?: 'chapterNumber' | 'title' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ReorderChapterItem {
  id: string;
  chapterNumber: number;
}

export const chaptersApi = {
  listBySubject: async (
    subjectId: string,
    params?: ListChaptersParams,
  ): Promise<PaginatedResponse<Chapter>> => {
    const response = await apiClient.get<PaginatedResponse<Chapter>>(
      `/subjects/${subjectId}/chapters`,
      { params },
    );
    return response.data;
  },

  getById: async (chapterId: string): Promise<Chapter> => {
    const response = await apiClient.get<{ data: Chapter }>(`/chapters/${chapterId}`);
    return response.data.data;
  },

  create: async (
    subjectId: string,
    data: ChapterFormValues,
  ): Promise<Chapter> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    const response = await apiClient.post<{ data: Chapter }>(
      `/subjects/${subjectId}/chapters`,
      payload,
    );
    return response.data.data;
  },

  update: async (
    chapterId: string,
    data: Partial<ChapterFormValues>,
  ): Promise<Chapter> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const response = await apiClient.patch<{ data: Chapter }>(
      `/chapters/${chapterId}`,
      payload,
    );
    return response.data.data;
  },

  delete: async (chapterId: string): Promise<void> => {
    await apiClient.delete(`/chapters/${chapterId}`);
  },

  reorder: async (
    subjectId: string,
    items: ReorderChapterItem[],
  ): Promise<{ data: Chapter[] }> => {
    const response = await apiClient.patch<{ data: Chapter[] }>(
      `/subjects/${subjectId}/chapters/reorder`,
      { chapters: items },
    );
    return response.data;
  },
};
