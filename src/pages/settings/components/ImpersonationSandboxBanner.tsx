import {
  Sparkles,
  X,
  Crown,
  School,
  Award,
  GraduationCap,
  BookOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { useAuthStore } from '../../../store/auth.store.ts';
import type { UserRole } from '../../../types/auth.types.ts';
import { cn } from '../../../lib/utils.ts';
import { toast } from 'sonner';

const ROLES_LIST: { role: UserRole; label: string; icon: typeof Crown }[] = [
  { role: 'super_admin', label: 'Super Admin', icon: Crown },
  { role: 'admin', label: 'Campus Admin', icon: School },
  { role: 'principal', label: 'Principal', icon: Award },
  { role: 'class_teacher', label: 'Class Teacher', icon: GraduationCap },
  { role: 'teacher', label: 'Teacher', icon: BookOpen },
  { role: 'student', label: 'Student', icon: Layers },
];

/**
 * Global Top Banner when Impersonation is active
 */
export function ImpersonationActiveBanner() {
  const { viewAsRole, setViewAsRole, user } = useAuthStore();

  if (!viewAsRole) return null;

  const currentRoleObj = ROLES_LIST.find((r) => r.role === viewAsRole);
  const CurrentIcon = currentRoleObj?.icon ?? Sparkles;

  const handleExit = () => {
    setViewAsRole(null);
    toast.info('Exited Sandbox Impersonation Mode');
  };

  const handleSwitch = (newRole: UserRole) => {
    setViewAsRole(newRole);
    toast.success(`Switched sandbox preview to ${newRole.replace('_', ' ')}`);
  };

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
        <CurrentIcon className="w-4 h-4 shrink-0 text-amber-500" />
        <span>
          <strong>Sandbox Preview Active:</strong> Experiencing interface as{' '}
          <span className="underline font-bold uppercase">{currentRoleObj?.label || viewAsRole}</span>
          {user?.role && (
            <span className="text-muted-foreground font-normal ml-1">
              (Actual: {user.role})
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {ROLES_LIST.map(({ role, label }) => {
            const isCurrent = viewAsRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleSwitch(role)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium transition-colors border',
                  isCurrent
                    ? 'bg-amber-500 text-amber-950 font-bold border-amber-500 shadow-xs'
                    : 'bg-background/80 hover:bg-background border-amber-500/30 text-foreground',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExit}
          className="h-6 text-[11px] gap-1 px-2 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
        >
          <X className="w-3 h-3" />
          Exit Sandbox
        </Button>
      </div>
    </div>
  );
}

/**
 * Embedded Settings Widget Card
 */
export function ImpersonationSandboxWidget() {
  const { viewAsRole, setViewAsRole, user } = useAuthStore();

  const handleSelectRole = (role: UserRole) => {
    setViewAsRole(role);
    toast.success(`Activated Sandbox Mode as ${role.replace('_', ' ')}`);
  };

  const handleReset = () => {
    setViewAsRole(null);
    toast.info('Reset back to your actual permissions');
  };

  return (
    <Card className="border-border/80 bg-gradient-to-br from-card via-card to-amber-500/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                &ldquo;View As Role&rdquo; Impersonation Sandbox
              </h3>
              <p className="text-xs text-muted-foreground">
                Simulate and verify the complete user experience for any institutional role without logging out.
              </p>
            </div>
          </div>

          {viewAsRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8 text-amber-600 dark:text-amber-400"
            >
              Reset to Actual ({user?.role || 'admin'})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          {ROLES_LIST.map(({ role, label, icon: RoleIcon }) => {
            const isActive = viewAsRole === role;
            const isActual = user?.role === role && !viewAsRole;

            return (
              <button
                key={role}
                type="button"
                onClick={() => handleSelectRole(role)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group',
                  isActive
                    ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-xs ring-1 ring-amber-500/50'
                    : isActual
                      ? 'bg-primary/5 border-primary/30 text-foreground'
                      : 'bg-muted/20 border-border hover:bg-muted/50 text-foreground',
                )}
              >
                <div className="flex items-center justify-between">
                  <RoleIcon
                    className={cn(
                      'w-4 h-4',
                      isActive ? 'text-amber-500' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  />
                  {isActive ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-amber-950 px-1 rounded">
                      Active
                    </span>
                  ) : isActual ? (
                    <span className="text-[10px] text-muted-foreground font-mono">You</span>
                  ) : null}
                </div>
                <div>
                  <div className="font-semibold text-xs">{label}</div>
                  <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                    <span>Test View</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
