import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
import { schoolsApi, type School } from '../../../api/schools.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface DeleteSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onSuccess: () => void;
}

export function DeleteSchoolDialog({
  open,
  onOpenChange,
  school,
  onSuccess,
}: DeleteSchoolDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!school) return;
    setIsDeleting(true);
    try {
      await schoolsApi.delete(school.id);
      toast.success(`School "${school.name}" has been deactivated.`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete school', {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isDeleting ? () => {} : onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle>Confirm School Deactivation</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate <strong className="text-foreground">{school?.name}</strong> ({school?.code})?
            This will soft-delete the institution and prevent all affiliated users, students, and staff from accessing the portal.
          </DialogDescription>
        </DialogHeader>

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
