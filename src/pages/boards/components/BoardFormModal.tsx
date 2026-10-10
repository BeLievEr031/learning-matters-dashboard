import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
import { Label } from '../../../components/ui/label.tsx';
import {
  boardFormSchema,
  type BoardFormValues,
} from '../../../schemas/boards.schema.ts';
import { boardsApi, type Board } from '../../../api/boards.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface BoardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardToEdit?: Board | null;
  schoolId: string;
  onSuccess: () => void;
}

export function BoardFormModal({
  open,
  onOpenChange,
  boardToEdit,
  schoolId,
  onSuccess,
}: BoardFormModalProps) {
  const isEditing = Boolean(boardToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (boardToEdit) {
        reset({
          name: boardToEdit.name,
          code: boardToEdit.code,
          description: boardToEdit.description || '',
          status: boardToEdit.status,
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          status: 'active',
        });
      }
    }
  }, [open, boardToEdit, reset]);

  const onSubmit = async (values: BoardFormValues) => {
    setServerError(null);

    if (!schoolId) {
      setServerError('A target school must be selected to configure curriculum boards.');
      return;
    }

    try {
      if (isEditing && boardToEdit) {
        await boardsApi.update(boardToEdit.id, values);
        toast.success('Curriculum board updated successfully');
      } else {
        await boardsApi.create(schoolId, values);
        toast.success('Curriculum board registered successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Curriculum Board' : 'Register New Board'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Update board details and curriculum specifications for ${boardToEdit?.name}`
                  : 'Define an educational board (e.g. CBSE, ICSE, Cambridge) for curriculum and grade structures.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="mx-6 mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-2">
          {/* Board Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Board Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Central Board of Secondary Education"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Board Code & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="code" required>
                Board Code
              </Label>
              <Input
                id="code"
                placeholder="e.g. CBSE, ICSE, IB"
                className="font-mono uppercase"
                {...register('code', {
                  onChange: (e) => {
                    setValue('code', e.target.value.toUpperCase(), { shouldValidate: true });
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.code ? (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Unique per school (alphanumeric, hyphens)
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" required>
                Operational Status
              </Label>
              <select
                id="status"
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                {...register('status')}
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Curriculum Notes / Description</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Optional details regarding curriculum guidelines, regional affiliation, or grading standards..."
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 resize-none"
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Register Board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
