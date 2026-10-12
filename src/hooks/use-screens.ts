import { useMemo, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store.ts';
import { useScreenPermissionsStore } from '../store/screen-permissions.store.ts';
import {
  CATEGORIES,
  SCREENS_REGISTRY,
} from '../config/screens.config.ts';

export function useScreens() {
  const { user, viewAsRole, setViewAsRole, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  const customPermissions = useScreenPermissionsStore((state) => state.customPermissions);

  // Filter accessible screens based on dynamic permission store
  const accessibleScreens = useMemo(() => {
    if (!effectiveRole) return [];
    return SCREENS_REGISTRY.filter((screen) => {
      const allowedRoles = customPermissions[screen.id] ?? screen.allowedRoles;
      return allowedRoles.includes(effectiveRole);
    });
  }, [effectiveRole, customPermissions]);

  // Compute grouped sidebar navigation dynamically
  const sidebarGroups = useMemo(() => {
    if (!effectiveRole) return [];
    const accessible = accessibleScreens.filter((s) => s.showInSidebar);
    const categories = Object.values(CATEGORIES).sort((a, b) => a.order - b.order);

    return categories
      .map((category) => ({
        category,
        screens: accessible
          .filter((s) => s.category === category.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.screens.length > 0);
  }, [effectiveRole, accessibleScreens]);

  const canAccessScreen = useCallback(
    (screenId: string) => {
      if (!effectiveRole) return false;
      const screen = SCREENS_REGISTRY.find((s) => s.id === screenId);
      if (!screen) return false;
      const allowed = customPermissions[screenId] ?? screen.allowedRoles;
      return allowed.includes(effectiveRole);
    },
    [effectiveRole, customPermissions],
  );

  const canAccessPath = useCallback(
    (path: string) => {
      if (!effectiveRole) return false;
      const targetScreen = SCREENS_REGISTRY.find(
        (s) => s.path === path || (s.path !== '/' && path.startsWith(s.path)),
      );
      if (!targetScreen) return false;
      const allowed = customPermissions[targetScreen.id] ?? targetScreen.allowedRoles;
      return allowed.includes(effectiveRole);
    },
    [effectiveRole, customPermissions],
  );

  return {
    allScreens: SCREENS_REGISTRY,
    accessibleScreens,
    sidebarGroups,
    canAccessScreen,
    canAccessPath,
    effectiveRole,
    actualRole: user?.role ?? null,
    viewAsRole,
    setViewAsRole,
    isImpersonating: Boolean(viewAsRole && user?.role === 'super_admin'),
  };
}
