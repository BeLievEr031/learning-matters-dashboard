import { create } from 'zustand';
import { STORAGE_KEYS } from '../config/env.ts';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
    return stored || 'dark'; // Default to sleek modern dark theme
  } catch {
    return 'dark';
  }
}

function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const initialTheme = getStoredTheme();
applyThemeToDocument(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    applyThemeToDocument(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
