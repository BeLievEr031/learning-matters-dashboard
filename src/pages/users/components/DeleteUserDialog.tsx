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
import { usersApi, type UserAccount } from '../../../api/users.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

export interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAccount | null;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await usersApi.delete(user.id);
      toast.success(`User account ${user.email} removed successfully`);
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

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Delete User Account</DialogTitle>
              <DialogDescription>
                Revoke credentials and remove this account from the authentication system.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Account Email:</span>
              <span className="font-semibold text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Assigned Role:</span>
              <span className="font-mono text-primary uppercase">{user.role}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Security Revocation Notice
            </p>
            <p>
              Deleting this account will immediately revoke all active JWT sessions and disable login access across all portals.
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
            Confirm Deletion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
