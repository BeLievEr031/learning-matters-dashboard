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
import { boardsApi, type Board } from '../../../api/boards.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface DeleteBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
  onSuccess: () => void;
}

export function DeleteBoardDialog({
  open,
  onOpenChange,
  board,
  onSuccess,
}: DeleteBoardDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!board) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await boardsApi.delete(board.id);
      toast.success(`Curriculum board "${board.name}" has been removed.`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setErrorMessage(msg);
      toast.error('Failed to delete curriculum board', {
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
          <DialogTitle>Delete Curriculum Board</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong className="text-foreground">{board?.name}</strong> ({board?.code})?
            This board will be archived and hidden from curriculum selection.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Action Blocked</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
              {errorMessage.toLowerCase().includes('active grades') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please reassign or archive all active classes and grades belonging to this board before deleting it.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">⚠️ Curriculum Integrity Check</p>
          <p>
            Educational boards cannot be removed if active grades or sections are currently mapped to them.
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
