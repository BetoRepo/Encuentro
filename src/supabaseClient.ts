import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ikiqphxigtwkjhiachqg.supabase.co';
// La clave anon es pública por diseño; la seguridad depende de las políticas RLS de la base de datos.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraXFwaHhpZ3R3a2poaWFjaHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTQ1NDIsImV4cCI6MjA5NjU3MDU0Mn0.s8QdkpqOihtanulS1okUkT3g1YCOPXxeOjrf67pZsio';

export const DB_TOKEN_KEY = 'enj_db_token';

const readDbToken = () => {
  try {
    const token = localStorage.getItem(DB_TOKEN_KEY);
    if (!token) return null;
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp === 'number' && exp * 1000 > Date.now() + 30_000 ? token : null;
  } catch {
    return null;
  }
};

export const hasValidDbToken = () => readDbToken() !== null;

// Con sesión, las consultas usan el JWT emitido por el backend para que RLS identifique al usuario;
// sin sesión (o si el backend no tiene SUPABASE_JWT_SECRET) se usa la clave anon.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => readDbToken() ?? supabaseAnonKey,
});
