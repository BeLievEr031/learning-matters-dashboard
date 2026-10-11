import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
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
import { studentsApi, type Student } from '../../../api/students.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

export interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess: () => void;
}

export function DeleteStudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: DeleteStudentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!student) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await studentsApi.delete(student.id);
      toast.success(
        `Student record for ${student.firstName} ${student.lastName} removed successfully`,
      );
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Remove Student Record</DialogTitle>
              <DialogDescription>
                Confirm de-enrollment and removal of student from academic roster.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Student Name:</span>
              <span className="font-semibold text-foreground">
                {student.firstName} {student.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Admission No:</span>
              <span className="font-mono text-muted-foreground">{student.admissionNumber}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Warning: De-enrollment Notice
            </p>
            <p>
              This will remove the student from active class rosters and grade lists. Associated academic history will be archived.
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
              {errorMessage}
            </p>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm Removal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
