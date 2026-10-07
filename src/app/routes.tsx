import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Root } from './components/Root';
import { PerfilPublico } from './components/PerfilPublico';
import { Home, Inscripcion, Consultas, Perfil, Dashboard, PanelPrograma } from './pages';
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
              // ELIMINADO EL ROLEGUARD: Ahora todos los participantes autenticados pueden ver 'consultas'
              path: 'consultas', 
              element: <Consultas />
            },
            { 
              // NUEVA RUTA: Solo para Programa y Administradores
              path: 'panel-programa', 
              element: (
                <RoleGuard allowedRoles={['admin', 'programa']}>
                  <PanelPrograma />
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