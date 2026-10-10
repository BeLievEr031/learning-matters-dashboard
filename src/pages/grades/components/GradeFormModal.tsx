import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Loader2, AlertCircle, Wand2 } from 'lucide-react';
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
import { gradeFormSchema, type GradeFormValues } from '../../../schemas/grades.schema.ts';
import { gradesApi, type Grade } from '../../../api/grades.api.ts';
import type { Board } from '../../../api/boards.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface GradeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeToEdit?: Grade | null;
  boardId: string;
  boards: Board[];
  onSuccess: () => void;
}

export function GradeFormModal({
  open,
  onOpenChange,
  gradeToEdit,
  boardId,
  boards,
  onSuccess,
}: GradeFormModalProps) {
  const isEditing = Boolean(gradeToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      boardId: boardId || '',
      name: '',
      code: '',
      gradeNumber: 1,
      section: '',
      capacity: 35,
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (gradeToEdit) {
        reset({
          boardId: gradeToEdit.boardId,
          name: gradeToEdit.name,
          code: gradeToEdit.code,
          gradeNumber: gradeToEdit.gradeNumber,
          section: gradeToEdit.section || '',
          capacity: gradeToEdit.capacity ?? undefined,
          status: gradeToEdit.status,
        });
      } else {
        reset({
          boardId: boardId || (boards[0]?.id ?? ''),
          name: '',
          code: '',
          gradeNumber: 1,
          section: 'A',
          capacity: 35,
          status: 'active',
        });
      }
    }
  }, [open, gradeToEdit, boardId, boards, reset]);

  // Helper to suggest standard name and code
  const handleAutoSuggest = () => {
    const num = getValues('gradeNumber');
    const sec = (getValues('section') || '').trim().toUpperCase();
    const label = num === 0 ? 'Kindergarten' : `Grade ${num}`;
    const codePrefix = num === 0 ? 'KG' : `G${num}`;

    const name = sec ? `${label} - Section ${sec}` : label;
    const code = sec ? `${codePrefix}-${sec}` : codePrefix;

    setValue('name', name, { shouldValidate: true });
    setValue('code', code, { shouldValidate: true });
  };

  const onSubmit = async (values: GradeFormValues) => {
    setServerError(null);
    try {
      if (isEditing && gradeToEdit) {
        await gradesApi.update(gradeToEdit.id, {
          name: values.name,
          code: values.code,
          gradeNumber: values.gradeNumber,
          section: values.section ? values.section.trim() : null,
          capacity: values.capacity ?? null,
          status: values.status,
        });
        toast.success('Grade / Section updated successfully');
      } else {
        await gradesApi.create(values.boardId, {
          name: values.name,
          code: values.code,
          gradeNumber: values.gradeNumber,
          section: values.section ? values.section.trim() : null,
          capacity: values.capacity ?? null,
          status: values.status,
        });
        toast.success('Grade / Section created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setServerError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Grade / Section' : 'Create Grade & Section'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Modify parameters and capacity for ${gradeToEdit?.name}`
                  : 'Define a new class grade level and section within the curriculum board.'}
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
          {/* Board Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="boardId">
              Curriculum Board <span className="text-destructive">*</span>
            </Label>
            <select
              id="boardId"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              {...register('boardId')}
              disabled={isSubmitting || isEditing}
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            {errors.boardId && (
              <p className="text-xs text-destructive">{errors.boardId.message}</p>
            )}
          </div>

          {/* Grade Number & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gradeNumber">
                Grade Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gradeNumber"
                type="number"
                min={0}
                max={20}
                placeholder="e.g. 10 (0 for KG)"
                {...register('gradeNumber')}
                disabled={isSubmitting}
              />
              {errors.gradeNumber ? (
                <p className="text-xs text-destructive">{errors.gradeNumber.message}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">0 = Prep/KG, 1-12 = Standard</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="section">Section Identifier</Label>
              <Input
                id="section"
                placeholder="e.g. A, B, Rose, Yellow"
                {...register('section')}
                disabled={isSubmitting}
              />
              {errors.section && (
                <p className="text-xs text-destructive">{errors.section.message}</p>
              )}
            </div>
          </div>

          {/* Auto-suggest button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAutoSuggest}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Wand2 className="w-3 h-3" /> Auto-generate Name & Code
            </button>
          </div>

          {/* Grade Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Grade 10 - Section A"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code">
                Grade Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g. G10-A"
                className="font-mono uppercase"
                {...register('code', {
                  onChange: (e) => {
                    setValue('code', e.target.value.toUpperCase(), { shouldValidate: true });
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Capacity & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Max Student Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="e.g. 40"
                {...register('capacity')}
                disabled={isSubmitting}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <select
                id="status"
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
              {isEditing ? 'Save Changes' : 'Create Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
