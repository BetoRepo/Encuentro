import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Root } from './components/Root'
import { PerfilPublico } from './components/PerfilPublico'
import { Home, Inscripcion, Consultas, Perfil, Dashboard, ChangePassword } from './pages'
import { Login } from './pages/Login' // <-- Ajusta esta ruta según donde esté Login.tsx

// 1. CREAMOS EL GUARDIÁN DE RUTAS (PROTECTED ROUTE)
const ProtectedRoute = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('enj_user');
    const storedToken = localStorage.getItem('token');
    if (!storedUser || !storedToken) {
      setLoading(false);
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('enj_user');
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${storedToken}` }, signal: controller.signal })
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
      .finally(() => {
        window.clearTimeout(timeoutId);
        setLoading(false);
      });
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
      // Ruta pública del perfil QR, accesible sin sesión
      path: '/scout/:id',
      element: <PerfilPublico />,
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
            { path: 'cambiar-contrasena', element: <ChangePassword /> },
          ],
        },
      ],
    },
  ],
  {
    basename: '/',
  }
)