import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Loader2, AlertCircle, Wand2 } from 'lucide-react';
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
  subjectFormSchema,
  type SubjectFormValues,
} from '../../../schemas/subjects.schema.ts';
import { subjectsApi, type Subject } from '../../../api/subjects.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface SubjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectToEdit?: Subject | null;
  gradeId?: string;
  gradeName?: string;
  onSuccess: () => void;
}

export function SubjectFormModal({
  open,
  onOpenChange,
  subjectToEdit,
  gradeId,
  gradeName,
  onSuccess,
}: SubjectFormModalProps) {
  const isEditing = Boolean(subjectToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (subjectToEdit) {
        reset({
          name: subjectToEdit.name,
          code: subjectToEdit.code,
          description: subjectToEdit.description || '',
          status: subjectToEdit.status,
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
  }, [open, subjectToEdit, reset]);

  // Helper to suggest standard subject code based on name
  const handleAutoSuggestCode = () => {
    const name = (getValues('name') || '').trim();
    if (!name) return;

    // Build abbreviation: take words and take first 3-4 chars or initials
    const words = name.split(/\s+/);
    const codeSuggestion =
      words.length === 1
        ? words[0].slice(0, 4).toUpperCase()
        : words.map((w) => w[0]).join('').toUpperCase();

    setValue('code', codeSuggestion, { shouldValidate: true });
  };

  const onSubmit = async (values: SubjectFormValues) => {
    setServerError(null);

    try {
      if (isEditing && subjectToEdit) {
        await subjectsApi.update(subjectToEdit.id, values);
        toast.success('Subject catalogue entry updated');
      } else if (gradeId) {
        await subjectsApi.assignOrCreate(gradeId, values);
        toast.success('Subject mapped to grade curriculum');
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Subject Entry' : 'Create & Assign Subject'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Update master curriculum details for ${subjectToEdit?.name}`
                  : `Define a new academic subject course ${gradeName ? `for ${gradeName}` : ''}.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {gradeName && !isEditing && (
          <div className="mx-6 mt-1 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
            <span className="text-muted-foreground">Target Section:</span>
            <span className="font-bold text-primary">{gradeName}</span>
          </div>
        )}

        {serverError && (
          <div className="mx-6 mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-2">
          {/* Subject Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Subject Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Advanced Mathematics, Physics, English"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Subject Code & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">
                  Subject Code <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  onClick={handleAutoSuggestCode}
                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <Wand2 className="w-2.5 h-2.5" /> Suggest
                </button>
              </div>
              <Input
                id="code"
                placeholder="e.g. MATH-10, PHY-01"
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
                  Unique per school (e.g. MATH-10)
                </p>
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Curriculum Notes / Syllabus Scope</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Optional course outline, textbook references, credits, or examination syllabus scope..."
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
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
              {isEditing ? 'Save Changes' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
