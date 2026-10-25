// Talleres del ENJ 2026: cada actividad se dicta en varias sesiones y cada protagonista
// se inscribe en una sola sesión por actividad, sin cruces de horario.
// Las horas van en formato 24 h ('HH:MM') para poder compararlas como texto.

export const MINIMO_INSCRITOS = 13;
// Cada delegado debe inscribirse en al menos esta cantidad de actividades.
export const MINIMO_ACTIVIDADES = 4;
// Interruptor de inscripciones: en false el cuadro no aparece en el Perfil y nadie puede inscribirse.
export const TALLERES_ABIERTOS = true;

const actividad = (id, nombre, encargados, duracion, cupo, horarios) => ({
  id,
  nombre,
  encargados,
  duracion,
  cupo,
  sesiones: horarios.map(([inicio, fin], index) => ({ id: `${id}-${index + 1}`, inicio, fin })),
});

export const ACTIVIDADES = [
  actividad('lengua-senas', 'Lengua de señas', 'Andrés Marín', '35 min', 14, [['12:45', '13:20'], ['14:30', '15:05'], ['16:00', '16:35']]),
  actividad('negociacion', 'Negociación', 'Gabriel Dávila', '35 min', 14, [['12:45', '13:20'], ['15:00', '15:35'], ['17:10', '17:45']]),
  actividad('uso-ia', 'Uso de IA', 'Miguel Ciavato', '35 min', 14, [['12:45', '13:20'], ['14:30', '15:05'], ['18:00', '18:35']]),
  actividad('excel', 'Excel', 'Gerardo Mirena', '30 min', 13, [['12:45', '13:15'], ['15:00', '15:30'], ['16:35', '17:05']]),
  actividad('juegos-extremos', 'Juegos extremos', 'Freddy Guevara y equipo', '1 h', 15, [['14:00', '15:00'], ['17:00', '18:00']]),
  actividad('cv', 'CV', 'Eymer', '30 min', 14, [['13:15', '13:45'], ['15:30', '16:00'], ['18:30', '19:00']]),
  actividad('yoga', 'Yoga', 'Zormirca', '10 min', 22, [['13:20', '13:30'], ['16:00', '16:10'], ['18:00', '18:10']]),
  actividad('ingles-emprendedor', 'Inglés emprendedor', 'Andrés Figuera', '50 min', 16, [['13:00', '13:50'], ['14:30', '15:20'], ['16:30', '17:20']]),
  actividad('canva', 'Uso de Canva', 'Valen Rojas', '30 min', 16, [['13:20', '13:50'], ['15:00', '15:30'], ['17:30', '18:00']]),
  actividad('rally-vlogs', 'Rally de vlogs', 'Sebastián e Irene', '40 min', 20, [['13:20', '14:00'], ['15:00', '15:40'], ['18:00', '18:40']]),
];

const SESIONES = new Map(ACTIVIDADES.flatMap((act) => act.sesiones.map((sesion) => [sesion.id, { ...sesion, actividad: act }])));

export const findSesion = (sesionId) => SESIONES.get(sesionId) || null;

export const seSolapan = (a, b) => a.inicio < b.fin && b.inicio < a.fin;

// Revisa si el usuario puede tomar la sesión dadas sus inscripciones actuales (lista de sesion_id).
export function validarInscripcion(sesionId, sesionesActuales = []) {
  const sesion = findSesion(sesionId);
  if (!sesion) return { ok: false, error: 'La sesión solicitada no existe.' };
  for (const actualId of sesionesActuales) {
    const actual = findSesion(actualId);
    if (!actual) continue;
    if (actual.actividad.id === sesion.actividad.id) {
      return { ok: false, error: `Ya estás inscrito en ${sesion.actividad.nombre}. Retírate de tu sesión actual para cambiarla.` };
    }
    if (seSolapan(actual, sesion)) {
      return { ok: false, error: `Ese horario choca con ${actual.actividad.nombre} (${actual.inicio}–${actual.fin}).` };
    }
  }
  return { ok: true, sesion };
}

// Arma el catálogo con el conteo de inscritos por sesión. Si se pasan personas, agrega la lista de inscritos.
export function buildTalleresPayload(inscripciones = [], personas = null) {
  const porSesion = new Map();
  for (const fila of inscripciones) {
    if (!porSesion.has(fila.sesion_id)) porSesion.set(fila.sesion_id, []);
    porSesion.get(fila.sesion_id).push(fila);
  }
  return ACTIVIDADES.map((act) => ({
    ...act,
    minimo: MINIMO_INSCRITOS,
    sesiones: act.sesiones.map((sesion) => {
      const filas = porSesion.get(sesion.id) || [];
      return {
        ...sesion,
        inscritos: filas.length,
        ...(personas ? { personas: filas.map((fila) => ({ fecha: fila.created_at, ...(personas.get(fila.user_id) || { id: fila.user_id, nombre: 'Sin nombre' }) })) } : {}),
      };
    }),
  }));
}

export default { ACTIVIDADES, MINIMO_INSCRITOS, MINIMO_ACTIVIDADES, TALLERES_ABIERTOS, findSesion, seSolapan, validarInscripcion, buildTalleresPayload };
