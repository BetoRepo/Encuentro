import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Users } from "lucide-react";
import { formatRango, seSolapan, tallerRequest, type TallerActividad, type TallerSesion } from "../talleres";

// Cuadro del Perfil donde cada protagonista se inscribe en los talleres (una sesión por actividad).
export function TalleresPerfil() {
  const [actividades, setActividades] = useState<TallerActividad[]>([]);
  const [misSesiones, setMisSesiones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cargar = async () => {
    try {
      const data = await tallerRequest<{ actividades: TallerActividad[]; misSesiones: string[] }>("/api/talleres");
      setActividades(data.actividades);
      setMisSesiones(data.misSesiones);
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

  return (
    <section className="pf-card">
      <h3 className="pf-title"><CalendarClock size={18} /> Talleres del encuentro</h3>
      <p className="pf-hint">
        Elige una sesión por taller, sin que se crucen los horarios. Cada sesión necesita al menos {actividades[0]?.minimo ?? 13} inscritos para abrirse.
      </p>

      {mensaje && <p className={`pf-tl-msg ${mensaje.tipo === "ok" ? "is-ok" : "is-error"}`} role="status">{mensaje.texto}</p>}

      {loading ? (
        <p className="pf-empty">Cargando talleres...</p>
      ) : (
        <>
          <h4 className="pf-subtitle">Mi agenda</h4>
          {miAgenda.length === 0 ? (
            <p className="pf-empty" style={{ marginTop: 0 }}>Todavía no te has inscrito en ningún taller.</p>
          ) : (
            <div className="pf-tl-agenda">
              {miAgenda.map(({ sesion, actividad }) => (
                <span key={sesion.id}><strong>{formatRango(sesion)}</strong> {actividad.nombre}</span>
              ))}
            </div>
          )}

          <div className="pf-tl-grid">
            {actividades.map((actividad) => (
              <article key={actividad.id} className="pf-tl-card">
                <header>
                  <strong>{actividad.nombre}</strong>
                  <span>{actividad.encargados} · {actividad.duracion} · máx. {actividad.cupo}</span>
                </header>
                <div className="pf-tl-sesiones">
                  {actividad.sesiones.map((sesion) => {
                    const inscrito = misSesiones.includes(sesion.id);
                    const motivo = inscrito ? null : bloqueo(actividad, sesion);
                    const faltan = Math.max(0, actividad.minimo - sesion.inscritos);
                    return (
                      <div key={sesion.id} className={`pf-tl-sesion${inscrito ? " is-mine" : ""}`}>
                        <div>
                          <b>{formatRango(sesion)}</b>
                          <small>
                            <Users size={12} /> {sesion.inscritos}/{actividad.cupo}
                            {faltan > 0 ? ` · faltan ${faltan} para abrir` : " · confirmada"}
                          </small>
                        </div>
                        {inscrito ? (
                          <button type="button" className="pf-tl-btn is-leave" disabled={pendiente !== null} onClick={() => retirarse(sesion.id)}>
                            <Check size={14} /> Inscrito · Retirarme
                          </button>
                        ) : (
                          <button type="button" className="pf-tl-btn" disabled={pendiente !== null || Boolean(motivo)} onClick={() => inscribirse(sesion.id)}>
                            {pendiente === sesion.id ? "..." : motivo || "Inscribirme"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
