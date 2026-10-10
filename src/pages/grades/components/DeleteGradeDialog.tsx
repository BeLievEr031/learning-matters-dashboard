import { useState } from 'react';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
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
import { gradesApi, type Grade } from '../../../api/grades.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface DeleteGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
  onSuccess: () => void;
}

export function DeleteGradeDialog({
  open,
  onOpenChange,
  grade,
  onSuccess,
}: DeleteGradeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!grade) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await gradesApi.delete(grade.id);
      toast.success(`Grade section "${grade.name}" has been removed.`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setErrorMessage(msg);
      toast.error('Failed to delete grade section', {
        description: msg,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isDeleting) {
          setErrorMessage(null);
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle>Delete Grade Section</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong className="text-foreground">{grade?.name}</strong> ({grade?.code})?
            This will soft-delete the grade section from the curriculum board.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Action Blocked</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
              {errorMessage.toLowerCase().includes('active enrolled students') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please transfer or promote all enrolled students out of this section before deleting it.
                </p>
              )}
              {errorMessage.toLowerCase().includes('teacher assignments') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please unassign subject teachers from this section before deleting it.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">⚠️ Enrollment Safety Check</p>
          <p>
            Grade sections cannot be removed if active students are enrolled or active course schedules exist.
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            className="gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Deletion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
