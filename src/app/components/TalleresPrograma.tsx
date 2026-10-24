import React, { useEffect, useState } from 'react';
import { CalendarClock, RefreshCw, Users } from 'lucide-react';
import { formatRango, tallerRequest, type TallerActividad } from '../talleres';

// Pestaña del Panel de Programa: inscritos de cada sesión de los talleres.
export const TalleresPrograma: React.FC = () => {
  const [actividades, setActividades] = useState<TallerActividad[]>([]);
  const [minimoActividades, setMinimoActividades] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tallerRequest<{ actividades: TallerActividad[]; minimoActividades: number }>('/api/programa/talleres');
      setActividades(data.actividades);
      setMinimoActividades(data.minimoActividades);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los inscritos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const total = actividades.reduce((suma, act) => suma + act.sesiones.reduce((s, ses) => s + ses.inscritos, 0), 0);

  // Actividades por persona, para saber quién no ha llegado al mínimo.
  const porPersona = new Map<string, { nombre: string; cantidad: number }>();
  actividades.forEach((act) => act.sesiones.forEach((ses) => (ses.personas || []).forEach((persona) => {
    const actual = porPersona.get(persona.id) || { nombre: persona.nombre, cantidad: 0 };
    porPersona.set(persona.id, { ...actual, cantidad: actual.cantidad + 1 });
  })));
  const pendientes = [...porPersona.values()].filter((p) => p.cantidad < minimoActividades).sort((a, b) => a.cantidad - b.cantidad);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800">Inscritos en Talleres</h2>
          <p className="text-xs text-slate-500 mt-1">
            {total} inscripciones · {porPersona.size} delegados · {porPersona.size - pendientes.length} con {minimoActividades}+ actividades · cada sesión abre con mínimo {actividades[0]?.minimo ?? 13} personas
          </p>
        </div>
        <button onClick={cargar} className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded hover:bg-slate-200 active:scale-95">
          <RefreshCw size={13} /> Refrescar
        </button>
      </div>

      {error && <p className="mb-4 text-sm font-semibold text-red-700 bg-red-50 p-3 rounded-lg">{error}</p>}

      {!loading && pendientes.length > 0 && (
        <details className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <summary className="text-sm font-bold text-amber-900 cursor-pointer">
            {pendientes.length} delegados aún no llegan a {minimoActividades} actividades
          </summary>
          <ul className="mt-2 text-xs text-amber-900 grid grid-cols-1 md:grid-cols-3 gap-1">
            {pendientes.map((p, i) => <li key={i}>{p.nombre} · {p.cantidad}/{minimoActividades}</li>)}
          </ul>
        </details>
      )}

      {loading ? (
        <p className="text-center text-sm text-slate-500 py-10">Cargando inscritos...</p>
      ) : (
        <div className="space-y-5">
          {actividades.map((actividad) => (
            <section key={actividad.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <header className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CalendarClock size={16} className="text-pink-600" /> {actividad.nombre}
                </h3>
                <span className="text-xs text-slate-500">{actividad.encargados} · {actividad.duracion} · cupo {actividad.cupo}</span>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {actividad.sesiones.map((sesion) => {
                  const confirmada = sesion.inscritos >= actividad.minimo;
                  return (
                    <div key={sesion.id} className="p-4">
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="font-bold text-blue-800 text-sm tabular-nums">{formatRango(sesion)}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          sesion.inscritos >= actividad.cupo ? 'bg-slate-800 text-white' : confirmada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sesion.inscritos}/{actividad.cupo} {sesion.inscritos >= actividad.cupo ? 'lleno' : confirmada ? 'confirmada' : `faltan ${actividad.minimo - sesion.inscritos}`}
                        </span>
                      </div>
                      {(sesion.personas || []).length === 0 ? (
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Users size={12} /> Sin inscritos todavía</p>
                      ) : (
                        <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                          {(sesion.personas || []).map((persona) => (
                            <li key={persona.id}>
                              <span className="font-semibold">{persona.nombre}</span>
                              {(persona.crew || persona.grupo) && (
                                <span className="text-slate-400"> · {[persona.crew && `Crew ${persona.crew}`, persona.grupo].filter(Boolean).join(' · ')}</span>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
