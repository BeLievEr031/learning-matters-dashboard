import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookOpen, Layers } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import {
  chapterFormSchema,
  type ChapterFormValues,
} from '../../../schemas/chapters.schema.ts';
import { chaptersApi, type Chapter } from '../../../api/chapters.api.ts';

interface ChapterFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  subjectName: string;
  nextChapterNumber?: number;
  chapterToEdit?: Chapter | null;
  onSuccess?: () => void;
}

export function ChapterFormModal({
  open,
  onOpenChange,
  subjectId,
  subjectName,
  nextChapterNumber = 1,
  chapterToEdit,
  onSuccess,
}: ChapterFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(chapterToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      chapterNumber: 1,
      title: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (chapterToEdit) {
        reset({
          chapterNumber: chapterToEdit.chapterNumber,
          title: chapterToEdit.title,
          description: chapterToEdit.description || '',
          status: chapterToEdit.status,
        });
      } else {
        reset({
          chapterNumber: nextChapterNumber,
          title: '',
          description: '',
          status: 'active',
        });
      }
    }
  }, [open, chapterToEdit, nextChapterNumber, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ChapterFormValues) => {
      if (isEditing && chapterToEdit) {
        return chaptersApi.update(chapterToEdit.id, values);
      }
      return chaptersApi.create(subjectId, values);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Chapter updated successfully'
          : 'Chapter created and added to subject syllabus',
      );
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save chapter');
    },
  });

  const onSubmit = (values: ChapterFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {subjectName} Syllabus
            </span>
          </div>
          <DialogTitle>
            {isEditing ? 'Edit Curriculum Chapter' : 'Add New Chapter'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update chapter title, order index, or description.'
              : 'Add a new chapter or unit to the subject curriculum.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                Index #
              </label>
              <Input
                type="number"
                min={1}
                placeholder="1"
                {...register('chapterNumber', { valueAsNumber: true })}
                className="h-9 text-xs font-mono font-bold"
              />
              {errors.chapterNumber && (
                <p className="text-[11px] text-destructive">{errors.chapterNumber.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
              {errors.status && (
                <p className="text-[11px] text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Chapter Title *
            </label>
            <Input
              placeholder="e.g. Thermodynamics, Kinematics, Linear Equations"
              {...register('title')}
              className="h-9 text-xs"
            />
            {errors.title && (
              <p className="text-[11px] text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description & Learning Objectives (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Overview of topics covered, prerequisites, and learning outcomes..."
              {...register('description')}
              className="w-full p-2.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            {errors.description && (
              <p className="text-[11px] text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3">
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
              type="submit"
              size="sm"
              disabled={isSubmitting || mutation.isPending}
              className="text-xs"
            >
              {mutation.isPending
                ? 'Saving...'
                : isEditing
                  ? 'Update Chapter'
                  : 'Add Chapter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
