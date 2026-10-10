import { useAuthStore } from '../../store/auth.store.ts';

export function DashboardPage() {
  const { user, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back, {user?.firstName || user?.email || 'Administrator'}. Logged in as{' '}
          <span className="font-semibold text-primary uppercase">{effectiveRole}</span>.
        </p>
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
    </div>
  );
}
