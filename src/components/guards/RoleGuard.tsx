import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.ts';
import type { UserRole } from '../../types/auth.types.ts';
import { ForbiddenPage } from '../../pages/errors/ForbiddenPage.tsx';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    return <ForbiddenPage />;
  }

  return children ? <>{children}</> : <Outlet />;
}
