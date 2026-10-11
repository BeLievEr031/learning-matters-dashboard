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
import { teachersApi, type Teacher } from '../../../api/teachers.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface DeleteTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  onSuccess: () => void;
}

export function DeleteTeacherDialog({
  open,
  onOpenChange,
  teacher,
  onSuccess,
}: DeleteTeacherDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!teacher) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await teachersApi.delete(teacher.id);
      toast.success(
        `Faculty member "${teacher.firstName} ${teacher.lastName}" removed.`,
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setErrorMessage(msg);
      toast.error('Failed to delete teacher', { description: msg });
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
          <DialogTitle>Deactivate Teacher Profile</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong className="text-foreground">{teacher?.firstName} {teacher?.lastName}</strong> ({teacher?.employeeId}) from the faculty directory?
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Action Blocked</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
              {errorMessage.toLowerCase().includes('active assignments') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please unassign this faculty member from all active course schedules and grade class teacher duties first.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">⚠️ Teaching Assignment Integrity</p>
          <p>
            Instructors cannot be removed while actively assigned to subject periods or designated as primary class teachers.
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
            Confirm Deactivation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
