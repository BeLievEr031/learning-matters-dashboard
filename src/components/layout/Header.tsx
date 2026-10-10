import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronRight,
  Shield,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.ts';
import { useThemeStore } from '../../store/theme.store.ts';
import { SCREENS_REGISTRY } from '../../config/screens.config.ts';
import { SchoolSelector } from './SchoolSelector.tsx';
import type { UserRole } from '../../types/auth.types.ts';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandMenu: () => void;
  onRequestLogout: () => void;
}

const AVAILABLE_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'principal',
  'class_teacher',
  'teacher',
  'student',
];

export function Header({
  onOpenMobileSidebar,
  onOpenCommandMenu,
  onRequestLogout,
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, viewAsRole, setViewAsRole, getEffectiveRole } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveRole = getEffectiveRole();
  const isActualSuperAdmin = user?.role === 'super_admin';

  // Find active screen definition for breadcrumbs
  const currentScreen = SCREENS_REGISTRY.find((s) => s.path === location.pathname);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRolePreviewSelect = (role: UserRole | null) => {
    setViewAsRole(role);
    setUserDropdownOpen(false);
  };

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 border-b border-border/60 bg-background/80 backdrop-blur-md">
      {/* Left side: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden sm:flex items-center text-xs font-medium text-muted-foreground gap-1.5">
          <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/dashboard')}>
            Console
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold">
            {currentScreen?.title || 'Overview'}
          </span>
        </nav>
      </div>

      {/* Right side: School Selector + Command Menu + Theme + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* School Context Selector */}
        <SchoolSelector />

        {/* Command Menu Quick Search */}
        <button
          type="button"
          onClick={onOpenCommandMenu}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted text-xs text-muted-foreground transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Jump...</span>
          <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Theme Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-border/60 bg-card hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs uppercase">
              {user?.firstName?.[0] || user?.email?.[0] || 'A'}
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span className="text-xs font-bold truncate max-w-[120px] leading-tight">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">
                {effectiveRole?.replace('_', ' ')}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
              {/* Profile Card Header */}
              <div className="p-3 border-b border-border/60 mb-1">
                <p className="text-xs font-bold truncate">{user?.firstName || 'User Account'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>

              {/* View As Role Sandbox (Super Admin only) */}
              {isActualSuperAdmin && (
                <div className="p-2 border-b border-border/60 mb-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    <Eye className="w-3 h-3 text-amber-500" />
                    <span>View As Role Preview</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleRolePreviewSelect(null)}
                      className={cn(
                        'px-2 py-1 rounded-md text-left transition-colors font-medium',
                        viewAsRole === null ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground',
                      )}
                    >
                      Reset (Default)
                    </button>
                    {AVAILABLE_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRolePreviewSelect(r)}
                        className={cn(
                          'px-2 py-1 rounded-md text-left truncate transition-colors capitalize font-medium',
                          viewAsRole === r ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground',
                        )}
                      >
                        {r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-muted text-foreground transition-colors text-left"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false);
                  onRequestLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
