import { useState } from 'react';
import { Unlink, Loader2, AlertCircle } from 'lucide-react';
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
import { subjectsApi, type GradeSubjectItem } from '../../../api/subjects.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface RemoveGradeSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: GradeSubjectItem | null;
  gradeId: string;
  gradeName?: string;
  onSuccess: () => void;
}

export function RemoveGradeSubjectDialog({
  open,
  onOpenChange,
  subject,
  gradeId,
  gradeName,
  onSuccess,
}: RemoveGradeSubjectDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!subject || !gradeId) return;
    setIsRemoving(true);
    setErrorMessage(null);

    try {
      await subjectsApi.removeGradeAssignment(gradeId, subject.id);
      toast.success(
        `Subject "${subject.name}" unlinked from ${gradeName || 'this section'}.`,
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setErrorMessage(msg);
      toast.error('Failed to unlink subject', { description: msg });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isRemoving) {
          setErrorMessage(null);
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <Unlink className="w-6 h-6" />
          </div>
          <DialogTitle>Unlink Subject from Curriculum</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong className="text-foreground">{subject?.name}</strong> ({subject?.code}) from{' '}
            <strong className="text-foreground">{gradeName || 'this section'}</strong>?
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Cannot Unlink</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">ℹ️ Curriculum Scope</p>
          <p>
            This action only removes the subject from this grade level's roster. The master subject remains available in the school catalogue for other classes.
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isRemoving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isRemoving}
            onClick={handleRemove}
            className="gap-2"
          >
            {isRemoving && <Loader2 className="w-4 h-4 animate-spin" />}
            Unlink from Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
