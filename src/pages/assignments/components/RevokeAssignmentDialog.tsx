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
import {
  assignmentsApi,
  type TeacherAssignmentDetail,
} from '../../../api/assignments.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface RevokeAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: TeacherAssignmentDetail | null;
  onSuccess: () => void;
}

export function RevokeAssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onSuccess,
}: RevokeAssignmentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!assignment) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await assignmentsApi.delete(assignment.id);
      toast.success('Teaching assignment revoked successfully.');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setErrorMessage(msg);
      toast.error('Failed to revoke assignment', { description: msg });
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
          <DialogTitle>Revoke Teaching Allocation</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke the course schedule assignment for{' '}
            <strong className="text-foreground">
              {assignment?.teacherFirstName} {assignment?.teacherLastName}
            </strong>{' '}
            teaching{' '}
            <strong className="text-foreground">
              {assignment?.subjectName} ({assignment?.subjectCode})
            </strong>{' '}
            in{' '}
            <strong className="text-foreground">
              {assignment?.gradeName}
            </strong>?
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Revocation Blocked</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">ℹ️ Academic Schedule Note</p>
          <p>
            Revoking this allocation will remove this teacher's attendance and course permissions for this section.
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
            Confirm Revocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
