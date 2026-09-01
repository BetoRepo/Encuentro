import { useState } from "react";
import { Siren, AlertTriangle, MapPin, X, CheckCircle2, ShieldAlert } from "lucide-react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";
const EMERGENCY_RED = "#D32F2F";

const tiposEmergencia = [
  { id: "Medica", label: "⚕️ Médica / Salud" },
  { id: "Seguridad", label: "🛡️ Seguridad / Extravío" },
  { id: "Incendio", label: "🔥 Incendio / Riesgo Físico" },
  { id: "Otra", label: "⚠️ Otra Emergencia" },
];

export function BotonAlarma() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Medica");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviarAlerta = async () => {
    setLoading(true);

    // 1. Obtener coordenadas de GPS
    let latitud: number | null = null;
    let longitud: number | null = null;

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          });
        });
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;
      } catch (error) {
        console.warn("No se pudo obtener la ubicación GPS:", error);
      }
    }

    try {
      // 2. Obtener datos del usuario y perfil guardados localmente
      const user = JSON.parse(localStorage.getItem("enj_user") || "null");
      const storedProfile = localStorage.getItem("enj_profile");
      const profile = storedProfile ? JSON.parse(storedProfile) : {};
      const nombreCompleto = profile.nombre ? `${profile.nombre} ${profile.apellido}` : user?.email || "Usuario Anónimo";
      const telefono = profile.telefono || "Sin teléfono";
      // 3. Registrar alerta en Supabase
      const { error } = await supabase.from("alertas_emergencia").insert([
        {
          user_id: user?.id || null,
          nombre_usuario: nombreCompleto,
          telefono,
          tipo_emergencia: tipoSeleccionado,
          latitud,
          longitud,
          estado: "activa",
        },
      ]);

      if (error) throw error;

      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        setModalOpen(false);
      }, 3000);
    } catch (err: any) {
      alert("Error al enviar alerta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* --- BOTÓN FLOTANTE PRINCIPAL --- */}
      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: EMERGENCY_RED,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(211, 47, 47, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          animation: "pulse-red 2s infinite",
        }}
        title="Activar Alarma de Emergencia"
      >
        <Siren size={30} />
      </button>

      {/* Animación CSS para el botón */}
      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 15px rgba(211, 47, 47, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
        }
      `}</style>

      {/* --- MODAL DE CONFIRMACIÓN DE EMERGENCIA --- */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,11,111,0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          zIndex: 10000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            padding: 28,
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            position: "relative",
            textAlign: "center"
          }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#888" }}
            >
              <X size={20} />
            </button>

            {enviado ? (
              <div style={{ padding: "20px 0" }}>
                <CheckCircle2 size={60} color="#2E7D32" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ margin: "0 0 8px", color: ENJ_NAVY, fontSize: 20, fontWeight: 900 }}>¡Alerta Enviada!</h3>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(0,11,111,0.7)" }}>
                  El equipo de Gestión de Riesgo ha recibido tus datos y coordenadas. Mantén la calma.
                </p>
              </div>
            ) : (
              <>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(211, 47, 47, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: EMERGENCY_RED }}>
                  <ShieldAlert size={36} />
                </div>

                <h3 style={{ margin: "0 0 6px", color: ENJ_NAVY, fontSize: 20, fontWeight: 900 }}>
                  ¿Activar Alarma de Emergencia?
                </h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(0,11,111,0.65)" }}>
                  Se compartirá tu nombre, número telefónico y posición GPS actual con el puesto de mando.
                </p>

                {/* Seleccionar Tipo de Emergencia */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>Tipo de situación:</label>
                  {tiposEmergencia.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTipoSeleccionado(t.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: tipoSeleccionado === t.id ? `2px solid ${EMERGENCY_RED}` : "1.5px solid rgba(0,11,111,0.12)",
                        background: tipoSeleccionado === t.id ? "rgba(211, 47, 47, 0.05)" : "#FAFBFF",
                        color: tipoSeleccionado === t.id ? EMERGENCY_RED : ENJ_NAVY,
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.2)", background: "#fff", color: ENJ_NAVY, fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={enviarAlerta}
                    disabled={loading}
                    style={{ flex: 1.5, padding: "12px", borderRadius: 10, border: "none", background: EMERGENCY_RED, color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <AlertTriangle size={18} /> {loading ? "Transmitiendo..." : "¡SOLICITAR AYUDA!"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}