import React, { useEffect, useState } from 'react';
import { CalendarClock, Download, RefreshCw, Search, UserPlus, Users, X } from 'lucide-react';
import { formatRango, seSolapan, tallerRequest, type TallerActividad, type TallerPersona } from '../talleres';

// Cuadro para que Programa inscriba a un participante en las sesiones que necesite.
const CargarActividades: React.FC<{ actividades: TallerActividad[]; onCambio: () => Promise<void> }> = ({ actividades, onCambio }) => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<TallerPersona[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [persona, setPersona] = useState<TallerPersona | null>(null);
  const [sesionId, setSesionId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    const q = busqueda.trim();
    if (persona || q.length < 2) { setResultados([]); return; }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await tallerRequest<{ participantes: TallerPersona[] }>(`/api/programa/talleres/participantes?q=${encodeURIComponent(q)}`);
        setResultados(data.participantes);
      } catch (err) {
        setMensaje({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo buscar participantes.' });
      } finally {
        setBuscando(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, persona]);

  // Sesiones donde ya está inscrita la persona seleccionada.
  const actuales = persona
    ? actividades.flatMap((act) => act.sesiones.filter((ses) => (ses.personas || []).some((p) => p.id === persona.id)).map((ses) => ({ act, ses })))
    : [];

  const motivoBloqueo = (act: TallerActividad) => (actuales.some((a) => a.act.id === act.id) ? 'ya inscrito en esta actividad' : '');

  // Los cruces y los cupos llenos no bloquean: Programa puede inscribir igual, solo se avisa.
  const avisos = (act: TallerActividad, ses: TallerActividad['sesiones'][number]) => {
    const choque = actuales.find((a) => seSolapan(a.ses, ses))?.act.nombre;
    return [ses.inscritos >= act.cupo && 'llena', choque && `choca con ${choque}`].filter(Boolean) as string[];
  };
  const elegida = actividades.flatMap((act) => act.sesiones.map((ses) => ({ act, ses }))).find(({ ses }) => ses.id === sesionId);
  const avisosElegida = elegida ? avisos(elegida.act, elegida.ses) : [];

  const seleccionar = (p: TallerPersona) => {
    setPersona(p);
    setBusqueda(p.nombre);
    setResultados([]);
    setSesionId('');
    setMensaje(null);
  };

  const limpiar = () => {
    setPersona(null);
    setBusqueda('');
    setSesionId('');
  };

  const inscribir = async () => {
    if (!persona || !sesionId) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await tallerRequest('/api/programa/talleres/inscripcion', { method: 'POST', body: JSON.stringify({ userId: persona.id, sesionId }) });
      setMensaje({ tipo: 'ok', texto: `${persona.nombre} quedó inscrito.` });
      setSesionId('');
      await onCambio();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo completar la inscripción.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mb-6 border border-blue-200 bg-blue-50/50 rounded-xl p-4">
      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
        <UserPlus size={16} className="text-blue-700" /> Cargar actividades a un participante
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-start">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPersona(null); }}
            placeholder="Buscar por nombre o correo"
            className="w-full pl-8 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {busqueda && (
            <button onClick={limpiar} className="absolute right-2 top-2 text-slate-400 hover:text-slate-700" aria-label="Limpiar búsqueda"><X size={16} /></button>
          )}
          {!persona && busqueda.trim().length >= 2 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-auto text-sm">
              {buscando && <li className="px-3 py-2 text-slate-400">Buscando...</li>}
              {!buscando && resultados.length === 0 && <li className="px-3 py-2 text-slate-400">Sin resultados</li>}
              {resultados.map((p) => (
                <li key={p.id}>
                  <button onClick={() => seleccionar(p)} className="w-full text-left px-3 py-2 hover:bg-blue-50">
                    <span className="font-semibold text-slate-800">{p.nombre}</span>
                    <span className="block text-xs text-slate-500">{[p.email, p.crew && `Crew ${p.crew}`, p.grupo].filter(Boolean).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <select
          value={sesionId}
          onChange={(e) => setSesionId(e.target.value)}
          disabled={!persona}
          className="w-full py-2 px-2 text-sm border border-slate-300 rounded-lg bg-white disabled:opacity-50"
        >
          <option value="">{persona ? 'Elige la sesión' : 'Primero elige un participante'}</option>
          {actividades.map((act) => (
            <optgroup key={act.id} label={act.nombre}>
              {act.sesiones.map((ses) => {
                const motivo = motivoBloqueo(act);
                const notas = motivo ? [motivo] : avisos(act, ses);
                return (
                  <option key={ses.id} value={ses.id} disabled={Boolean(motivo)}>
                    {formatRango(ses)} · {ses.inscritos}/{act.cupo}{notas.map((n) => ` · ${n}`).join('')}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
        <button
          onClick={inscribir}
          disabled={!persona || !sesionId || guardando}
          className="inline-flex items-center justify-center gap-1 text-xs font-bold bg-blue-700 text-white px-4 py-2.5 rounded-lg hover:bg-blue-800 active:scale-95 disabled:opacity-50"
        >
          <UserPlus size={13} /> {guardando ? 'Inscribiendo...' : 'Inscribir'}
        </button>
      </div>
      {persona && (
        <p className="mt-3 text-xs text-slate-600">
          {actuales.length === 0
            ? `${persona.nombre} todavía no tiene actividades.`
            : `${persona.nombre} tiene ${actuales.length}: ${actuales.map((a) => `${a.act.nombre} (${formatRango(a.ses)})`).join(', ')}.`}
        </p>
      )}
      {avisosElegida.length > 0 && (
        <p className="mt-2 text-xs font-semibold text-amber-800 bg-amber-50 p-2 rounded-lg">
          Ojo: esta sesión está {avisosElegida.join(' y ')}. Se puede inscribir igual.
        </p>
      )}
      {mensaje && (
        <p className={`mt-3 text-sm font-semibold p-2 rounded-lg ${mensaje.tipo === 'ok' ? 'text-emerald-800 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>{mensaje.texto}</p>
      )}
    </div>
  );
};

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

  const retirar = async (actividad: TallerActividad, sesion: TallerActividad['sesiones'][number], persona: TallerPersona) => {
    if (!window.confirm(`¿Retirar a ${persona.nombre} de ${actividad.nombre} (${formatRango(sesion)})?`)) return;
    try {
      await tallerRequest(`/api/programa/talleres/inscripcion/${encodeURIComponent(sesion.id)}/${encodeURIComponent(persona.id)}`, { method: 'DELETE' });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo retirar al participante.');
    }
  };

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

      <CargarActividades actividades={actividades} onCambio={cargar} />

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
                            <li key={persona.id} className="group">
                              <span className="font-semibold">{persona.nombre}</span>
                              {(persona.crew || persona.grupo) && (
                                <span className="text-slate-400"> · {[persona.crew && `Crew ${persona.crew}`, persona.grupo].filter(Boolean).join(' · ')}</span>
                              )}
                              <button
                                onClick={() => retirar(actividad, sesion, persona)}
                                className="ml-1 align-middle text-slate-300 hover:text-red-600"
                                title="Retirar de esta sesión"
                                aria-label={`Retirar a ${persona.nombre}`}
                              >
                                <X size={12} />
                              </button>
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
