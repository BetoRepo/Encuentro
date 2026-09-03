import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Users, WalletCards, Receipt, Trash2, Edit, X, Save, RefreshCw } from "lucide-react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

// Tasa BCV por defecto por si falla el API externo
const TASA_BCV_FALLBACK = 36.5; 

// --- TIPOS ---
type Pago = {
  id?: string;
  numero_cuota: string;
  monto_bs: number;
  monto_usd?: number;
  tasa_cambio?: number;
  referencia: string;
  fecha_pago: string | null;
  estado: string;
};

type DashboardParticipant = {
  id: string; // UUID del usuario en Supabase (auth.users / profiles)
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  region: string;
  distrito: string;
  grupo_scout: string;
  rama: string;
  tipo_participante: string; // Puede ser el rol_evento
  pagos: Pago[];
  documentos: Array<{ tipo_documento: string; nombre_archivo: string; url_archivo?: string }>;
};

// --- COMPONENTE PRINCIPAL ---
export function Dashboard() {
  const [data, setData] = useState<{ bcvRate: number; participants: DashboardParticipant[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Estado para la gestión de edición de perfil
  const [editingProfile, setEditingProfile] = useState<DashboardParticipant | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // --- OBTENCIÓN DE TASA BCV ---
  const fetchBcvRate = async (): Promise<number> => {
    try {
      const response = await fetch("https://pydolarve.org/api/v1/dollar?page=bcv", {
        signal: AbortSignal.timeout(3000) // Timeout de 3 segundos para no bloquear el dashboard
      });
      if (!response.ok) throw new Error("Error obteniendo tasa del BCV");
      const result = await response.json();
      return Number(result?.monitors?.usd?.price) || TASA_BCV_FALLBACK;
    } catch {
      console.warn("No se pudo obtener la tasa en tiempo real. Usando tasa de resguardo.");
      return TASA_BCV_FALLBACK;
    }
  };

  // --- CARGA DIRECTA DESDE SUPABASE ---
  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Obtención de tasa oficial sin bloquear la app
      const bcvRate = await fetchBcvRate();

      // 2. Consulta directa e integrada a Supabase (Evita Timeout en Vercel)
      const { data: profiles, error: dbError } = await supabase
        .from("profiles")
        .select(`
          *,
          pagos (*),
          documentos (*)
        `);

      if (dbError) throw dbError;

      // 3. Mapeo estructurado para el estado del frontend
      const participants: DashboardParticipant[] = (profiles || []).map((p: any) => ({
        id: p.id,
        cedula: p.cedula || "Sin Cédula",
        nombre: p.nombre || "Sin Nombre",
        apellido: p.apellido || "",
        correo: p.correo || "",
        telefono: p.telefono || "",
        region: p.selected_region || p.region || "",
        distrito: p.selected_district || p.distrito || "",
        grupo_scout: p.grupo_scout || "",
        rama: p.rama_scout || p.rama || "",
        tipo_participante: p.rol_evento || p.tipo_participante || "Joven Participante",
        pagos: p.pagos || [],
        documentos: p.documentos || []
      }));

      setData({
        bcvRate,
        participants,
      });
    } catch (err: any) {
      setError(err.message || "Error al cargar la información del Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // --- ELIMINAR PAGO DUPLICADO ---
  const handleEliminarPago = async (pagoId?: string) => {
    if (!pagoId) return alert("El registro de pago no tiene un ID válido.");
    if (!confirm("¿Estás seguro de eliminar este pago duplicado? Esta acción no se puede deshacer.")) return;

    setDeletingId(pagoId);
    try {
      const { error } = await supabase.from("pagos").delete().eq("id", pagoId);
      if (error) throw error;
      alert("Pago eliminado exitosamente.");
      await loadDashboardData();
    } catch (err: any) {
      alert("Error al eliminar el pago: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // --- GUARDAR CAMBIOS DEL PERFIL ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nombre: editingProfile.nombre,
          apellido: editingProfile.apellido,
          telefono: editingProfile.telefono,
          selected_region: editingProfile.region,
          selected_district: editingProfile.distrito,
          grupo_scout: editingProfile.grupo_scout,
          rama_scout: editingProfile.rama,
          rol_evento: editingProfile.tipo_participante,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProfile.id);

      if (error) throw error;

      alert("Perfil actualizado correctamente.");
      setEditingProfile(null);
      await loadDashboardData();
    } catch (err: any) {
      alert("Error al actualizar el perfil: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("enj_user") || "null");
  if (currentUser?.role !== "admin") return <Navigate to="/" replace />;

  if (loading) {
    return (
      <main style={{ padding: 48, color: ENJ_NAVY, textAlign: "center", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 600 }}>
          <RefreshCw className="animate-spin" size={22} /> Cargando Dashboard del ENJ 2026...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 48, color: ENJ_MAGENTA, textAlign: "center", minHeight: "70vh" }}>
        <h2>Error al conectar con el servidor</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} style={{ background: ENJ_NAVY, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", marginTop: 12 }}>
          Reintentar conexión
        </button>
      </main>
    );
  }

  if (!data) return null;

  // Cálculo global con Tasa BCV
  const totalBsGlobal = data.participants.reduce((acc, part) => {
    return acc + part.pagos.reduce((pAcc, p) => pAcc + (Number(p.monto_bs) || 0), 0);
  }, 0);
  const totalUsdOficialBcv = totalBsGlobal / (data.bcvRate || 1);

  const cards = [
    { label: "Personas inscritas", value: data.participants.length.toLocaleString("es-VE"), icon: <Users size={24} />, color: ENJ_NAVY },
    { label: "Pagos registrados", value: data.participants.reduce((acc, p) => acc + p.pagos.length, 0).toLocaleString("es-VE"), icon: <Receipt size={24} />, color: ENJ_MAGENTA },
    { label: "Total Recaudado (Convertido a BCV)", value: `${totalBsGlobal.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs / ${totalUsdOficialBcv.toLocaleString("es-VE", { minimumFractionDigits: 2 })} USD`, icon: <WalletCards size={24} />, color: "#157347" },
  ];

  return (
    <main style={{ background: "#F0F2FA", minHeight: "70vh", padding: "48px 24px 80px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ margin: 0, color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>Administración ENJ 2026</p>
            <h1 style={{ margin: "10px 0 8px", color: ENJ_NAVY, fontSize: 34 }}>Dashboard de Inscripción y Perfiles</h1>
            <p style={{ margin: "0 0 30px", color: "rgba(0,11,111,0.62)" }}>Tasa BCV Oficial: <strong>{data.bcvRate.toFixed(2)} Bs/USD</strong></p>
          </div>
          <button 
            onClick={loadDashboardData} 
            style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.1)", color: ENJ_NAVY, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 30 }}
          >
            <RefreshCw size={14} /> Actualizar Datos
          </button>
        </div>
        
        {/* TARJETAS DE MÉTRICAS */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {cards.map((card) => (
            <article key={card.label} style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 4px 24px rgba(0,11,111,0.08)" }}>
              <div style={{ color: card.color, marginBottom: 18 }}>{card.icon}</div>
              <strong style={{ display: "block", color: ENJ_NAVY, fontSize: 26 }}>{card.value}</strong>
              <span style={{ color: "rgba(0,11,111,0.58)", fontSize: 14 }}>{card.label}</span>
            </article>
          ))}
        </section>

        {/* LISTA DE PARTICIPANTES */}
        <section style={{ marginTop: 30, display: "grid", gap: 18 }}>
          {data.participants.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 14, padding: 24 }}>No hay participantes registrados aún.</div>
          ) : (
            data.participants.map((participant) => {
              const esAdulto = participant.tipo_participante?.toLowerCase().includes("adulto") || 
                               participant.rama?.toLowerCase().includes("adulto") || 
                               participant.rama?.toLowerCase().includes("dirigente");
              const costoTotalUSD = esAdulto ? 100 : 145;

              const totalPagadoUsdReal = participant.pagos.reduce((acc, p) => {
                const tasaIndividual = p.tasa_cambio && p.tasa_cambio > 0 ? p.tasa_cambio : 1;
                const usdCalculado = p.monto_usd && p.monto_usd > 0 ? p.monto_usd : (p.monto_bs / tasaIndividual);
                return acc + usdCalculado;
              }, 0);

              const deudaUSD = Math.max(0, costoTotalUSD - totalPagadoUsdReal);
              const deudaEstimadaBs = deudaUSD * data.bcvRate;

              return (
                <article key={participant.id} style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 4px 24px rgba(0,11,111,0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <h2 style={{ margin: 0, color: ENJ_NAVY, fontSize: 22 }}>{participant.nombre} {participant.apellido}</h2>
                        <span style={{ background: esAdulto ? "#E8F5E9" : "#E3F2FD", color: esAdulto ? "#2E7D32" : "#1565C0", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>
                          {esAdulto ? "Adulto de Soporte ($100)" : "Joven ($145)"}
                        </span>
                        
                        <button
                          onClick={() => setEditingProfile({ ...participant })}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,11,111,0.05)", border: "none", color: ENJ_NAVY, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          <Edit size={14} /> Gestionar Perfil
                        </button>
                      </div>
                      <p style={{ margin: "6px 0 0", color: "rgba(0,11,111,0.6)", fontSize: 14 }}>
                        CI: {participant.cedula} • {participant.region || "Sin región"} / {participant.distrito || "Sin distrito"}
                      </p>
                    </div>

                    <div style={{ textAlign: "right", background: "#FAFBFF", padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(0,11,111,0.05)" }}>
                      <div style={{ color: ENJ_NAVY, fontWeight: 800, fontSize: 14 }}>
                        Abonado: <span style={{ color: "#157347" }}>{totalPagadoUsdReal.toLocaleString("es-VE", { minimumFractionDigits: 2 })} USD</span>
                      </div>
                      <div style={{ color: deudaUSD === 0 ? "#157347" : ENJ_MAGENTA, fontWeight: 800, fontSize: 15, marginTop: 4 }}>
                        {deudaUSD === 0 ? "✓ Solvente Total" : `Debe: ${deudaUSD.toFixed(2)} USD (~${deudaEstimadaBs.toLocaleString("es-VE", { minimumFractionDigits: 0 })} Bs)`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
                    <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 12 }}>
                      <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8 }}>Estructura Scout</strong>
                      <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>Grupo: {participant.grupo_scout || "S/G"}</div>
                      <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>Rama/Rol: {participant.rama || "S/R"}</div>
                    </div>

                    <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 12 }}>
                      <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8 }}>Historial de Pagos</strong>
                      {participant.pagos.length ? participant.pagos.map((payment, index) => {
                        const tasaAplicada = payment.tasa_cambio || 1;
                        const usdCalculado = payment.monto_usd || (payment.monto_bs / tasaAplicada);

                        return (
                          <div key={payment.id || index} style={{ fontSize: 12, color: "rgba(0,11,111,0.7)", marginBottom: 8, paddingBottom: 6, borderBottom: "1px dashed rgba(0,11,111,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong>{payment.numero_cuota}:</strong> {Number(payment.monto_bs).toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs 
                              <br />
                              <span style={{ color: "#157347", fontWeight: 600 }}>(${usdCalculado.toFixed(2)} USD)</span> • Tasa: <em>{tasaAplicada.toFixed(2)}</em>
                            </div>
                            {payment.id && (
                              <button
                                onClick={() => handleEliminarPago(payment.id)}
                                disabled={deletingId === payment.id}
                                title="Eliminar pago duplicado"
                                style={{ background: "#FFEEEF", border: "none", color: ENJ_MAGENTA, padding: 6, borderRadius: 6, cursor: "pointer" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        );
                      }) : <div style={{ fontSize: 12, color: "rgba(0,11,111,0.7)" }}>Sin pagos registrados</div>}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* --- MODAL PARA EDITAR PERFIL --- */}
      {editingProfile && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,11,111,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24, boxSizing: "border-box" }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,11,111,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
              <h3 style={{ margin: 0, color: ENJ_NAVY, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <Edit size={20} /> Gestionar Perfil: {editingProfile.nombre}
              </h3>
              <button onClick={() => setEditingProfile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.5)" }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Nombre</label>
                  <input required value={editingProfile.nombre} onChange={e => setEditingProfile({...editingProfile, nombre: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Apellido</label>
                  <input required value={editingProfile.apellido} onChange={e => setEditingProfile({...editingProfile, apellido: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Teléfono</label>
                  <input value={editingProfile.telefono} onChange={e => setEditingProfile({...editingProfile, telefono: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Rol en el Evento</label>
                  <select value={editingProfile.tipo_participante} onChange={e => setEditingProfile({...editingProfile, tipo_participante: e.target.value})} style={inputStyle}>
                    <option value="Joven Participante">Joven Participante</option>
                    <option value="Adulto de Soporte / Dirigente">Adulto de Soporte / Dirigente</option>
                    <option value="Equipo de Servicio / Staff">Equipo de Servicio / Staff</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Región</label>
                  <input value={editingProfile.region} onChange={e => setEditingProfile({...editingProfile, region: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Distrito</label>
                  <input value={editingProfile.distrito} onChange={e => setEditingProfile({...editingProfile, distrito: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Grupo Scout</label>
                  <input value={editingProfile.grupo_scout} onChange={e => setEditingProfile({...editingProfile, grupo_scout: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Rama</label>
                  <select value={editingProfile.rama} onChange={e => setEditingProfile({...editingProfile, rama: e.target.value})} style={inputStyle}>
                    <option value="Comunidad (Caminante)">Comunidad (Caminante)</option>
                    <option value="Clan (Rover)">Clan (Rover)</option>
                    <option value="Dirigencia / Adulto de Soporte">Dirigencia / Adulto de Soporte</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <button type="button" onClick={() => setEditingProfile(null)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#F4F5FA", color: ENJ_NAVY, fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingProfile} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", background: ENJ_MAGENTA, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  <Save size={16} /> {savingProfile ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(0,11,111,0.2)",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#0D0D2B",
  boxSizing: "border-box" as const,
};