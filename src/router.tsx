import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SCREENS_REGISTRY } from './config/screens.config.ts';
import { AuthGuard } from './components/guards/AuthGuard.tsx';
import { GuestGuard } from './components/guards/GuestGuard.tsx';
import { RoleGuard } from './components/guards/RoleGuard.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { NotFoundPage } from './pages/errors/NotFoundPage.tsx';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },

  // Protected App Routes
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      ...SCREENS_REGISTRY.map((screen) => {
        const Component = screen.component;
        return {
          path: screen.path,
          element: (
            <RoleGuard allowedRoles={screen.allowedRoles}>
              <Component />
            </RoleGuard>
          ),
        };
      }),
    ],
  },

  // Fallback 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
