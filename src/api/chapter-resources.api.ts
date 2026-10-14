import { apiClient } from './client.ts';
import type {
  ChapterMaterial,
  ListMaterialsParams,
  CreateMaterialPayload,
  ChapterNote,
  ListNotesParams,
  CreateNotePayload,
  UpdateNotePayload,
} from '../types/teacher-workspace.types.ts';

export const chapterResourcesApi = {
  // ==========================================
  // CHAPTER MATERIALS
  // ==========================================

  /**
   * List all learning materials for a chapter
   */
  listMaterials: async (
    chapterId: string,
    params?: ListMaterialsParams,
  ): Promise<ChapterMaterial[]> => {
    const response = await apiClient.get<{ data: ChapterMaterial[] }>(
      `/chapters/${chapterId}/materials`,
      { params },
    );
    return response.data.data;
  },

  /**
   * Retrieve single material by ID
   */
  getMaterialById: async (
    chapterId: string,
    materialId: string,
  ): Promise<ChapterMaterial> => {
    const response = await apiClient.get<{ data: ChapterMaterial }>(
      `/chapters/${chapterId}/materials/${materialId}`,
    );
    return response.data.data;
  },

  /**
   * Upload / create a new material under chapter
   */
  createMaterial: async (
    chapterId: string,
    payload: CreateMaterialPayload | FormData,
  ): Promise<ChapterMaterial> => {
    let data: FormData | Record<string, unknown>;
    let headers: Record<string, string> = {};

    if (payload instanceof FormData) {
      data = payload;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('materialType', payload.materialType);
      if (payload.description) formData.append('description', payload.description);
      if (payload.externalUrl) formData.append('externalUrl', payload.externalUrl);
      if (payload.file) formData.append('file', payload.file);
      data = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await apiClient.post<{ data: ChapterMaterial }>(
      `/chapters/${chapterId}/materials`,
      data,
      { headers },
    );
    return response.data.data;
  },

  /**
   * Delete / remove a material
   */
  deleteMaterial: async (
    chapterId: string,
    materialId: string,
  ): Promise<void> => {
    await apiClient.delete(`/chapters/${chapterId}/materials/${materialId}`);
  },

  // ==========================================
  // CHAPTER STUDY NOTES
  // ==========================================

  /**
   * List all study notes for a chapter
   */
  listNotes: async (
    chapterId: string,
    params?: ListNotesParams,
  ): Promise<ChapterNote[]> => {
    const response = await apiClient.get<{ data: ChapterNote[] }>(
      `/chapters/${chapterId}/notes`,
      { params },
    );
    return response.data.data;
  },

  /**
   * Retrieve single note by ID
   */
  getNoteById: async (
    chapterId: string,
    noteId: string,
  ): Promise<ChapterNote> => {
    const response = await apiClient.get<{ data: ChapterNote }>(
      `/chapters/${chapterId}/notes/${noteId}`,
    );
    return response.data.data;
  },

  /**
   * Publish / create a new study note under chapter
   */
  createNote: async (
    chapterId: string,
    payload: CreateNotePayload | FormData,
  ): Promise<ChapterNote> => {
    let data: FormData | Record<string, unknown>;
    let headers: Record<string, string> = {};

    if (payload instanceof FormData) {
      data = payload;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('noteType', payload.noteType);
      if (payload.content !== undefined && payload.content !== null) {
        formData.append('content', payload.content);
      }
      if (payload.isPublished !== undefined) {
        formData.append('isPublished', String(payload.isPublished));
      }
      if (payload.file) formData.append('file', payload.file);
      data = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await apiClient.post<{ data: ChapterNote }>(
      `/chapters/${chapterId}/notes`,
      data,
      { headers },
    );
    return response.data.data;
  },

  /**
   * Update an existing study note
   */
  updateNote: async (
    chapterId: string,
    noteId: string,
    payload: UpdateNotePayload | FormData,
  ): Promise<ChapterNote> => {
    let data: FormData | Record<string, unknown>;
    let headers: Record<string, string> = {};

    if (payload instanceof FormData) {
      data = payload;
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      const formData = new FormData();
      if (payload.title) formData.append('title', payload.title);
      if (payload.noteType) formData.append('noteType', payload.noteType);
      if (payload.content !== undefined) formData.append('content', payload.content || '');
      if (payload.isPublished !== undefined) {
        formData.append('isPublished', String(payload.isPublished));
      }
      if (payload.file) formData.append('file', payload.file);
      data = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await apiClient.patch<{ data: ChapterNote }>(
      `/chapters/${chapterId}/notes/${noteId}`,
      data,
      { headers },
    );
    return response.data.data;
  },

  /**
   * Delete / remove a study note
   */
  deleteNote: async (
    chapterId: string,
    noteId: string,
  ): Promise<void> => {
    await apiClient.delete(`/chapters/${chapterId}/notes/${noteId}`);
  },
};
