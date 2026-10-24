// Tipos y utilidades compartidas de los talleres (el catálogo vive en server/talleres.mjs).

export interface TallerPersona {
  id: string;
  nombre: string;
  email?: string;
  crew?: string | null;
  region?: string | null;
  grupo?: string | null;
  fecha?: string;
}

export interface TallerSesion {
  id: string;
  inicio: string;
  fin: string;
  inscritos: number;
  personas?: TallerPersona[];
}

export interface TallerActividad {
  id: string;
  nombre: string;
  encargados: string;
  duracion: string;
  cupo: number;
  minimo: number;
  sesiones: TallerSesion[];
}

const authHeaders = (): Record<string, string> => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });

export async function tallerRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) throw new Error(result.error || 'No se pudo conectar con el servidor.');
  return result as T;
}

// '13:20' -> '1:20 pm'
export const formatHora = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

export const formatRango = (sesion: { inicio: string; fin: string }) => `${formatHora(sesion.inicio).replace(/ (am|pm)$/, '')} – ${formatHora(sesion.fin)}`;

export const seSolapan = (a: { inicio: string; fin: string }, b: { inicio: string; fin: string }) => a.inicio < b.fin && b.inicio < a.fin;
