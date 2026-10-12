import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SCREENS_REGISTRY } from './config/screens.config.ts';
import { AuthGuard } from './components/guards/AuthGuard.tsx';
import { GuestGuard } from './components/guards/GuestGuard.tsx';
import { RoleGuard } from './components/guards/RoleGuard.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { NotFoundPage } from './pages/errors/NotFoundPage.tsx';
import { RouteErrorPage } from './pages/errors/RouteErrorPage.tsx';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: '/login',
    errorElement: <RouteErrorPage />,
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },

  // Protected App Routes wrapped in AuthGuard and AppShell
  {
    element: <AuthGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppShell />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          ...SCREENS_REGISTRY.map((screen) => {
            const Component = screen.component;
            return {
              path: screen.path,
              errorElement: <RouteErrorPage />,
              element: (
                <RoleGuard allowedRoles={screen.allowedRoles}>
                  <Component />
                </RoleGuard>
              ),
            };
          }),
        ],
      },
    ],
  },

  // Fallback 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
