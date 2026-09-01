import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Root } from './components/Root'
import { Home, Inscripcion, Consultas, Perfil, Dashboard, ResetPassword } from './pages'
import { Login } from './pages/Login' // <-- Ajusta esta ruta según donde esté Login.tsx

// 1. CREAMOS EL GUARDIÁN DE RUTAS (PROTECTED ROUTE)
const ProtectedRoute = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Sesión inválida');
        const result = await response.json();
        setUser(result.user);
        localStorage.setItem('enj_user', JSON.stringify(result.user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('enj_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    // Pantalla de carga mientras Supabase verifica la sesión
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000B6F' }}>
        <h2>Verificando sesión...</h2>
      </div>
    );
  }

  // Si hay sesión, muestra las páginas. Si no, lo manda a /login.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// 2. CONFIGURACIÓN DEL ENRUTADOR
export const router = createBrowserRouter(
  [
    {
      // La ruta pública (Login) va separada para que no pida autenticación
      path: '/login',
      element: <Login />,
    },
    {
      path: '/reset-password',
      element: <ResetPassword />,
    },
    {
      // Agrupamos todas las demás rutas dentro del Guardián
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/',
          element: <Root />, // Root manejará el Layout (Menú lateral/Navbar)
          children: [
            { index: true, element: <Home /> },
            { path: 'consultas', element: <Consultas /> },
            { path: 'inscripcion', element: <Inscripcion /> },
            { path: 'perfil', element: <Perfil /> },
            { path: 'dashboard', element: <Dashboard /> },
          ],
        },
      ],
    },
  ],
  {
    basename: '/',
  }
)