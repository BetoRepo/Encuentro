import { useState, useEffect, useCallback } from "react";
import {
  Users, CreditCard, Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, X, AlertCircle, Building, Clock,
  ShieldCheck, Edit3, Save,
  UserCheck, FileText, DollarSign, User
} from "lucide-react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

// ================= INTERFACES BASADAS EN ESQUEMA SQL REAL =================
export interface Participante {
  cedula: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string;
  talla_uniforme?: string;
  direccion?: string;
  correo?: string;
  telefono?: string;
  tipo_sangre?: string;
  alergias?: string;
  enfermedades?: string;
  medicamentos?: string;
  contacto_emergencia?: string;
  region?: string;
  distrito?: string;
  grupo_scout?: string;
  rama?: string;
  tipo_participante?: string;
  id_usuario?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  grupo_scout?: string;
  distrito?: string;
  rol?: string;
  birth_date?: string;
  selected_region?: string;
  selected_district?: string;
  rama_scout?: string;
  descripcion?: string;
  instagram?: string;
  gustos_evento?: any;
  foto?: string;
  rol_evento?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pago {
  id: string;
  cedula_participante: string;
  numero_cuota?: string;
  monto_bs: number;
  referencia?: string;
  fecha_pago?: string;
  tasa_cambio: number;
  estado: "pendiente" | "validado" | "rechazado";
  created_at?: string;
  participante?: Participante | null;
}

export interface Documento {
  id?: string;
  cedula_participante: string;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo?: string;
  archivo_base64?: string;
  created_at?: string;
}

export function Dashboard() {
  // ESTADOS DE PARTICIPANTES
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  // FILTROS DE BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState<string>("");

  // MÉTRICAS Y FINANZAS
  const [totalJovenes, setTotalJovenes] = useState<number>(0);
  const [totalAdultos, setTotalAdultos] = useState<number>(0);
  const [totalUsdValidado, setTotalUsdValidado] = useState<number>(0);
  const [totalPendientesValidacion, setTotalPendientesValidacion] = useState<number>(0);
  const [tasaBcvActual] = useState<number>(36.5);

  // MODAL EXPEDIENTE & EDICIÓN DE PERFIL
  const [selectedParticipante, setSelectedParticipante] = useState<Participante | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalPagos, setModalPagos] = useState<Pago[]>([]);
  const [modalDocs, setModalDocs] = useState<Documento[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditingPerfil, setIsEditingPerfil] = useState<boolean>(false);

  // ESTADOS FORMULARIO EDICIÓN DUAL (`participantes` y `profiles`)
  const [editPartData, setEditPartData] = useState<Partial<Participante>>({});
  const [editProfileData, setEditProfileData] = useState<Partial<Profile>>({});

  // 1. CARGAR PARTICIPANTES DIRECTAMENTE DE LA TABLA `participantes`
  const loadParticipantes = useCallback(async () => {
    setLoadingParticipantes(true);
    setErrorMsg(null);
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from("participantes").select("*", { count: "exact" });

      if (searchTerm.trim() !== "") {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(`cedula.ilike.${term},nombre.ilike.${term},apellido.ilike.${term},correo.ilike.${term}`);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setParticipantes(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("🔥 Error en loadParticipantes:", err);
      setErrorMsg(err.message || "Error al cargar la lista de participantes.");
    } finally {
      setLoadingParticipantes(false);
    }
  }, [page, searchTerm]);

  // 2. CARGAR MÉTRICAS Y ESTADÍSTICAS FINANCIERAS
  const loadMetricsAndFinances = async () => {
    try {
      const { data: partData } = await supabase.from("participantes").select("tipo_participante");
      if (partData) {
        let jov = 0, adu = 0;
        partData.forEach((p) => {
          const tipo = (p.tipo_participante || "").toLowerCase();
          if (tipo.includes("adulto") || tipo.includes("staff")) adu++;
          else jov++;
        });
        setTotalJovenes(jov);
        setTotalAdultos(adu);
      }

      const { data: pagosData } = await supabase.from("pagos").select("monto_bs, tasa_cambio, estado");
      if (pagosData) {
        let bsVal = 0, usdVal = 0, pendientesCount = 0;
        pagosData.forEach((pago) => {
          const bs = Number(pago.monto_bs) || 0;
          const tasa = Number(pago.tasa_cambio) || 1;
          const usd = tasa > 0 ? bs / tasa : 0;

          if (pago.estado === "validado") {
            bsVal += bs;
            usdVal += usd;
          } else if (pago.estado === "pendiente") {
            pendientesCount++;
          }
        });
        setTotalUsdValidado(usdVal);
        setTotalPendientesValidacion(pendientesCount);
      }
    } catch (e: any) {
      console.warn("Error cargando métricas:", e.message);
    }
  };

  useEffect(() => {
    loadParticipantes();
  }, [loadParticipantes]);

  useEffect(() => {
    loadMetricsAndFinances();
  }, []);

  // 3. ABRIR EXPEDIENTE Y VINCULAR PERFIL (TABLA `profiles`)
  const openExpediente = async (participante: Participante) => {
    setSelectedParticipante(participante);
    setEditPartData(participante);
    setIsEditingPerfil(false);
    setLoadingModal(true);
    setModalPagos([]);
    setModalDocs([]);
    setSelectedProfile(null);
    setEditProfileData({});

    try {
      const cleanCedula = participante.cedula.trim();

      // Cargar Perfil de la tabla `profiles` por `id_usuario` o por `correo`
      let profData: Profile | null = null;
      if (participante.id_usuario) {
        const { data: profileById } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", participante.id_usuario)
          .maybeSingle();
        profData = profileById;
      }

      if (!profData && participante.correo) {
        const { data: profileByMail } = await supabase
          .from("profiles")
          .select("*")
          .eq("correo", participante.correo)
          .maybeSingle();
        profData = profileByMail;
      }

      if (profData) {
        setSelectedProfile(profData);
        setEditProfileData(profData);
      }

      // Cargar pagos asociados a la cédula
      const { data: pagosData } = await supabase
        .from("pagos")
        .select("*")
        .eq("cedula_participante", cleanCedula)
        .order("created_at", { ascending: true });

      if (pagosData) setModalPagos(pagosData);

      // Cargar documentos adjuntos
      const { data: docsData } = await supabase
        .from("documentos_participante")
        .select("*")
        .eq("cedula_participante", cleanCedula);

      if (docsData) setModalDocs(docsData);
    } catch (err: any) {
      console.error("Error al abrir expediente:", err.message);
    } finally {
      setLoadingModal(false);
    }
  };

  // Función auxiliar para actualizar campos compartidos
  const handleDualChange = (field: string, value: any) => {
    setEditPartData((prev) => ({ ...prev, [field]: value }));
    setEditProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // 4. GUARDAR EDICIÓN DUAL EN `participantes` Y EN `profiles`
  const handleSaveExpediente = async () => {
    if (!selectedParticipante) return;
    setActionLoading("saving_all");
    try {
      // A) Actualizar tabla `participantes`
      const { error: partErr } = await supabase
        .from("participantes")
        .update(editPartData)
        .eq("cedula", selectedParticipante.cedula);

      if (partErr) throw partErr;

      // B) Actualizar tabla `profiles` (si existe perfil vinculado)
      if (selectedProfile?.id) {
        const { error: profErr } = await supabase
          .from("profiles")
          .update(editProfileData)
          .eq("id", selectedProfile.id);

        if (profErr) throw profErr;

        const updatedProfile = { ...selectedProfile, ...editProfileData } as Profile;
        setSelectedProfile(updatedProfile);
      }

      const updatedPart = { ...selectedParticipante, ...editPartData } as Participante;
      setSelectedParticipante(updatedPart);
      setParticipantes((prev) => prev.map((p) => (p.cedula === selectedParticipante.cedula ? updatedPart : p)));

      setIsEditingPerfil(false);
      alert("¡Expediente y Perfil actualizados correctamente!");
    } catch (err: any) {
      alert("Error actualizando la información: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 5. CAMBIAR ESTATUS DE PAGO EN SUPABASE
  const handleUpdateEstatusPago = async (pagoId: string, nuevoEstado: "validado" | "rechazado" | "pendiente") => {
    setActionLoading(pagoId);
    try {
      const { error } = await supabase.from("pagos").update({ estado: nuevoEstado }).eq("id", pagoId);
      if (error) throw error;

      setModalPagos((prev) => prev.map((p) => (p.id === pagoId ? { ...p, estado: nuevoEstado } : p)));
      loadMetricsAndFinances();
    } catch (err: any) {
      alert("Error al actualizar pago: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="dash-container">
      {/* ESTILOS RESPONSIVOS MÓVILES */}
      <style>{`
        .dash-container {
          background: #F0F2FA;
          min-height: 100vh;
          padding: 24px 16px 50px;
        }
        .dash-content {
          max-width: 1280px;
          margin: 0 auto;
        }
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }
        .desktop-table-container {
          display: block;
          overflow-x: auto;
        }
        .desktop-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .mobile-cards-container {
          display: none;
        }
        .modal-body-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .dash-container {
            padding: 16px 12px 40px;
          }
          .dash-header-title {
            font-size: 22px !important;
          }
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .metric-card-p {
            font-size: 20px !important;
          }
          .desktop-table-container {
            display: none;
          }
          .mobile-cards-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 12px;
          }
          .modal-overlay {
            padding: 10px !important;
          }
          .modal-window {
            padding: 18px 16px !important;
            max-height: 94vh !important;
            border-radius: 16px !important;
          }
          .modal-body-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .modal-header-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dash-content">
        {/* ENCABEZADO SCOUT ENJ 2026 */}
        <div className="dash-header">
          <div>
            <span style={{ background: ENJ_NAVY, color: ENJ_YELLOW, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 100 }}>
              ASOCIACIÓN DE SCOUTS DE VENEZUELA • ENJ 2026
            </span>
            <h1 className="dash-header-title" style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900, color: ENJ_NAVY }}>
              Panel General de Control y Gestión
            </h1>
          </div>
          <div>
            <button
              onClick={() => {
                loadParticipantes();
                loadMetricsAndFinances();
              }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(0,11,111,0.15)", borderRadius: 10, padding: "10px 18px", color: ENJ_NAVY, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              <RefreshCw size={15} /> Actualizar Datos
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: 16, borderRadius: 12, marginBottom: 20, fontWeight: "bold", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={20} /> Error de conexión: {errorMsg}
          </div>
        )}

        {/* MÉTRICAS GENERALES */}
        <div className="metrics-grid">
          <div style={{ background: "#fff", padding: 18, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Participantes</span>
              <UserCheck size={18} color={ENJ_NAVY} />
            </div>
            <p className="metric-card-p" style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>{totalCount}</p>
          </div>

          <div style={{ background: "#fff", padding: 18, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Jóvenes / Adultos</span>
              <Building size={18} color={ENJ_MAGENTA} />
            </div>
            <p className="metric-card-p" style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
              <span style={{ color: ENJ_MAGENTA }}>{totalJovenes}</span> / {totalAdultos}
            </p>
          </div>

          <div style={{ background: "#fff", padding: 18, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Pagos por Validar</span>
              <Clock size={18} color="#D97706" />
            </div>
            <p className="metric-card-p" style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 900, color: "#D97706" }}>{totalPendientesValidacion}</p>
          </div>

          <div style={{ background: "linear-gradient(135deg, #000B6F 0%, #0015B8 100%)", padding: 18, borderRadius: 16, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ENJ_YELLOW, textTransform: "uppercase" }}>Total Validado ($)</span>
              <ShieldCheck size={18} color={ENJ_YELLOW} />
            </div>
            <p className="metric-card-p" style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 900, color: "#fff" }}>${totalUsdValidado.toFixed(2)} USD</p>
          </div>
        </div>

        {/* ETIQUETA SECCIÓN ÚNICA */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ padding: "10px 20px", borderRadius: 12, background: ENJ_NAVY, color: "#fff", fontWeight: 800, fontSize: 14 }}>
            Expedientes de Participantes ({totalCount})
          </div>
        </div>

        {/* LISTA DE PARTICIPANTES */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", overflow: "hidden" }}>
          
          {/* BUSCADOR */}
          <div style={{ padding: 16, borderBottom: "1px solid rgba(0,11,111,0.08)", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#888" }} />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre, apellido o correo..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13 }}
              />
            </div>
          </div>

          {/* VISTA ESCRITORIO (TABLA ADAPTATIVA CON DESPLAZAMIENTO HORIZONTAL) */}
          <div className="desktop-table-container">
            <table className="desktop-table">
              <thead>
                <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Participante</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Cédula</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Grupo / Región</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Teléfono / Correo</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingParticipantes ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#666" }}>Cargando participantes...</td></tr>
                ) : participantes.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#666" }}>No se encontraron participantes.</td></tr>
                ) : (
                  participantes.map((p) => (
                    <tr key={p.cedula} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 14 }}>{p.nombre} {p.apellido}</div>
                        <div style={{ fontSize: 11, color: ENJ_MAGENTA, fontWeight: "bold" }}>{(p.tipo_participante || "joven").toUpperCase()}</div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>{p.cedula}</td>
                      <td style={{ padding: "14px 18px", fontSize: 13 }}>
                        <div><strong>{p.grupo_scout || "Sin Grupo"}</strong></div>
                        <div style={{ fontSize: 11, color: "#666" }}>{p.region || "Sin Región"}</div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 12, color: "#555" }}>
                        <div>{p.telefono || "N/A"}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{p.correo || "N/A"}</div>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <button
                          onClick={() => openExpediente(p)}
                          style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          Ver Expediente
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL (TARJETAS INDIVIDUALES CON BOTÓN DESTACADO) */}
          <div className="mobile-cards-container">
            {loadingParticipantes ? (
              <div style={{ padding: 20, textAlign: "center", color: "#666" }}>Cargando participantes...</div>
            ) : participantes.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#666" }}>No se encontraron participantes.</div>
            ) : (
              participantes.map((p) => (
                <div
                  key={p.cedula}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid rgba(0,11,111,0.1)",
                    padding: 14,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: ENJ_NAVY, fontSize: 15 }}>
                        {p.nombre} {p.apellido}
                      </div>
                      <div style={{ fontSize: 11, color: ENJ_MAGENTA, fontWeight: "bold", marginTop: 2 }}>
                        {(p.tipo_participante || "joven").toUpperCase()}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#F0F2FA", padding: "4px 8px", borderRadius: 6, color: ENJ_NAVY }}>
                      {p.cedula}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: "#444", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}>
                    <div><strong>Grupo:</strong> {p.grupo_scout || "Sin Grupo"} ({p.region || "Sin Región"})</div>
                    <div style={{ marginTop: 2 }}><strong>Teléfono:</strong> {p.telefono || "N/A"}</div>
                    <div style={{ marginTop: 2, wordBreak: "break-all" }}><strong>Correo:</strong> {p.correo || "N/A"}</div>
                  </div>

                  <button
                    onClick={() => openExpediente(p)}
                    style={{
                      width: "100%",
                      background: ENJ_NAVY,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <Eye size={16} /> Ver Expediente
                  </button>
                </div>
              ))
            )}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#F8FAFF", borderTop: "1px solid rgba(0,11,111,0.08)" }}>
            <span style={{ fontSize: 13, color: ENJ_NAVY, fontWeight: 600 }}>Página {page + 1} de {totalPages}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer" }}><ChevronLeft size={16} /></button>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page + 1 >= totalPages ? "not-allowed" : "pointer" }}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* ================= MODAL EXPEDIENTE UNIFICADO SCOUT CON EDICIÓN COMPLETA ================= */}
        {selectedParticipante && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div className="modal-window" style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 1050, maxHeight: "90vh", overflowY: "auto", position: "relative", padding: 32 }}>
              <button onClick={() => setSelectedParticipante(null)} style={{ position: "absolute", right: 16, top: 16, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>

              {(() => {
                const tipoPart = (selectedParticipante.tipo_participante || "").toLowerCase();
                const isJoven = !tipoPart.includes("adulto") && !tipoPart.includes("staff");
                const cuotaTotal = isJoven ? 145 : 100;
                const totalPagadoUsd = modalPagos.filter((p) => p.estado === "validado").reduce((acc, p) => acc + Number(p.monto_bs) / (Number(p.tasa_cambio) || 1), 0);
                const deudaUsd = Math.max(0, cuotaTotal - totalPagadoUsd);
                const deudaBsActual = deudaUsd * tasaBcvActual;

                return (
                  <>
                    <div className="modal-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #eee", paddingBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {selectedProfile?.foto ? (
                          <img src={selectedProfile.foto} alt="Foto Perfil" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ENJ_NAVY}` }} />
                        ) : (
                          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: ENJ_NAVY }}>
                            <User size={28} />
                          </div>
                        )}
                        <div>
                          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
                            {selectedProfile?.nombre || selectedParticipante.nombre} {selectedProfile?.apellido || selectedParticipante.apellido}
                          </h2>
                          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
                            Cédula: <strong>{selectedParticipante.cedula}</strong> | Rol: <span style={{ color: ENJ_MAGENTA, fontWeight: "bold" }}>{selectedProfile?.rol_evento || selectedParticipante.tipo_participante || "Joven Participante"}</span>
                          </p>
                        </div>
                      </div>

                      <button onClick={() => setIsEditingPerfil(!isEditingPerfil)} style={{ background: isEditingPerfil ? ENJ_YELLOW : ENJ_NAVY, color: isEditingPerfil ? ENJ_NAVY : "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                        <Edit3 size={16} /> {isEditingPerfil ? "Cancelar Edición" : "Editar Expediente & Perfil"}
                      </button>
                    </div>

                    <div className="modal-body-grid">
                      
                      {/* COLUMNA IZQUIERDA: ESTADO DE CUENTA Y PAGOS */}
                      <div>
                        <div style={{ background: "#F8FAFF", padding: 18, borderRadius: 16, border: "1px solid rgba(0,11,111,0.1)", marginBottom: 20 }}>
                          <h3 style={{ margin: "0 0 14px", color: ENJ_NAVY, fontSize: 15, fontWeight: 900 }}>
                            <DollarSign size={18} style={{ display: "inline", verticalAlign: "middle" }} /> Estado de Cuenta
                          </h3>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: "#666" }}>Costo Evento:</span>
                            <strong>${cuotaTotal.toFixed(2)} USD</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: "#666" }}>Pagado (Validado):</span>
                            <strong style={{ color: "#16A34A" }}>${totalPagadoUsd.toFixed(2)} USD</strong>
                          </div>
                          <hr style={{ border: "0.5px solid #ddd", margin: "10px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                            <span style={{ color: ENJ_NAVY, fontWeight: 800 }}>Deuda Restante:</span>
                            <div style={{ textAlign: "right" }}>
                              <strong style={{ color: deudaUsd > 0 ? ENJ_MAGENTA : "#16A34A", fontSize: 17 }}>${deudaUsd.toFixed(2)} USD</strong>
                              <div style={{ fontSize: 11, color: "#777" }}>~ Bs. {deudaBsActual.toLocaleString("es-VE")}</div>
                            </div>
                          </div>
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Gestión de Pagos Registrados</h3>
                        {loadingModal ? (
                          <p style={{ fontSize: 13, color: "#666" }}>Cargando pagos...</p>
                        ) : modalPagos.length === 0 ? (
                          <p style={{ color: "#888", fontSize: 13 }}>Sin reportes de pago asociados.</p>
                        ) : (
                          modalPagos.map((pago) => {
                            const usdValue = Number(pago.monto_bs) / (Number(pago.tasa_cambio) || 1);
                            return (
                              <div key={pago.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                  <strong>Ref: {pago.referencia || "S/N"}</strong>
                                  <span style={{ color: pago.estado === "validado" ? "#16A34A" : pago.estado === "rechazado" ? "#DC2626" : "#D97706", fontWeight: "bold" }}>
                                    {pago.estado.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: "#555", margin: "6px 0" }}>
                                  Bs. {Number(pago.monto_bs).toLocaleString("es-VE")} (Tasa: {pago.tasa_cambio}) = <strong style={{ color: ENJ_NAVY }}>${usdValue.toFixed(2)} USD</strong>
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                                  <button disabled={pago.estado === "validado"} onClick={() => handleUpdateEstatusPago(pago.id, "validado")} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: "bold", cursor: "pointer", opacity: pago.estado === "validado" ? 0.5 : 1 }}>Validar</button>
                                  <button disabled={pago.estado === "rechazado"} onClick={() => handleUpdateEstatusPago(pago.id, "rechazado")} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: "bold", cursor: "pointer", opacity: pago.estado === "rechazado" ? 0.5 : 1 }}>Rechazar</button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* COLUMNA DERECHA: EDICIÓN COMPLETA */}
                      <div>
                        {isEditingPerfil ? (
                          <div style={{ background: "#FFFBEB", border: `1.5px solid ${ENJ_YELLOW}`, padding: 18, borderRadius: 14, maxHeight: "55vh", overflowY: "auto" }}>
                            <h4 style={{ margin: "0 0 14px", color: ENJ_NAVY, fontSize: 15, fontWeight: 900 }}>
                              Edición de Expediente Completo
                            </h4>

                            <h5 style={{ margin: "14px 0 8px", color: ENJ_MAGENTA, fontSize: 13 }}>Datos Personales y de Contacto</h5>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Nombre</label>
                                <input type="text" value={editPartData.nombre || ""} onChange={(e) => handleDualChange("nombre", e.target.value)} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Apellido</label>
                                <input type="text" value={editPartData.apellido || ""} onChange={(e) => handleDualChange("apellido", e.target.value)} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Correo</label>
                                <input type="email" value={editPartData.correo || ""} onChange={(e) => handleDualChange("correo", e.target.value)} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Teléfono</label>
                                <input type="text" value={editPartData.telefono || ""} onChange={(e) => handleDualChange("telefono", e.target.value)} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Fecha Nacimiento</label>
                                <input type="date" value={editPartData.fecha_nacimiento || editProfileData.birth_date || ""} onChange={(e) => {
                                  setEditPartData({ ...editPartData, fecha_nacimiento: e.target.value });
                                  setEditProfileData({ ...editProfileData, birth_date: e.target.value });
                                }} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Dirección</label>
                                <input type="text" value={editPartData.direccion || ""} onChange={(e) => setEditPartData({ ...editPartData, direccion: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <h5 style={{ margin: "14px 0 8px", color: ENJ_MAGENTA, fontSize: 13 }}>Información Scout</h5>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Región</label>
                                <input type="text" value={editPartData.region || ""} onChange={(e) => {
                                  setEditPartData({ ...editPartData, region: e.target.value });
                                  setEditProfileData({ ...editProfileData, selected_region: e.target.value });
                                }} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Distrito</label>
                                <input type="text" value={editPartData.distrito || ""} onChange={(e) => {
                                  setEditPartData({ ...editPartData, distrito: e.target.value });
                                  setEditProfileData({ ...editProfileData, distrito: e.target.value, selected_district: e.target.value });
                                }} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Grupo Scout</label>
                                <input type="text" value={editPartData.grupo_scout || ""} onChange={(e) => handleDualChange("grupo_scout", e.target.value)} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Rama Scout</label>
                                <input type="text" value={editPartData.rama || ""} onChange={(e) => {
                                  setEditPartData({ ...editPartData, rama: e.target.value });
                                  setEditProfileData({ ...editProfileData, rama_scout: e.target.value });
                                }} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Rol en Evento</label>
                                <input type="text" value={editPartData.tipo_participante || ""} onChange={(e) => {
                                  setEditPartData({ ...editPartData, tipo_participante: e.target.value });
                                  setEditProfileData({ ...editProfileData, rol_evento: e.target.value });
                                }} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Talla Uniforme</label>
                                <input type="text" value={editPartData.talla_uniforme || ""} onChange={(e) => setEditPartData({ ...editPartData, talla_uniforme: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <h5 style={{ margin: "14px 0 8px", color: ENJ_MAGENTA, fontSize: 13 }}>Perfil Social</h5>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Instagram</label>
                                <input type="text" value={editProfileData.instagram || ""} onChange={(e) => setEditProfileData({ ...editProfileData, instagram: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Descripción / Bio</label>
                                <input type="text" value={editProfileData.descripcion || ""} onChange={(e) => setEditProfileData({ ...editProfileData, descripcion: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <h5 style={{ margin: "14px 0 8px", color: ENJ_MAGENTA, fontSize: 13 }}>Información Médica</h5>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Tipo de Sangre</label>
                                <input type="text" value={editPartData.tipo_sangre || ""} onChange={(e) => setEditPartData({ ...editPartData, tipo_sangre: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: "bold" }}>Contacto Emergencia</label>
                                <input type="text" value={editPartData.contacto_emergencia || ""} onChange={(e) => setEditPartData({ ...editPartData, contacto_emergencia: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                              </div>
                            </div>

                            <label style={{ fontSize: 11, fontWeight: "bold" }}>Alergias</label>
                            <input type="text" value={editPartData.alergias || ""} onChange={(e) => setEditPartData({ ...editPartData, alergias: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />

                            <label style={{ fontSize: 11, fontWeight: "bold" }}>Enfermedades</label>
                            <input type="text" value={editPartData.enfermedades || ""} onChange={(e) => setEditPartData({ ...editPartData, enfermedades: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />

                            <label style={{ fontSize: 11, fontWeight: "bold" }}>Medicamentos</label>
                            <input type="text" value={editPartData.medicamentos || ""} onChange={(e) => setEditPartData({ ...editPartData, medicamentos: e.target.value })} style={{ width: "100%", marginBottom: 14, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />

                            <button onClick={handleSaveExpediente} disabled={actionLoading === "saving_all"} style={{ background: "#16A34A", color: "#fff", padding: "12px", width: "100%", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                              <Save size={16} /> {actionLoading === "saving_all" ? "Guardando cambios..." : "Guardar Todos los Cambios"}
                            </button>
                          </div>
                        ) : (
                          <div style={{ background: "#FAFAFA", padding: 18, borderRadius: 14, border: "1px solid #eee", marginBottom: 20, maxHeight: "55vh", overflowY: "auto" }}>
                            
                            <h4 style={{ margin: "0 0 12px", color: ENJ_NAVY, fontSize: 15, fontWeight: 800 }}>Información Scout y Personal</h4>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Correo / Tel:</strong> {selectedParticipante.correo || "N/A"} - {selectedParticipante.telefono || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Dirección:</strong> {selectedParticipante.direccion || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>F. Nacimiento:</strong> {selectedParticipante.fecha_nacimiento || selectedProfile?.birth_date || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Región / Distrito / Grupo:</strong> {selectedParticipante.region || "N/A"} - {selectedParticipante.distrito || "N/A"} - {selectedParticipante.grupo_scout || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Rama Scout:</strong> {selectedParticipante.rama || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Talla Uniforme:</strong> {selectedParticipante.talla_uniforme || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Instagram:</strong> {selectedProfile?.instagram ? `@${selectedProfile.instagram}` : "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Descripción:</strong> {selectedProfile?.descripcion || "Sin descripción."}</p>
                            
                            <hr style={{ border: "0.5px solid #eee", margin: "14px 0" }} />

                            <h5 style={{ margin: "0 0 8px", color: ENJ_NAVY, fontSize: 13, fontWeight: 800 }}>Información Médica</h5>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Tipo de Sangre:</strong> {selectedParticipante.tipo_sangre || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Alergias:</strong> {selectedParticipante.alergias || "Ninguna"}</p>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Enfermedades:</strong> {selectedParticipante.enfermedades || "Ninguna"}</p>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Medicamentos:</strong> {selectedParticipante.medicamentos || "Ninguno"}</p>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Contacto Emergencia:</strong> {selectedParticipante.contacto_emergencia || "N/A"}</p>
                          </div>
                        )}

                        <h3 style={{ fontSize: 15, fontWeight: 800, color: ENJ_NAVY, marginTop: 16 }}>Documentos Adjuntos</h3>
                        {loadingModal ? (
                          <p style={{ fontSize: 13, color: "#666" }}>Cargando documentos...</p>
                        ) : modalDocs.length === 0 ? (
                          <p style={{ color: "#888", fontSize: 13 }}>Sin documentos subidos.</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {modalDocs.map((doc) => (
                              <div key={doc.id} style={{ background: "#F8FAFF", border: "1px solid #eee", padding: 12, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FileText size={18} color={ENJ_NAVY} />
                                  <span style={{ fontSize: 13, fontWeight: "bold" }}>{doc.tipo_documento}</span>
                                </div>
                                {(doc.url_archivo || doc.archivo_base64) && (
                                  <a href={doc.url_archivo || doc.archivo_base64} target="_blank" rel="noopener noreferrer" style={{ background: ENJ_MAGENTA, color: "#fff", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontSize: 11, fontWeight: "bold" }}>Ver / Descargar</a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}