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
import { subjectsApi, type Subject } from '../../../api/subjects.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface DeleteSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSuccess: () => void;
}

export function DeleteSubjectDialog({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: DeleteSubjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!subject) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await subjectsApi.delete(subject.id);
      toast.success(`Subject "${subject.name}" deleted from school catalogue.`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setErrorMessage(msg);
      toast.error('Failed to delete subject', { description: msg });
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
          <DialogTitle>Delete Master Subject</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete <strong className="text-foreground">{subject?.name}</strong> ({subject?.code}) from the school course catalogue?
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Deletion Blocked</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
              {errorMessage.toLowerCase().includes('active grade assignments') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please unlink this subject from all active grade sections before deleting it from the catalogue.
                </p>
              )}
              {errorMessage.toLowerCase().includes('teacher assignments') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please unassign teachers allocated to this subject before deleting it.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">⚠️ Integrity Verification</p>
          <p>
            Master subjects cannot be deleted if active grade sections or active faculty teaching assignments depend on them.
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
