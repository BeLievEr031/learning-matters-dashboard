import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, LogOut, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useScreens } from '../../hooks/use-screens.ts';
import { useThemeStore } from '../../store/theme.store.ts';
import { DynamicIcon } from '../common/DynamicIcon.tsx';
import { cn } from '@/lib/utils';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestLogout: () => void;
}

export function CommandMenu({ open, onOpenChange, onRequestLogout }: CommandMenuProps) {
  const navigate = useNavigate();
  const { accessibleScreens } = useScreens();
  const { theme, toggleTheme } = useThemeStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Focus search input when open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Filter accessible screens and actions
  const filteredScreens = accessibleScreens.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const actions = [
    {
      id: 'action-theme',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => {
        toggleTheme();
        onOpenChange(false);
      },
    },
    {
      id: 'action-logout',
      title: 'Sign Out of Account',
      icon: LogOut,
      run: () => {
        onOpenChange(false);
        onRequestLogout();
      },
    },
  ].filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const totalItems = filteredScreens.length + actions.length;

  const handleClose = () => {
    setSearch('');
    setSelectedIndex(0);
    onOpenChange(false);
  };

  const handleSelect = (index: number) => {
    if (index < filteredScreens.length) {
      const screen = filteredScreens[index];
      if (screen) {
        navigate(screen.path);
        handleClose();
      }
    } else {
      const action = actions[index - filteredScreens.length];
      if (action) {
        action.run();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl overflow-hidden z-10 animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border/60">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a screen name or action to jump..."
            className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-border text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {totalItems === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No matching screens or actions found for "{search}".
            </div>
          )}

          {/* Screens Section */}
          {filteredScreens.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Screens & Modules
              </p>
              {filteredScreens.map((screen, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={screen.id}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left group',
                      isSelected ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-foreground',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <DynamicIcon name={screen.iconName} className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="font-medium">{screen.title}</p>
                        {screen.description && (
                          <p
                            className={cn(
                              'text-[10px]',
                              isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                            )}
                          >
                            {screen.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected ? (
                      <CornerDownLeft className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Actions Section */}
          {actions.length > 0 && (
            <div className="pt-2 border-t border-border/40">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </p>
              {actions.map((action, idx) => {
                const actualIndex = filteredScreens.length + idx;
                const isSelected = selectedIndex === actualIndex;
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleSelect(actualIndex)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left',
                      isSelected ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-foreground',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ActionIcon className="w-4 h-4 shrink-0" />
                      <span>{action.title}</span>
                    </div>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
