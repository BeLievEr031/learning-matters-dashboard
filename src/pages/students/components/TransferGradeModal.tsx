import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
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
import { Label } from '../../../components/ui/label.tsx';
import {
  transferStudentSchema,
  type TransferStudentFormValues,
} from '../../../schemas/students.schema.ts';
import { studentsApi, type Student } from '../../../api/students.api.ts';
import type { Grade } from '../../../api/grades.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

export interface TransferGradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  currentGradeName?: string;
  availableGrades: Grade[];
  onSuccess: () => void;
}

export function TransferGradeModal({
  open,
  onOpenChange,
  student,
  currentGradeName,
  availableGrades,
  onSuccess,
}: TransferGradeModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferStudentFormValues>({
    resolver: zodResolver(transferStudentSchema),
    defaultValues: {
      targetGradeId: '',
    },
  });

  const onSubmit = async (values: TransferStudentFormValues) => {
    if (!student) return;
    setServerError(null);

    try {
      if (values.targetGradeId === student.gradeId) {
        throw new Error('Please select a different grade for transfer');
      }

      await studentsApi.transfer(student.id, values);
      toast.success(
        `Successfully transferred ${student.firstName} ${student.lastName} to new grade`,
      );
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  };

  // Filter out the current grade from the target choices
  const eligibleGrades = availableGrades.filter((g) => g.id !== student?.gradeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Transfer Student Grade</DialogTitle>
              <DialogDescription>
                Reassign student enrollment to a target academic grade or section.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {student && (
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Student:</span>
              <span className="font-semibold text-foreground">
                {student.firstName} {student.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Admission No:</span>
              <span className="font-mono text-muted-foreground">{student.admissionNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Current Grade:</span>
              <span className="font-medium text-primary">
                {currentGradeName || 'Current Grade'}
              </span>
            </div>
          </div>
        )}

        {serverError && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="targetGradeId" className="text-xs">
              Target Grade / Section <span className="text-destructive">*</span>
            </Label>
            <select
              id="targetGradeId"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('targetGradeId')}
            >
              <option value="">Select target grade</option>
              {eligibleGrades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name} ({grade.code})
                  {grade.section ? ` - Sec ${grade.section}` : ''}
                </option>
              ))}
            </select>
            {errors.targetGradeId && (
              <p className="text-xs text-destructive">{errors.targetGradeId.message}</p>
            )}
            {eligibleGrades.length === 0 && (
              <p className="text-[11px] text-amber-500">
                No alternative grades found in this curriculum board.
              </p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Transfer Impact Notice
            </p>
            <p>
              Transferring will update the student&apos;s grade association immediately. Their historical attendance and academic records will remain preserved.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || eligibleGrades.length === 0}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Transfer Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
