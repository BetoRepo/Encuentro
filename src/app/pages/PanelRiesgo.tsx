import { useEffect, useState, useRef } from "react";
import { Siren, MapPin, BellRing, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const EMERGENCY_RED = "#D32F2F";

// Sonido de sirena de emergencia (URL directa o tu propio archivo MP3 en public/)
const SIREN_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function PanelRiesgo() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Cargar alertas existentes y pedir permisos de Notificación al montar
  useEffect(() => {
    cargarAlertasPrevias();
    
    // Instanciar el objeto de audio
    audioRef.current = new Audio(SIREN_SOUND_URL);
    audioRef.current.loop = false;

    // Verificar si las notificaciones web ya están concedidas
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificacionesActivas(true);
    }
  }, []);

  // 2. SUSCRIPCIÓN EN TIEMPO REAL A SUPABASE
  useEffect(() => {
    const channel = supabase
      .channel("canal-emergencias-en-vivo")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Escucha solo cuando se inserta una nueva alerta
          schema: "public",
          table: "alertas_emergencia",
        },
        (payload) => {
          const nuevaAlerta = payload.new;

          // A) Actualizar el estado en React de inmediato
          setAlertas((prev) => [nuevaAlerta, ...prev]);

          // B) Reproducir sonido de Alarma
          reproducirAlarma();

          // C) Lanzar Notificación del Navegador / Sistema
          dispararNotificacionWeb(nuevaAlerta);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Cargar las alertas guardadas anteriormente
  const cargarAlertasPrevias = async () => {
    const { data } = await supabase
      .from("alertas_emergencia")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAlertas(data);
  };

  // Solicitar permiso de notificaciones y desbloquear Audio en el navegador
  const activarNotificacionesYAudio = async () => {
    if (!("Notification" in window)) {
      alert("Este navegador no soporta notificaciones de escritorio.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificacionesActivas(true);
      
      // Reproducir un sonido silencioso de prueba para desbloquear Autoplay en Chrome/Safari
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        }).catch(() => {});
      }
    }
  };

  // Función para reproducir el audio de alerta
  const reproducirAlarma = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay de audio bloqueado por el navegador:", err);
      });
    }
  };

  // Función para emitir la Notificación del Sistema (funciona aunque estén en otra pestaña)
  const dispararNotificacionWeb = (alerta: any) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const title = `🚨 ALERTA DE EMERGENCIA: ${alerta.tipo_emergencia.toUpperCase()}`;
      const options = {
        body: `Usuario: ${alerta.nombre_usuario}\nTeléfono: ${alerta.telefono}`,
        icon: "/assets/logonacional.svg", // Cambia a la ruta de tu logo
        tag: alerta.id, // Evita duplicados
        requireInteraction: true, // La notificación se mantiene en pantalla hasta que se haga clic
      };

      const notification = new Notification(title, options);

      notification.onclick = () => {
        window.focus(); // Trae la pestaña al frente al hacer clic
        if (alerta.latitud && alerta.longitud) {
          window.open(`https://maps.google.com/?q=${alerta.latitud},${alerta.longitud}`, "_blank");
        }
      };
    }
  };

  // Cambiar estado de la alerta (Marcar como Atendida)
  const resolverAlerta = async (id: string) => {
    await supabase.from("alertas_emergencia").update({ estado: "resuelta" }).eq("id", id);
    setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, estado: "resuelta" } : a)));
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* HEADER DEL PANEL */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 10 }}>
            <Siren size={32} color={EMERGENCY_RED} /> Central de Gestión de Riesgo
          </h2>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>Monitoreo en tiempo real del evento</p>
        </div>

        {/* BOTÓN OBLIGATORIO PARA ACTIVAR SONIDO/NOTIFICACIONES */}
        {!notificacionesActivas && (
          <button
            onClick={activarNotificacionesYAudio}
            style={{
              background: EMERGENCY_RED,
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: 12,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(211,47,47,0.4)"
            }}
          >
            <BellRing size={18} /> Activar Notificaciones y Sonido
          </button>
        )}
      </div>

      {/* LISTA DE ALERTAS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {alertas.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", padding: 40 }}>No hay emergencias registradas.</p>
        ) : (
          alertas.map((alerta) => (
            <div
              key={alerta.id}
              style={{
                background: alerta.estado === "activa" ? "#FFF5F5" : "#F8FAFC",
                borderLeft: `6px solid ${alerta.estado === "activa" ? EMERGENCY_RED : "#2E7D32"}`,
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    background: alerta.estado === "activa" ? EMERGENCY_RED : "#2E7D32",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: "bold",
                    padding: "3px 8px",
                    borderRadius: 6,
                    textTransform: "uppercase"
                  }}>
                    {alerta.estado === "activa" ? "🚨 ACTIVA" : "✅ ATENDIDA"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: "bold", color: ENJ_NAVY }}>
                    {alerta.tipo_emergencia}
                  </span>
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {new Date(alerta.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <h4 style={{ margin: "0 0 4px", fontSize: 16, color: ENJ_NAVY }}>{alerta.nombre_usuario}</h4>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#555" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Phone size={14} /> {alerta.telefono}
                  </span>
                </div>
              </div>

              {/* ACCIONES PARA LA EMERGENCIA */}
              <div style={{ display: "flex", gap: 10 }}>
                {alerta.latitud && alerta.longitud && (
                  <a
                    href={`https://maps.google.com/?q=${alerta.latitud},${alerta.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: ENJ_NAVY,
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <MapPin size={16} /> Ver GPS
                  </a>
                )}

                {alerta.estado === "activa" && (
                  <button
                    onClick={() => resolverAlerta(alerta.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "#2E7D32",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <CheckCircle size={16} /> Resolver
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}