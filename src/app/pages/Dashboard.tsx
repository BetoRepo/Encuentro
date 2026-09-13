import { useState, useEffect, useCallback } from "react";
import {
  Users, CreditCard, Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, X, AlertCircle, Building, Clock, FileSpreadsheet,
  MessageSquare, Trash2, ShieldCheck, Edit3, Save, MessageCircle,
  UserCheck, FileText, CheckCircle2, XCircle, Filter, Phone, Mail, ShieldAlert, DollarSign
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
  foto?: string;
  rol_evento?: string;
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
  const [activeTab, setActiveTab] = useState<"participantes" | "pagos">("participantes");

  // ESTADOS DE PARTICIPANTES
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  // FILTROS DE BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");

  // ESTADOS DE PAGOS
  const [todosLosPagos, setTodosLosPagos] = useState<Pago[]>([]);
  const [loadingPagos, setLoadingPagos] = useState<boolean>(false);
  const [pagoSearchTerm, setPagoSearchTerm] = useState<string>("");
  const [pagoEstadoFilter, setPagoEstadoFilter] = useState<string>("");

  // MÉTRICAS Y FINANZAS
  const [totalJovenes, setTotalJovenes] = useState<number>(0);
  const [totalAdultos, setTotalAdultos] = useState<number>(0);
  const [totalBsValidado, setTotalBsValidado] = useState<number>(0);
  const [totalUsdValidado, setTotalUsdValidado] = useState<number>(0);
  const [totalPendientesValidacion, setTotalPendientesValidacion] = useState<number>(0);
  const [tasaBcvActual, setTasaBcvActual] = useState<number>(36.5);

  // MODAL EXPEDIENTE
  const [selectedParticipante, setSelectedParticipante] = useState<Participante | null>(null);
  const [modalPagos, setModalPagos] = useState<Pago[]>([]);
  const [modalDocs, setModalDocs] = useState<Documento[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditingPerfil, setIsEditingPerfil] = useState<boolean>(false);
  const [editData, setEditData] = useState<Partial<Participante>>({});

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

      if (selectedTipoFilter) {
        query = query.ilike("tipo_participante", `%${selectedTipoFilter}%`);
      }

      if (selectedRegionFilter) {
        query = query.ilike("region", `%${selectedRegionFilter}%`);
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
  }, [page, searchTerm, selectedTipoFilter, selectedRegionFilter]);

  // 2. CARGAR HISTORIAL GLOBAL DE PAGOS CON JOIN A PARTICIPANTES
  const loadGlobalPagos = async () => {
    setLoadingPagos(true);
    try {
      const { data: pagosData, error: pagosErr } = await supabase
        .from("pagos")
        .select("*")
        .order("created_at", { ascending: false });

      if (pagosErr) throw pagosErr;

      if (pagosData && pagosData.length > 0) {
        const cedulasUnicas = Array.from(new Set(pagosData.map((p) => p.cedula_participante?.trim()).filter(Boolean)));

        let partMap: Record<string, Participante> = {};
        if (cedulasUnicas.length > 0) {
          const { data: partData } = await supabase
            .from("participantes")
            .select("*")
            .in("cedula", cedulasUnicas);

          if (partData) {
            partData.forEach((p) => {
              partMap[p.cedula.trim()] = p;
            });
          }
        }

        const mergedPagos: Pago[] = pagosData.map((pago) => ({
          ...pago,
          participante: partMap[pago.cedula_participante?.trim()] || null,
        }));

        setTodosLosPagos(mergedPagos);
      } else {
        setTodosLosPagos([]);
      }
    } catch (e: any) {
      console.warn("Error cargando pagos globales:", e.message);
    } finally {
      setLoadingPagos(false);
    }
  };

  // 3. CARGAR MÉTRICAS Y ESTADÍSTICAS FINANCIERAS
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
        setTotalBsValidado(bsVal);
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
    loadGlobalPagos();
  }, []);

  // 4. ABRIR EXPEDIENTE INDIVIDUAL (VÍNCULO DIRECTO POR CÉDULA)
  const openExpediente = async (participante: Participante) => {
    setSelectedParticipante(participante);
    setEditData(participante);
    setIsEditingPerfil(false);
    setLoadingModal(true);
    setModalPagos([]);
    setModalDocs([]);

    try {
      const cleanCedula = participante.cedula.trim();

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

  // 5. GUARDAR EDICIÓN DE PARTICIPANTE
  const handleSaveParticipante = async () => {
    if (!selectedParticipante) return;
    setActionLoading("saving_participante");
    try {
      const { error } = await supabase
        .from("participantes")
        .update(editData)
        .eq("cedula", selectedParticipante.cedula);

      if (error) throw error;

      const updated = { ...selectedParticipante, ...editData } as Participante;
      setSelectedParticipante(updated);
      setParticipantes((prev) => prev.map((p) => (p.cedula === selectedParticipante.cedula ? updated : p)));
      setIsEditingPerfil(false);
      alert("¡Expediente Scout actualizado con éxito!");
    } catch (err: any) {
      alert("Error actualizando expediente: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 6. CAMBIAR ESTATUS DE PAGO EN SUPABASE
  const handleUpdateEstatusPago = async (pagoId: string, nuevoEstado: "validado" | "rechazado" | "pendiente") => {
    setActionLoading(pagoId);
    try {
      const { error } = await supabase.from("pagos").update({ estado: nuevoEstado }).eq("id", pagoId);
      if (error) throw error;

      setModalPagos((prev) => prev.map((p) => (p.id === pagoId ? { ...p, estado: nuevoEstado } : p)));
      setTodosLosPagos((prev) => prev.map((p) => (p.id === pagoId ? { ...p, estado: nuevoEstado } : p)));
      loadMetricsAndFinances();
    } catch (err: any) {
      alert("Error al actualizar pago: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pagosFiltrados = todosLosPagos.filter((pago) => {
    const search = pagoSearchTerm.toLowerCase().trim();
    const part = pago.participante;
    const matchesSearch =
      !search ||
      (pago.referencia || "").toLowerCase().includes(search) ||
      pago.cedula_participante.toLowerCase().includes(search) ||
      (part?.nombre || "").toLowerCase().includes(search) ||
      (part?.apellido || "").toLowerCase().includes(search);
    const matchesEstado = !pagoEstadoFilter || pago.estado === pagoEstadoFilter;
    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        
        {/* ENCABEZADO SCOUT ENJ 2026 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ background: ENJ_NAVY, color: ENJ_YELLOW, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 100 }}>
              ASOCIACIÓN DE SCOUTS DE VENEZUELA • ENJ 2026
            </span>
            <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900, color: ENJ_NAVY }}>
              Panel General de Control y Gestión
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                loadParticipantes();
                loadMetricsAndFinances();
                loadGlobalPagos();
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

        {/* MÉTICIS GENERALES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Participantes</span>
              <UserCheck size={18} color={ENJ_NAVY} />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>{totalCount}</p>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Jóvenes / Adultos</span>
              <Building size={18} color={ENJ_MAGENTA} />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
              <span style={{ color: ENJ_MAGENTA }}>{totalJovenes}</span> / {totalAdultos}
            </p>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Pagos por Validar</span>
              <Clock size={18} color="#D97706" />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 900, color: "#D97706" }}>{totalPendientesValidacion}</p>
          </div>

          <div style={{ background: "linear-gradient(135deg, #000B6F 0%, #0015B8 100%)", padding: 20, borderRadius: 16, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: ENJ_YELLOW, textTransform: "uppercase" }}>Total Validado ($)</span>
              <ShieldCheck size={18} color={ENJ_YELLOW} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 900, color: "#fff" }}>${totalUsdValidado.toFixed(2)} USD</p>
          </div>
        </div>

        {/* SELECCIÓN DE PESTAÑAS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab("participantes")}
            style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: activeTab === "participantes" ? ENJ_NAVY : "#fff", color: activeTab === "participantes" ? "#fff" : ENJ_NAVY, fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            Expedientes de Participantes ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("pagos")}
            style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: activeTab === "pagos" ? ENJ_NAVY : "#fff", color: activeTab === "pagos" ? "#fff" : ENJ_NAVY, fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            Gestión Global de Pagos
          </button>
        </div>

        {/* ================= TAB 1: LISTA DE PARTICIPANTES ================= */}
        {activeTab === "participantes" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", overflow: "hidden" }}>
            
            {/* BUSCADOR Y FILTROS */}
            <div style={{ padding: 16, borderBottom: "1px solid rgba(0,11,111,0.08)", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
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

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
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
                          style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          Ver Expediente
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* CONTROLES DE PAGINACIÓN */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#F8FAFF", borderTop: "1px solid rgba(0,11,111,0.08)" }}>
              <span style={{ fontSize: 13, color: ENJ_NAVY, fontWeight: 600 }}>Página {page + 1} de {totalPages}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer" }}><ChevronLeft size={16} /></button>
                <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page + 1 >= totalPages ? "not-allowed" : "pointer" }}><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: HISTORIAL GLOBAL DE PAGOS ================= */}
        {activeTab === "pagos" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: ENJ_NAVY, fontSize: 18, fontWeight: 800 }}>Historial Global de Pagos</h3>
              <input
                type="text"
                placeholder="Filtrar referencia o cédula..."
                value={pagoSearchTerm}
                onChange={(e) => setPagoSearchTerm(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, width: 250 }}
              />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                  <th style={{ padding: "12px" }}>Cédula / Nombre</th>
                  <th style={{ padding: "12px" }}>Referencia</th>
                  <th style={{ padding: "12px" }}>Monto / Tasa</th>
                  <th style={{ padding: "12px" }}>Equivalente</th>
                  <th style={{ padding: "12px" }}>Estado</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loadingPagos ? (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: "center" }}>Cargando pagos...</td></tr>
                ) : pagosFiltrados.map((pago) => {
                  const usd = Number(pago.monto_bs) / (Number(pago.tasa_cambio) || 1);
                  return (
                    <tr key={pago.id} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                      <td style={{ padding: "12px" }}>
                        <strong>{pago.cedula_participante}</strong>
                        {pago.participante && <div style={{ fontSize: 11, color: "#666" }}>{pago.participante.nombre} {pago.participante.apellido}</div>}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>{pago.referencia || "N/A"}</td>
                      <td style={{ padding: "12px" }}>Bs. {Number(pago.monto_bs).toLocaleString("es-VE")} <br/><span style={{ fontSize: 11, color: "#777" }}>Tasa: {pago.tasa_cambio}</span></td>
                      <td style={{ padding: "12px", fontWeight: "bold", color: ENJ_NAVY }}>${usd.toFixed(2)} USD</td>
                      <td style={{ padding: "12px", fontWeight: "bold", color: pago.estado === "validado" ? "#16A34A" : pago.estado === "rechazado" ? "#DC2626" : "#D97706" }}>
                        {pago.estado.toUpperCase()}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {pago.participante && (
                          <button onClick={() => openExpediente(pago.participante!)} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                            Ver Expediente
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= MODAL EXPEDIENTE UNIFICADO SCOUT ================= */}
        {selectedParticipante && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 1000, maxHeight: "90vh", overflowY: "auto", position: "relative", padding: 32 }}>
              
              <button onClick={() => setSelectedParticipante(null)} style={{ position: "absolute", right: 20, top: 20, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer" }}>
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #eee", paddingBottom: 20 }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: ENJ_NAVY }}>
                          {selectedParticipante.nombre} {selectedParticipante.apellido}
                        </h2>
                        <p style={{ margin: "4px 0 0", color: "#666" }}>
                          Cédula: <strong>{selectedParticipante.cedula}</strong> | Tipo: <span style={{ color: ENJ_MAGENTA, fontWeight: "bold", textTransform: "uppercase" }}>{isJoven ? "Jóven" : "Adulto / Staff"}</span>
                        </p>
                      </div>
                      <button onClick={() => setIsEditingPerfil(!isEditingPerfil)} style={{ background: isEditingPerfil ? ENJ_YELLOW : ENJ_NAVY, color: isEditingPerfil ? ENJ_NAVY : "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>
                        <Edit3 size={16} style={{ display: "inline", marginRight: 6 }} /> {isEditingPerfil ? "Cerrar Edición" : "Editar Expediente"}
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                      
                      {/* COLUMNA IZQUIERDA: FINANZAS Y PAGOS */}
                      <div>
                        <div style={{ background: "#F8FAFF", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.1)", marginBottom: 20 }}>
                          <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 16, fontWeight: 900 }}>
                            <DollarSign size={18} style={{ display: "inline" }} /> Estado de Cuenta
                          </h3>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ color: "#666" }}>Costo Evento:</span>
                            <strong>${cuotaTotal.toFixed(2)} USD</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ color: "#666" }}>Pagado (Validado):</span>
                            <strong style={{ color: "#16A34A" }}>${totalPagadoUsd.toFixed(2)} USD</strong>
                          </div>
                          <hr style={{ border: "0.5px solid #ddd", margin: "10px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}>
                            <span style={{ color: ENJ_NAVY, fontWeight: 800 }}>Deuda Restante:</span>
                            <div style={{ textAlign: "right" }}>
                              <strong style={{ color: deudaUsd > 0 ? ENJ_MAGENTA : "#16A34A", fontSize: 18 }}>${deudaUsd.toFixed(2)} USD</strong>
                              <div style={{ fontSize: 11, color: "#777" }}>~ Bs. {deudaBsActual.toLocaleString("es-VE")}</div>
                            </div>
                          </div>
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Gestión de Pagos Registrados</h3>
                        {loadingModal ? (
                          <p>Cargando pagos...</p>
                        ) : modalPagos.length === 0 ? (
                          <p style={{ color: "#888", fontSize: 13 }}>Sin reportes de pago asociados.</p>
                        ) : (
                          modalPagos.map((pago) => {
                            const usdValue = Number(pago.monto_bs) / (Number(pago.tasa_cambio) || 1);
                            return (
                              <div key={pago.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                  <strong>Ref: {pago.referencia || "S/N"}</strong>
                                  <span style={{ color: pago.estado === "validado" ? "#16A34A" : pago.estado === "rechazado" ? "#DC2626" : "#D97706", fontWeight: "bold" }}>
                                    {pago.estado.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{ fontSize: 13, color: "#555", margin: "6px 0" }}>
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

                      {/* COLUMNA DERECHA: DATOS MÉDICOS E INSTITUCIONALES / EDICIÓN */}
                      <div>
                        {isEditingPerfil ? (
                          <div style={{ background: "#FFFBEB", border: `1.5px solid ${ENJ_YELLOW}`, padding: 20, borderRadius: 14 }}>
                            <h4 style={{ margin: "0 0 14px", color: ENJ_NAVY }}>Editar Datos del Participante</h4>
                            
                            <label style={{ fontSize: 11, fontWeight: "bold" }}>Nombre</label>
                            <input type="text" value={editData.nombre || ""} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
                            
                            <label style={{ fontSize: 11, fontWeight: "bold" }}>Apellido</label>
                            <input type="text" value={editData.apellido || ""} onChange={(e) => setEditData({ ...editData, apellido: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
                            
                            <label style={{ fontSize: 11, fontWeight: "bold" }}>Tipo Sangre</label>
                            <input type="text" value={editData.tipo_sangre || ""} onChange={(e) => setEditData({ ...editData, tipo_sangre: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />

                            <label style={{ fontSize: 11, fontWeight: "bold" }}>Alergias</label>
                            <input type="text" value={editData.alergias || ""} onChange={(e) => setEditData({ ...editData, alergias: e.target.value })} style={{ width: "100%", marginBottom: 12, padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />

                            <button onClick={handleSaveParticipante} style={{ background: "#16A34A", color: "#fff", padding: "10px", width: "100%", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>Guardar Cambios</button>
                          </div>
                        ) : (
                          <div style={{ background: "#FAFAFA", padding: 20, borderRadius: 14, border: "1px solid #eee", marginBottom: 20 }}>
                            <h4 style={{ margin: "0 0 12px", color: ENJ_NAVY }}>Información Médica e Institucional</h4>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Grupo Scout:</strong> {selectedParticipante.grupo_scout || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Región / Distrito:</strong> {selectedParticipante.region || "N/A"} - {selectedParticipante.distrito || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Tipo de Sangre:</strong> {selectedParticipante.tipo_sangre || "N/A"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Alergias:</strong> {selectedParticipante.alergias || "Ninguna"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Medicamentos:</strong> {selectedParticipante.medicamentos || "Ninguno"}</p>
                            <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Contacto Emergencia:</strong> {selectedParticipante.contacto_emergencia || "N/A"}</p>
                          </div>
                        )}

                        <h3 style={{ fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Documentos Adjuntos</h3>
                        {loadingModal ? (
                          <p>Cargando documentos...</p>
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