import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chapterResourcesApi } from '../api/chapter-resources.api.ts';
import type {
  ChapterMaterial,
  ChapterNote,
  ListMaterialsParams,
  ListNotesParams,
  CreateMaterialPayload,
  CreateNotePayload,
  UpdateNotePayload,
} from '../types/teacher-workspace.types.ts';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const error = err as ApiError;
  return error.response?.data?.message || error.message || fallback;
}

/**
 * Hook to retrieve learning materials for a chapter
 */
export function useChapterMaterials(chapterId?: string, params?: ListMaterialsParams) {
  return useQuery<ChapterMaterial[]>({
    queryKey: ['teacher', 'materials', chapterId, params],
    queryFn: () => {
      if (!chapterId) throw new Error('chapterId is required');
      return chapterResourcesApi.listMaterials(chapterId, params);
    },
    enabled: Boolean(chapterId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to retrieve study notes for a chapter
 */
export function useChapterNotes(chapterId?: string, params?: ListNotesParams) {
  return useQuery<ChapterNote[]>({
    queryKey: ['teacher', 'notes', chapterId, params],
    queryFn: () => {
      if (!chapterId) throw new Error('chapterId is required');
      return chapterResourcesApi.listNotes(chapterId, params);
    },
    enabled: Boolean(chapterId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create / upload material under chapter
 */
export function useCreateMaterialMutation(chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaterialPayload | FormData) =>
      chapterResourcesApi.createMaterial(chapterId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'materials', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'subject-chapters'] });
      toast.success('Learning material uploaded successfully');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to upload learning material'));
    },
  });
}

/**
 * Hook to delete a chapter material
 */
export function useDeleteMaterialMutation(chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId: string) =>
      chapterResourcesApi.deleteMaterial(chapterId, materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'materials', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'subject-chapters'] });
      toast.success('Material removed successfully');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to delete material'));
    },
  });
}

/**
 * Hook to create a study note under chapter
 */
export function useCreateNoteMutation(chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotePayload | FormData) =>
      chapterResourcesApi.createNote(chapterId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'notes', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'subject-chapters'] });
      toast.success('Study note published successfully');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to publish study note'));
    },
  });
}

/**
 * Hook to update an existing study note
 */
export function useUpdateNoteMutation(chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: UpdateNotePayload | FormData }) =>
      chapterResourcesApi.updateNote(chapterId, noteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'notes', chapterId] });
      toast.success('Study note updated successfully');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to update study note'));
    },
  });
}

/**
 * Hook to delete a study note
 */
export function useDeleteNoteMutation(chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => chapterResourcesApi.deleteNote(chapterId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'notes', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'subject-chapters'] });
      toast.success('Study note removed');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to delete study note'));
    },
  });
}
