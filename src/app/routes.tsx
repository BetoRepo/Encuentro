import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Root } from './components/Root';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

// Las páginas pesadas (Dashboard con xlsx, Perfil, Inscripción) se descargan solo cuando se visitan.
const PerfilPublico = lazy(() => import('./components/PerfilPublico').then((m) => ({ default: m.PerfilPublico })));
const Inscripcion = lazy(() => import('./pages/Inscripcion').then((m) => ({ default: m.Inscripcion })));
const Consultas = lazy(() => import('./pages/Consultas').then((m) => ({ default: m.Consultas })));
const Perfil = lazy(() => import('./pages/Perfil').then((m) => ({ default: m.Perfil })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const PanelPrograma = lazy(() => import('./pages/PanelPrograma').then((m) => ({ default: m.PanelPrograma })));

const withSuspense = (page: ReactNode) => (
  <Suspense fallback={<div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
    {page}
  </Suspense>
);

// GUARDIÁN DE AUTENTICACIÓN GENERAL
const ProtectedRoute = () => {
  const storedUser = localStorage.getItem('enj_user');
  if (!storedUser) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// GUARDIÁN DE ROLES: solo oculta la interfaz; los datos los protege el servidor y RLS.
const RoleGuard = ({ allowedRoles, children }: { allowedRoles: string[]; children: ReactNode }) => {
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
      element: withSuspense(<PerfilPublico />),
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
            { path: 'inscripcion', element: withSuspense(<Inscripcion />) },
            { path: 'perfil', element: withSuspense(<Perfil />) },
            {
              // ELIMINADO EL ROLEGUARD: Ahora todos los participantes autenticados pueden ver 'consultas'
              path: 'consultas',
              element: withSuspense(<Consultas />)
            },
            { 
              // NUEVA RUTA: Solo para Programa y Administradores
              path: 'panel-programa', 
              element: (
                <RoleGuard allowedRoles={['admin', 'programa']}>
                  {withSuspense(<PanelPrograma />)}
                </RoleGuard>
              ) 
            },
            { 
              path: 'dashboard', 
              element: (
                <RoleGuard allowedRoles={['admin']}>
                  {withSuspense(<Dashboard />)}
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