import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.ts';
import { LogoutDialog } from '../../components/auth/LogoutDialog.tsx';
import { Button } from '../../components/ui/button.tsx';

export function DashboardPage() {
  const { user, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.firstName || user?.email || 'Administrator'}. Logged in as{' '}
            <span className="font-semibold text-primary uppercase">{effectiveRole}</span>.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setLogoutOpen(true)}
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-5 rounded-xl border bg-card shadow-xs">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Role</p>
          <p className="text-2xl font-bold mt-1 capitalize">{effectiveRole?.replace('_', ' ') || 'None'}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card shadow-xs">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tenant Scope</p>
          <p className="text-2xl font-bold mt-1">{user?.schoolId ? 'School Scoped' : 'Global / Multi-School'}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card shadow-xs">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">Active Session</p>
        </div>
      </div>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}
