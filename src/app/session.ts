import { DB_TOKEN_KEY } from '../supabaseClient';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SessionPayload {
  token?: string;
  dbToken?: string | null;
  user: SessionUser;
}

export const getStoredUser = (): SessionUser | null => {
  try {
    return JSON.parse(localStorage.getItem('enj_user') || 'null');
  } catch {
    return null;
  }
};

export const saveSession = ({ token, dbToken, user }: SessionPayload) => {
  if (token) localStorage.setItem('token', token);
  if (dbToken) localStorage.setItem(DB_TOKEN_KEY, dbToken);
  else localStorage.removeItem(DB_TOKEN_KEY);
  localStorage.setItem('enj_user', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem(DB_TOKEN_KEY);
  localStorage.removeItem('enj_user');
};

// Confirma la sesión con el servidor: actualiza el rol real y renueva el token de base de datos.
// Devuelve null si la sesión ya no es válida.
export const refreshSession = async (): Promise<SessionUser | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401) {
      clearSession();
      return null;
    }
    if (!response.ok) return getStoredUser();
    const result = await response.json();
    saveSession({ dbToken: result.dbToken, user: result.user });
    return result.user;
  } catch {
    // Sin conexión: se mantiene la sesión local hasta poder verificarla.
    return getStoredUser();
  }
};
