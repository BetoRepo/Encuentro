import React, { useEffect, useState } from 'react';
import { CalendarClock, Download, RefreshCw, Users } from 'lucide-react';
import { formatRango, tallerRequest, type TallerActividad } from '../talleres';

// Pestaña del Panel de Programa: inscritos de cada sesión de los talleres.
export const TalleresPrograma: React.FC = () => {
  const [actividades, setActividades] = useState<TallerActividad[]>([]);
  const [minimoActividades, setMinimoActividades] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState(false);

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

  // Excel con tres hojas: inscritos por taller, agenda de cada delegado y resumen de cupos.
  const descargarExcel = async () => {
    setExportando(true);
    try {
      const XLSX = await import('@e965/xlsx');
      const fecha = (valor?: string) => (valor ? new Date(valor).toLocaleString('es-VE') : '');

      const porTaller = actividades.flatMap((act) => act.sesiones.flatMap((ses) => (ses.personas || []).map((persona, index) => ({
        Taller: act.nombre,
        Horario: formatRango(ses),
        Encargados: act.encargados,
        'N°': index + 1,
        Nombre: persona.nombre,
        Correo: persona.email || '',
        Crew: persona.crew || '',
        'Región': persona.region || '',
        'Grupo scout': persona.grupo || '',
        'Fecha de inscripción': fecha(persona.fecha),
      }))));

      const delegados = new Map<string, { persona: NonNullable<TallerActividad['sesiones'][number]['personas']>[number]; talleres: Map<string, string> }>();
      actividades.forEach((act) => act.sesiones.forEach((ses) => (ses.personas || []).forEach((persona) => {
        const fila = delegados.get(persona.id) || { persona, talleres: new Map<string, string>() };
        fila.talleres.set(act.id, formatRango(ses));
        delegados.set(persona.id, fila);
      })));
      const porDelegado = [...delegados.values()]
        .sort((a, b) => a.persona.nombre.localeCompare(b.persona.nombre, 'es'))
        .map(({ persona, talleres }) => ({
          Nombre: persona.nombre,
          Correo: persona.email || '',
          Crew: persona.crew || '',
          'Región': persona.region || '',
          'Grupo scout': persona.grupo || '',
          Actividades: talleres.size,
          [`Cumple mínimo (${minimoActividades})`]: talleres.size >= minimoActividades ? 'SI' : 'NO',
          ...Object.fromEntries(actividades.map((act) => [act.nombre, talleres.get(act.id) || ''])),
        }));

      const resumen = actividades.flatMap((act) => act.sesiones.map((ses) => ({
        Taller: act.nombre,
        Horario: formatRango(ses),
        Encargados: act.encargados,
        Inscritos: ses.inscritos,
        Cupo: act.cupo,
        'Mínimo para abrir': act.minimo,
        Estado: ses.inscritos >= act.cupo ? 'Lleno' : ses.inscritos >= act.minimo ? 'Confirmada' : `Faltan ${act.minimo - ses.inscritos}`,
      })));

      const hoja = (filas: Record<string, unknown>[], vacio: string) => {
        if (filas.length === 0) return XLSX.utils.aoa_to_sheet([[vacio]]);
        const sheet = XLSX.utils.json_to_sheet(filas);
        sheet['!cols'] = Object.keys(filas[0]).map((col) => ({ wch: Math.min(Math.max(col.length + 2, ...filas.map((f) => String(f[col] ?? '').length + 2)), 40) }));
        return sheet;
      };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, hoja(porTaller, 'Todavía no hay inscritos.'), 'Por taller');
      XLSX.utils.book_append_sheet(workbook, hoja(porDelegado, 'Todavía no hay inscritos.'), 'Por delegado');
      XLSX.utils.book_append_sheet(workbook, hoja(resumen, 'Sin talleres.'), 'Resumen');
      XLSX.writeFile(workbook, `Talleres_ENJ_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el Excel.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800">Inscritos en Talleres</h2>
          <p className="text-xs text-slate-500 mt-1">
            {total} inscripciones · {porPersona.size} delegados · {porPersona.size - pendientes.length} con {minimoActividades}+ actividades · cada sesión abre con mínimo {actividades[0]?.minimo ?? 13} personas
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={descargarExcel}
            disabled={loading || exportando}
            className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            <Download size={13} /> {exportando ? 'Generando...' : 'Descargar Excel'}
          </button>
          <button onClick={cargar} className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded hover:bg-slate-200 active:scale-95">
            <RefreshCw size={13} /> Refrescar
          </button>
        </div>
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
