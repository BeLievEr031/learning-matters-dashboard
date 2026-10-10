import { useMemo } from 'react';
import { useAuthStore } from '../store/auth.store.ts';
import {
  getAccessibleScreens,
  getSidebarNavigation,
  isScreenAccessible,
  isPathAccessible,
  SCREENS_REGISTRY,
} from '../config/screens.config.ts';

export function useScreens() {
  const { user, viewAsRole, setViewAsRole, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const accessibleScreens = useMemo(() => {
    if (!effectiveRole) return [];
    return getAccessibleScreens(effectiveRole);
  }, [effectiveRole]);

  const sidebarGroups = useMemo(() => {
    if (!effectiveRole) return [];
    return getSidebarNavigation(effectiveRole);
  }, [effectiveRole]);

  const canAccessScreen = (screenId: string) => {
    if (!effectiveRole) return false;
    return isScreenAccessible(screenId, effectiveRole);
  };

  const canAccessPath = (path: string) => {
    if (!effectiveRole) return false;
    return isPathAccessible(path, effectiveRole);
  };

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
