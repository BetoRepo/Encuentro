import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Root } from './components/Root';
import { PerfilPublico } from './components/PerfilPublico';
import { Home, Inscripcion, Consultas, Perfil, Dashboard } from './pages';
import { Login } from './pages/Login';

// GUARDIÁN DE AUTENTICACIÓN GENERAL
const ProtectedRoute = () => {
  const storedUser = localStorage.getItem('enj_user');
  if (!storedUser) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// GUARDIÁN DE ROLES
const RoleGuard = ({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) => {
  const storedUser = localStorage.getItem('enj_user');

  if (!storedUser) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(storedUser);
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />; // Redirige al Home si el participante intenta colarse por URL
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/scout/:id',
      element: <PerfilPublico />,
    },
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/',
          element: <Root />, 
          children: [
            { index: true, element: <Home /> },
            { path: 'inscripcion', element: <Inscripcion /> },
            { path: 'perfil', element: <Perfil /> },
            { 
              path: 'consultas', 
              element: (
                <RoleGuard allowedRoles={['admin', 'programa']}>
                  <Consultas />
                </RoleGuard>
              ) 
            },
            { 
              path: 'dashboard', 
              element: (
                <RoleGuard allowedRoles={['admin']}>
                  <Dashboard />
                </RoleGuard>
              ) 
            },
          ],
        },
      ],
    },
  ],
  {
    basename: '/',
  }
);