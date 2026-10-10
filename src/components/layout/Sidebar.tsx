import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, GraduationCap, Sparkles, X } from 'lucide-react';
import { useScreens } from '../../hooks/use-screens.ts';
import { DynamicIcon } from '../common/DynamicIcon.tsx';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { sidebarGroups, effectiveRole, isImpersonating, viewAsRole } = useScreens();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in-0"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col border-r border-border/60 bg-card text-card-foreground transition-all duration-300 ease-in-out',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight truncate leading-tight">
                  Learning Matters
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                  Admin Console
                </span>
              </div>
            )}
          </div>

          {/* Close on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Impersonation Banner if active */}
        {isImpersonating && (!collapsed || mobileOpen) && (
          <div className="mx-3 mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Previewing as {viewAsRole}</span>
          </div>
        )}

        {/* Navigation Categories & Screen Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sidebarGroups.map(({ category, screens }) => (
            <div key={category.id} className="space-y-1">
              {(!collapsed || mobileOpen) && (
                <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category.label}
                </p>
              )}

              {screens.map((screen) => (
                <NavLink
                  key={screen.id}
                  to={screen.path}
                  onClick={() => onCloseMobile()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && !mobileOpen ? 'justify-center px-0' : '',
                    )
                  }
                  title={collapsed && !mobileOpen ? screen.title : undefined}
                >
                  <DynamicIcon
                    name={screen.iconName}
                    className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105"
                  />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate flex-1">{screen.title}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Role Badge & Collapse Toggle Footer */}
        <div className="p-3 border-t border-border/60 flex items-center justify-between gap-2">
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                  Role: {effectiveRole?.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-2 h-2 mx-auto rounded-full bg-emerald-500" />
          )}

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
