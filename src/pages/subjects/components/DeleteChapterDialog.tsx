import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { chaptersApi, type Chapter } from '../../../api/chapters.api.ts';

interface DeleteChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: Chapter | null;
  subjectName: string;
  onSuccess?: () => void;
}

export function DeleteChapterDialog({
  open,
  onOpenChange,
  chapter,
  subjectName,
  onSuccess,
}: DeleteChapterDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!chapter) return;
      await chaptersApi.delete(chapter.id);
    },
    onSuccess: () => {
      toast.success(`Chapter "${chapter?.title}" removed successfully`);
      if (chapter?.subjectId) {
        queryClient.invalidateQueries({ queryKey: ['chapters', chapter.subjectId] });
      }
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove chapter');
    },
  });

  if (!chapter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle>Delete Curriculum Chapter</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>Chapter {chapter.chapterNumber}: {chapter.title}</strong> from <em>{subjectName}</em>?
            This will soft-delete the chapter from the syllabus.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="text-xs"
          >
            {mutation.isPending ? 'Removing...' : 'Delete Chapter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
