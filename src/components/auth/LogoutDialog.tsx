import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { useAuthStore } from '../../store/auth.store.ts';
import { authApi } from '../../api/auth.api.ts';
import { getApiErrorMessage } from '../../api/client.ts';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuthStore();
  const [isLoadingThis, setIsLoadingThis] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const handleLogoutCurrent = async () => {
    setIsLoadingThis(true);
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
      logout();
      onOpenChange(false);
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      logout();
      onOpenChange(false);
      navigate('/login');
    } finally {
      setIsLoadingThis(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoadingAll(true);
    try {
      await authApi.logoutAll();
      logout();
      onOpenChange(false);
      toast.success('Logged out from all active sessions');
      navigate('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      logout();
      onOpenChange(false);
      navigate('/login');
    } finally {
      setIsLoadingAll(false);
    }
  };

  const isBusy = isLoadingThis || isLoadingAll;

  return (
    <Dialog open={open} onOpenChange={isBusy ? () => {} : onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <LogOut className="w-6 h-6" />
          </div>
          <DialogTitle>Sign Out Confirmation</DialogTitle>
          <DialogDescription>
            Are you sure you want to end your session? You can sign out from this current device or terminate all active sessions across all devices.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 my-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Signing out from all devices will immediately revoke all refresh tokens and require password re-entry on all browsers and devices.
          </span>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={handleLogoutCurrent}
            className="gap-2"
          >
            {isLoadingThis && <Loader2 className="w-4 h-4 animate-spin" />}
            This Device Only
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={handleLogoutAll}
            className="gap-2"
          >
            {isLoadingAll && <Loader2 className="w-4 h-4 animate-spin" />}
            All Devices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
