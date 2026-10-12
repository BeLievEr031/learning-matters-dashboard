import { useMemo } from 'react';
import {
  Crown,
  School,
  Award,
  GraduationCap,
  BookOpen,
  Layers,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import {
  CATEGORIES,
  SCREENS_REGISTRY,
} from '../../../config/screens.config.ts';
import type { ScreenDefinition } from '../../../types/screens.types.ts';
import { useScreenPermissionsStore } from '../../../store/screen-permissions.store.ts';
import type { UserRole } from '../../../types/auth.types.ts';
import { cn } from '../../../lib/utils.ts';
import { toast } from 'sonner';

export interface ScreenVisibilityMatrixProps {
  searchQuery?: string;
  categoryFilter?: string;
}

interface RoleColumn {
  role: UserRole;
  label: string;
  icon: typeof Crown;
  colorClass: string;
}

const ROLES: RoleColumn[] = [
  { role: 'super_admin', label: 'Super Admin', icon: Crown, colorClass: 'text-purple-500' },
  { role: 'admin', label: 'Campus Admin', icon: School, colorClass: 'text-blue-500' },
  { role: 'principal', label: 'Principal', icon: Award, colorClass: 'text-amber-500' },
  { role: 'class_teacher', label: 'Class Teacher', icon: GraduationCap, colorClass: 'text-emerald-500' },
  { role: 'teacher', label: 'Teacher', icon: BookOpen, colorClass: 'text-indigo-500' },
  { role: 'student', label: 'Student', icon: Layers, colorClass: 'text-sky-500' },
];

export function ScreenVisibilityMatrix({
  searchQuery = '',
  categoryFilter = '',
}: ScreenVisibilityMatrixProps) {
  const customPermissions = useScreenPermissionsStore((state) => state.customPermissions);
  const getScreenRoles = useScreenPermissionsStore((state) => state.getScreenRoles);
  const toggleRole = useScreenPermissionsStore((state) => state.toggleRole);
  const setScreenRoles = useScreenPermissionsStore((state) => state.setScreenRoles);

  // Filter screens by search and category
  const filteredScreens = useMemo(() => {
    return SCREENS_REGISTRY.filter((screen) => {
      if (categoryFilter && screen.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = screen.title.toLowerCase().includes(q);
        const matchPath = screen.path.toLowerCase().includes(q);
        const matchDesc = Boolean(screen.description?.toLowerCase().includes(q));
        if (!matchTitle && !matchPath && !matchDesc) return false;
      }
      return true;
    });
  }, [searchQuery, categoryFilter]);

  // Group by Category
  const groupedScreens = useMemo(() => {
    const categories = Object.values(CATEGORIES).sort((a, b) => a.order - b.order);
    return categories
      .map((cat) => ({
        category: cat,
        screens: filteredScreens
          .filter((s) => s.category === cat.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.screens.length > 0);
  }, [filteredScreens]);

  const handleToggle = (screen: ScreenDefinition, role: UserRole) => {
    toggleRole(screen.id, role);
    const updated = getScreenRoles(screen.id);
    const isNowAllowed = updated.includes(role);
    toast.success(
      `${isNowAllowed ? 'Enabled' : 'Disabled'} ${screen.title} for ${role.replace('_', ' ')}`,
      { duration: 1500 },
    );
  };

  const handleResetScreen = (screen: ScreenDefinition) => {
    setScreenRoles(screen.id, [...screen.allowedRoles]);
    toast.success(`Reset ${screen.title} permissions to default`);
  };

  return (
    <div className="space-y-6">
      {groupedScreens.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border text-muted-foreground text-xs">
          No screens match your search or category filter.
        </div>
      ) : (
        groupedScreens.map(({ category, screens }) => (
          <div
            key={category.id}
            className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs"
          >
            {/* Category Section Header */}
            <div className="bg-muted/40 px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {category.label}
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {screens.length} {screens.length === 1 ? 'screen' : 'screens'}
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-[11px] font-semibold text-muted-foreground">
                    <th className="py-2.5 px-4 w-72">Screen & Route</th>
                    {ROLES.map(({ role, label, icon: RoleIcon, colorClass }) => (
                      <th
                        key={role}
                        className="py-2.5 px-3 text-center whitespace-nowrap min-w-[100px]"
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <RoleIcon className={cn('w-3.5 h-3.5', colorClass)} />
                          <span>{label}</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right min-w-[70px]">Reset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {screens.map((screen) => {
                    const currentRoles = getScreenRoles(screen.id);
                    const isCustomized = Boolean(customPermissions[screen.id]);

                    return (
                      <tr
                        key={screen.id}
                        className={cn(
                          'hover:bg-muted/30 transition-colors',
                          isCustomized && 'bg-primary/[0.02]',
                        )}
                      >
                        {/* Screen title & path */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {screen.title}
                            </span>
                            {isCustomized && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Modified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {screen.path}
                          </div>
                          <div className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-1">
                            {screen.description}
                          </div>
                        </td>

                        {/* Role Checkboxes */}
                        {ROLES.map(({ role }) => {
                          const isChecked = currentRoles.includes(role);
                          return (
                            <td key={role} className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggle(screen, role)}
                                className={cn(
                                  'w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all',
                                  isChecked
                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                    : 'bg-background border-input hover:border-primary/50 text-transparent',
                                )}
                                title={`Toggle ${screen.title} for ${role}`}
                              >
                                <Check className={cn('w-3.5 h-3.5', !isChecked && 'opacity-0')} />
                              </button>
                            </td>
                          );
                        })}

                        {/* Reset screen to default */}
                        <td className="py-3 px-3 text-right">
                          {isCustomized && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetScreen(screen)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="Reset screen permissions to default"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
