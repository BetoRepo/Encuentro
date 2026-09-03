import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { 
  Users, 
  WalletCards, 
  Receipt, 
  Trash2, 
  Edit, 
  X, 
  Save, 
  RefreshCw, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink,
  Compass
} from "lucide-react";
import { supabase } from "../../supabaseClient";

// --- IDENTIDAD VISUAL ENJ 2026 / ASV ---
const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";
const TASA_BCV_FALLBACK = 36.5; 

// --- TIPOS DE DATOS ---
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

type Documento = {
  id?: string;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo?: string;
  created_at?: string;
};

type DashboardParticipant = {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  region: string;
  distrito: string;
  grupo_scout: string;
  rama: string;
  tipo_participante: string;
  pagos: Pago[];
  documentos: Documento[];
};

// --- ESTILOS REUTILIZABLES ---
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(0,11,111,0.2)",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#0D0D2B",
  boxSizing: "border-box",
};

export function Dashboard() {
  const [data, setData] = useState<{ bcvRate: number; participants: DashboardParticipant[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Estado para modal de edición de expediente
  const [editingParticipant, setEditingParticipant] = useState<DashboardParticipant | null>(null);
  const [savingParticipant, setSavingParticipant] = useState(false);

  // --- CONSULTA TASA BCV ---
  const fetchBcvRate = async (): Promise<number> => {
    try {
      const response = await fetch("https://pydolarve.org/api/v1/dollar?page=bcv", {
        signal: AbortSignal.timeout(3000)
      });
      if (!response.ok) throw new Error("Error obteniendo tasa del BCV");
      const result = await response.json();
      return Number(result?.monitors?.usd?.price) || TASA_BCV_FALLBACK;
    } catch {
      console.warn("⚜️ Tasa BCV no disponible. Usando valor de resguardo.");
      return TASA_BCV_FALLBACK;
    }
  };

  // --- CARGA DIRECTA DESDE 'PARTICIPANTES' (SIN JOINS PESADOS) ---
  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const bcvRate = await fetchBcvRate();

      // 1. Apuntar directamente a la tabla maestra 'participantes'
      const { data: rawParticipants, error: partError } = await supabase
        .from("participantes")
        .select("*");

      if (partError) throw partError;

      // 2. Consulta paralela de tablas hijas para evitar 'statement timeout'
      const [pagosRes, docsRes] = await Promise.all([
        supabase.from("pagos").select("*"),
        supabase.from("documentos_participante").select("*")
      ]);

      if (pagosRes.error) throw pagosRes.error;
      if (docsRes.error) throw docsRes.error;

      const todosLosPagos: Pago[] = pagosRes.data || [];
      const todosLosDocumentos: Documento[] = docsRes.data || [];

      // 3. Enlazado de relaciones por Cédula o ID en memoria
      const participants: DashboardParticipant[] = (rawParticipants || []).map((p: any) => {
        const idUsuario = p.id || p.id_usuario;
        const cedulaUsuario = p.cedula;

        const pagosRelacionados = todosLosPagos.filter((pago: any) => 
          (pago.cedula_participante && pago.cedula_participante === cedulaUsuario) ||
          (pago.participante_id && pago.participante_id === idUsuario)
        );

        const docsRelacionados = todosLosDocumentos.filter((doc: any) => 
          (doc.cedula_participante && doc.cedula_participante === cedulaUsuario) ||
          (doc.participante_id && doc.participante_id === idUsuario)
        );

        return {
          id: idUsuario || cedulaUsuario || crypto.randomUUID(),
          cedula: p.cedula || "Sin Cédula",
          nombre: p.nombre || "Sin Nombre",
          apellido: p.apellido || "",
          correo: p.correo || "",
          telefono: p.telefono || "",
          region: p.region || p.selected_region || "",
          distrito: p.distrito || p.selected_district || "",
          grupo_scout: p.grupo_scout || "",
          rama: p.rama || p.rama_scout || "",
          tipo_participante: p.tipo_participante || p.rol_evento || "Joven Participante",
          pagos: pagosRelacionados,
          documentos: docsRelacionados
        };
      });

      setData({ bcvRate, participants });
    } catch (err: any) {
      setError(err.message || "Error al cargar la lista de participantes del ENJ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // --- ELIMINAR REGISTRO DE PAGO DUPLICADO ---
  const handleEliminarPago = async (pagoId?: string) => {
    if (!pagoId) return alert("ID de pago no válido.");
    if (!confirm("¿Eliminar este registro de pago duplicado?")) return;

    setDeletingId(pagoId);
    try {
      const { error } = await supabase.from("pagos").delete().eq("id", pagoId);
      if (error) throw error;
      await loadDashboardData();
    } catch (err: any) {
      alert("Error al eliminar el pago: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // --- ACTUALIZACIÓN DIRECTA EN LA TABLA 'PARTICIPANTES' ---
  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    setSavingParticipant(true);
    try {
      const { error } = await supabase
        .from("participantes")
        .update({
          nombre: editingParticipant.nombre,
          apellido: editingParticipant.apellido,
          correo: editingParticipant.correo,
          telefono: editingParticipant.telefono,
          region: editingParticipant.region,
          distrito: editingParticipant.distrito,
          grupo_scout: editingParticipant.grupo_scout,
          rama: editingParticipant.rama,
          tipo_participante: editingParticipant.tipo_participante,
        })
        .eq("cedula", editingParticipant.cedula);

      if (error) throw error;

      alert("⚜️ Expediente del participante actualizado con éxito.");
      setEditingParticipant(null);
      await loadDashboardData();
    } catch (err: any) {
      alert("Error al actualizar la información: " + err.message);
    } finally {
      setSavingParticipant(false);
    }
  };

  // Guard de Autenticación
  const currentUser = JSON.parse(localStorage.getItem("enj_user") || "null");
  if (currentUser?.role !== "admin") return <Navigate to="/" replace />;

  if (loading) {
    return (
      <main style={{ padding: 48, color: ENJ_NAVY, textAlign: "center", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 600 }}>
          <RefreshCw className="animate-spin" size={22} /> Sincronizando expedientes Scouts ENJ 2026...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 48, color: ENJ_MAGENTA, textAlign: "center", minHeight: "70vh" }}>
        <h2>Error de conexión con la base de datos</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} style={{ background: ENJ_NAVY, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", marginTop: 12 }}>
          Reintentar Carga
        </button>
      </main>
    );
  }

  if (!data) return null;

  // Cálculo de Métricas Financieras
  const totalBsGlobal = data.participants.reduce((acc, part) => {
    return acc + part.pagos.reduce((pAcc, p) => pAcc + (Number(p.monto_bs) || 0), 0);
  }, 0);
  const totalUsdOficialBcv = totalBsGlobal / (data.bcvRate || 1);

  const cards = [
    { label: "Participantes Registrados", value: data.participants.length.toLocaleString("es-VE"), icon: <Users size={24} />, color: ENJ_NAVY },
    { label: "Transacciones Validadas", value: data.participants.reduce((acc, p) => acc + p.pagos.length, 0).toLocaleString("es-VE"), icon: <Receipt size={24} />, color: ENJ_MAGENTA },
    { label: "Fondo Recaudado (Tasa BCV)", value: `${totalBsGlobal.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs / ${totalUsdOficialBcv.toLocaleString("es-VE", { minimumFractionDigits: 2 })} USD`, icon: <WalletCards size={24} />, color: "#157347" },
  ];

  return (
    <main style={{ background: "#F0F2FA", minHeight: "70vh", padding: "48px 24px 80px", position: "relative" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        
        {/* ENCABEZADO SCOUT */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ margin: 0, color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 6 }}>
              <Compass size={14} /> Asociación de Scouts de Venezuela • ENJ 2026
            </p>
            <h1 style={{ margin: "10px 0 8px", color: ENJ_NAVY, fontSize: 34 }}>Panel de Control de Participantes</h1>
            <p style={{ margin: "0 0 30px", color: "rgba(0,11,111,0.62)" }}>Tasa BCV Oficial: <strong>{data.bcvRate.toFixed(2)} Bs/USD</strong></p>
          </div>
          <button 
            onClick={loadDashboardData} 
            style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.1)", color: ENJ_NAVY, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 30 }}
          >
            <RefreshCw size={14} /> Refrescar Datos
          </button>
        </div>
        
        {/* TARJETAS DE MÉTRICAS */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
          {cards.map((card) => (
            <article key={card.label} style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 4px 24px rgba(0,11,111,0.08)" }}>
              <div style={{ color: card.color, marginBottom: 18 }}>{card.icon}</div>
              <strong style={{ display: "block", color: ENJ_NAVY, fontSize: 26 }}>{card.value}</strong>
              <span style={{ color: "rgba(0,11,111,0.58)", fontSize: 14 }}>{card.label}</span>
            </article>
          ))}
        </section>

        {/* LISTADO DE PARTICIPANTES DESDE 'PARTICIPANTES' */}
        <section style={{ marginTop: 30, display: "grid", gap: 18 }}>
          {data.participants.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 14, padding: 24, textAlign: "center", color: ENJ_NAVY }}>No se encontraron participantes registrados.</div>
          ) : (
            data.participants.map((participant) => {
              const esAdulto = participant.tipo_participante?.toLowerCase().includes("adulto") || 
                               participant.rama?.toLowerCase().includes("adulto") || 
                               participant.rama?.toLowerCase().includes("dirigente");
              const costoTotalUSD = esAdulto ? 100 : 145;

              const totalPagadoUsdReal = participant.pagos.reduce((acc, p) => {
                const tasaAplicada = p.tasa_cambio && p.tasa_cambio > 0 ? p.tasa_cambio : 1;
                const usdCalculado = p.monto_usd && p.monto_usd > 0 ? p.monto_usd : (p.monto_bs / tasaAplicada);
                return acc + usdCalculado;
              }, 0);

              const deudaUSD = Math.max(0, costoTotalUSD - totalPagadoUsdReal);
              const deudaEstimadaBs = deudaUSD * data.bcvRate;

              return (
                <article key={participant.id} style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 4px 24px rgba(0,11,111,0.08)" }}>
                  
                  {/* DETALLES DEL PARTICIPANTE */}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <h2 style={{ margin: 0, color: ENJ_NAVY, fontSize: 22 }}>{participant.nombre} {participant.apellido}</h2>
                        <span style={{ background: esAdulto ? "#E8F5E9" : "#E3F2FD", color: esAdulto ? "#2E7D32" : "#1565C0", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>
                          {esAdulto ? "Adulto de Soporte ($100)" : "Joven Participante ($145)"}
                        </span>
                        
                        <button
                          onClick={() => setEditingParticipant({ ...participant })}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,11,111,0.05)", border: "none", color: ENJ_NAVY, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          <Edit size={14} /> Editar Expediente
                        </button>
                      </div>
                      <p style={{ margin: "6px 0 0", color: "rgba(0,11,111,0.6)", fontSize: 14 }}>
                        C.I.: <strong>{participant.cedula}</strong> • Región: {participant.region || "S/R"} • Distrito: {participant.distrito || "S/D"}
                      </p>
                    </div>

                    <div style={{ textAlign: "right", background: "#FAFBFF", padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(0,11,111,0.05)" }}>
                      <div style={{ color: ENJ_NAVY, fontWeight: 800, fontSize: 14 }}>
                        Abonado: <span style={{ color: "#157347" }}>{totalPagadoUsdReal.toLocaleString("es-VE", { minimumFractionDigits: 2 })} USD</span>
                      </div>
                      <div style={{ color: deudaUSD === 0 ? "#157347" : ENJ_MAGENTA, fontWeight: 800, fontSize: 15, marginTop: 4 }}>
                        {deudaUSD === 0 ? "✓ Solvente Total" : `Pendiente: ${deudaUSD.toFixed(2)} USD (~${deudaEstimadaBs.toLocaleString("es-VE", { minimumFractionDigits: 0 })} Bs)`}
                      </div>
                    </div>
                  </div>

                  {/* BLOQUES DE INFORMACIÓN DE REGISTRO */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    
                    {/* CONTACTO */}
                    <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 14 }}>
                      <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8, fontSize: 13 }}>Contacto</strong>
                      <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <Mail size={14} color={ENJ_MAGENTA} /> {participant.correo || "No registrado"}
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={14} color={ENJ_MAGENTA} /> {participant.telefono || "No registrado"}
                      </div>
                    </div>

                    {/* ESTRUCTURA SCOUT */}
                    <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 14 }}>
                      <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8, fontSize: 13 }}>Estructura Scout</strong>
                      <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)", marginBottom: 4 }}>Grupo: <strong>{participant.grupo_scout || "S/G"}</strong></div>
                      <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>Rama/Función: <strong>{participant.rama || "S/R"}</strong></div>
                    </div>

                    {/* EXPEDIENTE DIGITAL Y DESCARGA DE DOCUMENTOS */}
                    <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 14 }}>
                      <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8, fontSize: 13 }}>Documentación / Permisos</strong>
                      {participant.documentos.length > 0 ? (
                        participant.documentos.map((doc, idx) => (
                          <div key={doc.id || idx} style={{ fontSize: 12, marginBottom: 6 }}>
                            <a 
                              href={doc.url_archivo} 
                              download
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ color: ENJ_MAGENTA, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              <FileText size={13} /> {doc.tipo_documento || doc.nombre_archivo} <ExternalLink size={11} />
                            </a>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: 12, color: "rgba(0,11,111,0.5)" }}>Sin documentos cargados</span>
                      )}
                    </div>

                    {/* CUOTAS Y GESTIÓN DE REGISTROS */}
                    <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 14 }}>
                      <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8, fontSize: 13 }}>Cuotas Depositadas</strong>
                      {participant.pagos.length ? participant.pagos.map((payment, index) => {
                        const tasaAplicada = payment.tasa_cambio || 1;
                        const usdCalculado = payment.monto_usd || (payment.monto_bs / tasaAplicada);

                        return (
                          <div key={payment.id || index} style={{ fontSize: 12, color: "rgba(0,11,111,0.7)", marginBottom: 8, paddingBottom: 6, borderBottom: "1px dashed rgba(0,11,111,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong>{payment.numero_cuota}:</strong> {Number(payment.monto_bs).toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs 
                              <br />
                              <span style={{ color: "#157347", fontWeight: 600 }}>(${usdCalculado.toFixed(2)} USD)</span>
                              <span style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}> • Ref: {payment.referencia || "N/A"}</span>
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
                      }) : <div style={{ fontSize: 12, color: "rgba(0,11,111,0.5)" }}>Sin cuotas abonadas</div>}
                    </div>

                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* --- MODAL PARA EDITAR INFORMACIÓN DE PARTICIPANTES --- */}
      {editingParticipant && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,11,111,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24, boxSizing: "border-box" }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,11,111,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
              <h3 style={{ margin: 0, color: ENJ_NAVY, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <Edit size={20} /> Editar Datos del Participante
              </h3>
              <button onClick={() => setEditingParticipant(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.5)" }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveParticipant} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Nombre</label>
                  <input required value={editingParticipant.nombre} onChange={e => setEditingParticipant({...editingParticipant, nombre: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Apellido</label>
                  <input required value={editingParticipant.apellido} onChange={e => setEditingParticipant({...editingParticipant, apellido: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Correo Electrónico</label>
                  <input type="email" value={editingParticipant.correo} onChange={e => setEditingParticipant({...editingParticipant, correo: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Teléfono Contacto</label>
                  <input value={editingParticipant.telefono} onChange={e => setEditingParticipant({...editingParticipant, telefono: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Rol en el ENJ</label>
                  <select value={editingParticipant.tipo_participante} onChange={e => setEditingParticipant({...editingParticipant, tipo_participante: e.target.value})} style={inputStyle}>
                    <option value="Joven Participante">Joven Participante</option>
                    <option value="Adulto de Soporte / Dirigente">Adulto de Soporte / Dirigente</option>
                    <option value="Equipo de Servicio / Staff">Equipo de Servicio / Staff</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Rama Scout</label>
                  <select value={editingParticipant.rama} onChange={e => setEditingParticipant({...editingParticipant, rama: e.target.value})} style={inputStyle}>
                    <option value="Comunidad (Caminante)">Comunidad (Caminante)</option>
                    <option value="Clan (Rover)">Clan (Rover)</option>
                    <option value="Dirigencia / Adulto de Soporte">Dirigencia / Adulto de Soporte</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Región</label>
                  <input value={editingParticipant.region} onChange={e => setEditingParticipant({...editingParticipant, region: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Distrito</label>
                  <input value={editingParticipant.distrito} onChange={e => setEditingParticipant({...editingParticipant, distrito: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4, display: "block" }}>Nombre del Grupo Scout</label>
                <input value={editingParticipant.grupo_scout} onChange={e => setEditingParticipant({...editingParticipant, grupo_scout: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <button type="button" onClick={() => setEditingParticipant(null)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#F4F5FA", color: ENJ_NAVY, fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingParticipant} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", background: ENJ_MAGENTA, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  <Save size={16} /> {savingParticipant ? "Guardando..." : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}