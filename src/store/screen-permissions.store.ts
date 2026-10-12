import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '../types/auth.types.ts';
import { SCREENS_REGISTRY } from '../config/screens.config.ts';

export interface ScreenPermissionsState {
  customPermissions: Record<string, UserRole[]>;
  getScreenRoles: (screenId: string) => UserRole[];
  toggleRole: (screenId: string, role: UserRole) => void;
  setScreenRoles: (screenId: string, roles: UserRole[]) => void;
  bulkSetCategoryRoles: (categoryId: string, role: UserRole, enable: boolean) => void;
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (jsonStr: string) => boolean;
}

export const useScreenPermissionsStore = create<ScreenPermissionsState>()(
  persist(
    (set, get) => ({
      customPermissions: {},

      getScreenRoles: (screenId: string): UserRole[] => {
        const custom = get().customPermissions[screenId];
        if (custom) return custom;
        const defaultScreen = SCREENS_REGISTRY.find((s) => s.id === screenId);
        return defaultScreen ? [...defaultScreen.allowedRoles] : [];
      },

      toggleRole: (screenId: string, role: UserRole) => {
        const currentRoles = get().getScreenRoles(screenId);
        const hasRole = currentRoles.includes(role);
        const updatedRoles = hasRole
          ? currentRoles.filter((r) => r !== role)
          : [...currentRoles, role];

        set((state) => ({
          customPermissions: {
            ...state.customPermissions,
            [screenId]: updatedRoles,
          },
        }));
      },

      setScreenRoles: (screenId: string, roles: UserRole[]) => {
        set((state) => ({
          customPermissions: {
            ...state.customPermissions,
            [screenId]: roles,
          },
        }));
      },

      bulkSetCategoryRoles: (categoryId: string, role: UserRole, enable: boolean) => {
        const categoryScreens = SCREENS_REGISTRY.filter((s) => s.category === categoryId);
        const updatedPermissions = { ...get().customPermissions };

        categoryScreens.forEach((screen) => {
          const current = get().getScreenRoles(screen.id);
          if (enable) {
            if (!current.includes(role)) {
              updatedPermissions[screen.id] = [...current, role];
            }
          } else {
            updatedPermissions[screen.id] = current.filter((r) => r !== role);
          }
        });

        set({ customPermissions: updatedPermissions });
      },

      resetToDefaults: () => {
        set({ customPermissions: {} });
      },

      exportConfig: () => {
        const fullConfig: Record<string, UserRole[]> = {};
        SCREENS_REGISTRY.forEach((s) => {
          fullConfig[s.id] = get().getScreenRoles(s.id);
        });
        return JSON.stringify(fullConfig, null, 2);
      },

      importConfig: (jsonStr: string) => {
        try {
          const parsed = JSON.parse(jsonStr) as Record<string, UserRole[]>;
          if (typeof parsed !== 'object' || parsed === null) return false;
          set({ customPermissions: parsed });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'learning-matters-screen-permissions',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
