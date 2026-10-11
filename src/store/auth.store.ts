import { create } from 'zustand';
import type { AuthTokens, AuthUser, UserRole } from '../types/auth.types.ts';
import { STORAGE_KEYS } from '../config/env.ts';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeSchoolId: string | null;
  viewAsRole: UserRole | null;

  // Actions
  setAuth: (tokens: AuthTokens, user: AuthUser) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: AuthUser) => void;
  setActiveSchoolId: (schoolId: string | null) => void;
  setViewAsRole: (role: UserRole | null) => void;
  logout: () => void;
  getEffectiveRole: () => UserRole | null;
}

function loadInitialState() {
  try {
    const rawAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const rawRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const accessToken =
      rawAccessToken && rawAccessToken !== 'undefined' && rawAccessToken !== 'null'
        ? rawAccessToken
        : null;
    const refreshToken =
      rawRefreshToken && rawRefreshToken !== 'undefined' && rawRefreshToken !== 'null'
        ? rawRefreshToken
        : null;
    const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
    const activeSchoolId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SCHOOL_ID);
    const viewAsRoleRaw = localStorage.getItem(STORAGE_KEYS.VIEW_AS_ROLE) as UserRole | null;

    const user: AuthUser | null = userRaw ? JSON.parse(userRaw) : null;
    const isAuthenticated = Boolean(user);

    return {
      accessToken,
      refreshToken,
      user,
      isAuthenticated,
      activeSchoolId: activeSchoolId || user?.schoolId || null,
      viewAsRole: viewAsRoleRaw || null,
      isLoading: false,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      activeSchoolId: null,
      viewAsRole: null,
      isLoading: false,
    };
  }
}

const initialState = loadInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setAuth: (tokens: AuthTokens, user: AuthUser) => {
    if (tokens.accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (user.schoolId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SCHOOL_ID, user.schoolId);
    }

    set({
      accessToken: tokens.accessToken || null,
      refreshToken: tokens.refreshToken || null,
      user,
      isAuthenticated: true,
      activeSchoolId: user.schoolId ?? get().activeSchoolId,
      isLoading: false,
    });
  },

  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  setUser: (user: AuthUser) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user });
  },

  setActiveSchoolId: (schoolId: string | null) => {
    if (schoolId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SCHOOL_ID, schoolId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SCHOOL_ID);
    }
    set({ activeSchoolId: schoolId });
  },

  setViewAsRole: (role: UserRole | null) => {
    if (role) {
      localStorage.setItem(STORAGE_KEYS.VIEW_AS_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.VIEW_AS_ROLE);
    }
    set({ viewAsRole: role });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SCHOOL_ID);
    localStorage.removeItem(STORAGE_KEYS.VIEW_AS_ROLE);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeSchoolId: null,
      viewAsRole: null,
      isLoading: false,
    });
  },

  getEffectiveRole: () => {
    const { user, viewAsRole } = get();
    if (!user) return null;
    // Super admins can preview the app as another role
    if (user.role === 'super_admin' && viewAsRole) {
      return viewAsRole;
    }
    return user.role;
  },
}));
