import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store.ts';
import { authApi } from '../api/auth.api.ts';

export function useAuthSession() {
  const { user, accessToken, isAuthenticated, setUser, logout } = useAuthStore();
  const [isHydrating, setIsHydrating] = useState(() => Boolean(useAuthStore.getState().accessToken));

  const refreshSession = useCallback(async () => {
    if (!accessToken) {
      setIsHydrating(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response?.user) {
        setUser(response.user);
      }
    } catch {
      // If 401 occurs and refresh fails, the apiClient interceptor already triggers logout()
    } finally {
      setIsHydrating(false);
    }
  }, [accessToken, setUser]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isMounted = true;

    authApi
      .getMe()
      .then((response) => {
        if (isMounted && response?.user) {
          setUser(response.user);
        }
      })
      .catch(() => {
        // Handled by apiClient interceptor
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, setUser]);

  return {
    user,
    isAuthenticated,
    isHydrating,
    refreshSession,
    logout,
  };
}
