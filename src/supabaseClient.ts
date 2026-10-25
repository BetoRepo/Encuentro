import { createClient } from '@supabase/supabase-js';

// Proyecto Supabase actual (migrado el 2026-10-25 desde ikiqphxigtwkjhiachqg).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jbuhszqnjvbtzqusaluw.supabase.co';
// La clave anon es pública por diseño; la seguridad depende de las políticas RLS de la base de datos.
// Debe configurarse en Vercel como VITE_SUPABASE_ANON_KEY (Supabase → Settings → API Keys → Legacy → anon).
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
if (!supabaseAnonKey) console.error('Falta VITE_SUPABASE_ANON_KEY: configura la clave anon del proyecto jbuhszqnjvbtzqusaluw.');

export const DB_TOKEN_KEY = 'enj_db_token';

// Si Supabase rechaza el token del backend (secreto mal configurado), se deja de usar en esta pestaña.
let dbTokenRejected = false;

const readDbToken = () => {
  if (dbTokenRejected) return null;
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

// Reintenta con la clave anon cuando Supabase responde 401 al token del backend,
// para que un error de configuración no deje la aplicación sin poder leer ni guardar.
const fetchWithFallback: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  const headers = new Headers(init?.headers);
  const authorization = headers.get('Authorization');
  if (response.status !== 401 || !authorization || authorization === `Bearer ${supabaseAnonKey}`) return response;

  console.error('Supabase rechazó el token de sesión; se usará la clave pública. Revisa SUPABASE_JWT_SECRET en el servidor.');
  dbTokenRejected = true;
  headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
  return fetch(input, { ...init, headers });
};

// Con sesión, las consultas usan el JWT emitido por el backend para que RLS identifique al usuario;
// sin sesión (o si el backend no tiene SUPABASE_JWT_SECRET) se usa la clave anon.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => readDbToken() ?? supabaseAnonKey,
  global: { fetch: fetchWithFallback },
});
