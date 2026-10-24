import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Users, X } from "lucide-react";
import { formatRango, seSolapan, tallerRequest, type TallerActividad, type TallerSesion } from "../talleres";

// Cuadro del Perfil donde cada protagonista se inscribe en los talleres (una sesión por actividad).
export function TalleresPerfil() {
  const [actividades, setActividades] = useState<TallerActividad[]>([]);
  const [misSesiones, setMisSesiones] = useState<string[]>([]);
  const [minimoActividades, setMinimoActividades] = useState(4);
  const [loading, setLoading] = useState(true);
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cargar = async () => {
    try {
      const data = await tallerRequest<{ actividades: TallerActividad[]; misSesiones: string[]; minimoActividades: number }>("/api/talleres");
      setActividades(data.actividades);
      setMisSesiones(data.misSesiones);
      setMinimoActividades(data.minimoActividades);
    } catch (error) {
      setMensaje({ tipo: "error", texto: error instanceof Error ? error.message : "No se pudieron cargar los talleres." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const sesionesPorId = useMemo(() => {
    const mapa = new Map<string, { sesion: TallerSesion; actividad: TallerActividad }>();
    actividades.forEach((actividad) => actividad.sesiones.forEach((sesion) => mapa.set(sesion.id, { sesion, actividad })));
    return mapa;
  }, [actividades]);

  const miAgenda = misSesiones
    .map((id) => sesionesPorId.get(id))
    .filter((item): item is { sesion: TallerSesion; actividad: TallerActividad } => Boolean(item))
    .sort((a, b) => a.sesion.inicio.localeCompare(b.sesion.inicio));

  // Motivo por el que no se puede tomar una sesión, o null si está disponible.
  const bloqueo = (actividad: TallerActividad, sesion: TallerSesion) => {
    if (miAgenda.some((item) => item.actividad.id === actividad.id)) return "Ya tienes una sesión";
    if (sesion.inscritos >= actividad.cupo) return "Sin cupos";
    const choque = miAgenda.find((item) => seSolapan(item.sesion, sesion));
    return choque ? `Choca con ${choque.actividad.nombre}` : null;
  };

  const inscribirse = async (sesionId: string) => {
    setPendiente(sesionId);
    setMensaje(null);
    try {
      await tallerRequest("/api/talleres/inscripcion", { method: "POST", body: JSON.stringify({ sesionId }) });
      setMensaje({ tipo: "ok", texto: "¡Listo! Quedaste inscrito." });
    } catch (error) {
      setMensaje({ tipo: "error", texto: error instanceof Error ? error.message : "No se pudo completar la inscripción." });
    } finally {
      await cargar();
      setPendiente(null);
    }
  };

  const retirarse = async (sesionId: string) => {
    setPendiente(sesionId);
    setMensaje(null);
    try {
      await tallerRequest(`/api/talleres/inscripcion/${encodeURIComponent(sesionId)}`, { method: "DELETE" });
      setMensaje({ tipo: "ok", texto: "Te retiraste de la sesión." });
    } catch (error) {
      setMensaje({ tipo: "error", texto: error instanceof Error ? error.message : "No se pudo cancelar la inscripción." });
    } finally {
      await cargar();
      setPendiente(null);
    }
  };

  const cumplido = miAgenda.length >= minimoActividades;
  const faltanActividades = Math.max(0, minimoActividades - miAgenda.length);

  return (
    <section className="pf-card pf-tl">
      <div className="pf-title-row">
        <h3 className="pf-title"><CalendarClock size={18} /> Talleres del encuentro</h3>
        {!loading && <span className="pf-progress-label">{miAgenda.length} elegidas</span>}
      </div>
      <p className="pf-hint">
        Elige al menos {minimoActividades} actividades: una sesión por taller y sin que se crucen los horarios. Cada sesión abre con mínimo {actividades[0]?.minimo ?? 13} inscritos.
      </p>

      {mensaje && <p className={`pf-tl-msg ${mensaje.tipo === "ok" ? "is-ok" : "is-error"}`} role="status">{mensaje.texto}</p>}

      {loading ? (
        <p className="pf-empty">Cargando talleres...</p>
      ) : (
        <>
          {/* Progreso hacia el mínimo de actividades */}
          <div className={`pf-tl-goal${cumplido ? " is-done" : ""}`}>
            <div className="pf-tl-goal-count">
              <strong>{miAgenda.length}</strong><span>/{minimoActividades}</span>
            </div>
            <div className="pf-tl-goal-body">
              <div className="pf-tl-steps" aria-hidden="true">
                {Array.from({ length: Math.max(minimoActividades, miAgenda.length) }, (_, i) => (
                  <span key={i} className={i < miAgenda.length ? "is-on" : ""}>{i < miAgenda.length ? <Check size={12} /> : i + 1}</span>
                ))}
              </div>
              <p>
                {cumplido
                  ? "¡Cumpliste el mínimo! Puedes sumar más actividades si los horarios no chocan."
                  : `Te ${faltanActividades === 1 ? "falta 1 actividad" : `faltan ${faltanActividades} actividades`} para completar tu agenda.`}
              </p>
            </div>
          </div>

          {/* Agenda personal en orden de horario */}
          <h4 className="pf-subtitle">Mi agenda</h4>
          {miAgenda.length === 0 ? (
            <p className="pf-tl-empty">Toca <b>Elegir</b> en una sesión para empezar a armar tu agenda.</p>
          ) : (
            <ol className="pf-tl-agenda">
              {miAgenda.map(({ sesion, actividad }) => (
                <li key={sesion.id}>
                  <time>{formatRango(sesion)}</time>
                  <div>
                    <strong>{actividad.nombre}</strong>
                    <span>{actividad.encargados}</span>
                  </div>
                  <button type="button" disabled={pendiente !== null} onClick={() => retirarse(sesion.id)} aria-label={`Quitar ${actividad.nombre}`} title="Quitar de mi agenda">
                    <X size={15} />
                  </button>
                </li>
              ))}
            </ol>
          )}

          <h4 className="pf-subtitle">Actividades</h4>
          <div className="pf-tl-grid">
            {actividades.map((actividad) => {
              const elegida = actividad.sesiones.some((sesion) => misSesiones.includes(sesion.id));
              return (
                <article key={actividad.id} className={`pf-tl-card${elegida ? " is-chosen" : ""}`}>
                  {elegida && <span className="pf-tl-ribbon"><Check size={12} /> Elegida</span>}
                  <header>
                    <strong>{actividad.nombre}</strong>
                    <span>{actividad.encargados} · {actividad.duracion} · máx. {actividad.cupo}</span>
                  </header>
                  <div className="pf-tl-sesiones">
                    {actividad.sesiones.map((sesion) => {
                      const inscrito = misSesiones.includes(sesion.id);
                      const motivo = inscrito ? null : bloqueo(actividad, sesion);
                      const faltan = Math.max(0, actividad.minimo - sesion.inscritos);
                      const ocupacion = Math.min(100, Math.round((sesion.inscritos / actividad.cupo) * 100));
                      const clase = inscrito ? " is-mine" : motivo ? " is-blocked" : "";
                      return (
                        <div key={sesion.id} className={`pf-tl-sesion${clase}`}>
                          <div className="pf-tl-sesion-info">
                            <b>{formatRango(sesion)}</b>
                            <div className="pf-tl-bar" aria-hidden="true"><i style={{ width: `${ocupacion}%` }} /></div>
                            <small>
                              <Users size={12} /> {sesion.inscritos}/{actividad.cupo}
                              {faltan > 0 ? ` · faltan ${faltan} para abrir` : " · confirmada"}
                            </small>
                            {motivo && <em>{motivo}</em>}
                          </div>
                          {inscrito ? (
                            <button type="button" className="pf-tl-btn is-leave" disabled={pendiente !== null} onClick={() => retirarse(sesion.id)} title="Quitar de mi agenda">
                              <Check size={14} /> Inscrito
                            </button>
                          ) : (
                            <button type="button" className="pf-tl-btn" disabled={pendiente !== null || Boolean(motivo)} onClick={() => inscribirse(sesion.id)}>
                              {pendiente === sesion.id ? "..." : "Elegir"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
