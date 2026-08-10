import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Root } from './components/Root'
import { Home, Inscripcion, Consultas, Perfil } from './pages'
import { Login } from './app/pages/Login' // <-- Ajusta esta ruta según donde esté Login.tsx
import { supabase } from './supabaseClient' // <-- Ajusta esta ruta a tu cliente de Supabase

// 1. CREAMOS EL GUARDIÁN DE RUTAS (PROTECTED ROUTE)
const ProtectedRoute = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisar la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios (cuando el usuario hace login o logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => subscription.unsubscribe();
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
  return session ? <Outlet /> : <Navigate to="/login" replace />;
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
          ],
        },
      ],
    },
  ],
  {
    basename: '/',
  }
)