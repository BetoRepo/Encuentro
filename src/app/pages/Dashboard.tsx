import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  CreditCard, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Building
} from "lucide-react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

interface Participante {
  cedula: string;
  nombre: string;
  apellido: string;
  correo?: string;
  telefono?: string;
  region?: string;
  distrito?: string;
  grupo_scout?: string;
  rama?: string;
  tipo_participante?: string;
  talla_uniforme?: string;
  tipo_sangre?: string;
  alergias?: string;
  enfermedades?: string;
  medicamentos?: string;
  contacto_emergencia?: string;
  created_at?: string;
}

interface Pago {
  id?: string;
  cedula_participante: string;
  numero_cuota: string;
  monto_bs: number;
  referencia: string;
  fecha_pago: string;
  tasa_cambio: number;
  created_at?: string;
}

interface Documento {
  id?: string;
  cedula_participante: string;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo: string;
  archivo_base64?: string;
  created_at?: string;
}

export function Dashboard() {
  // ESTADOS DE LISTADO Y PAGINACIÓN
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  // FILTROS
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>("");

  // MODAL DE EXPEDIENTE
  const [selectedParticipante, setSelectedParticipante] = useState<Participante | null>(null);
  const [modalPagos, setModalPagos] = useState<Pago[]>([]);
  const [modalDocs, setModalDocs] = useState<Documento[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);

  // METRICAS RÁPIDAS
  const [totalJovenes, setTotalJovenes] = useState<number>(0);
  const [totalAdultos, setTotalAdultos] = useState<number>(0);

  // 1. CARGA OPTIMIZADA DE PARTICIPANTES (SIN JOINS PESADOS)
  const loadParticipantes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("participantes")
        .select("*", { count: "planned" });

      // Filtros del servidor
      if (searchTerm.trim() !== "") {
        const cleanSearch = searchTerm.trim();
        query = query.or(`cedula.ilike.%${cleanSearch}%,nombre.ilike.%${cleanSearch}%,apellido.ilike.%${cleanSearch}%`);
      }

      if (selectedRegionFilter) {
        query = query.eq("region", selectedRegionFilter);
      }

      if (selectedTipoFilter) {
        query = query.eq("tipo_participante", selectedTipoFilter);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setParticipantes(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("Error al cargar datos del Dashboard:", err);
      setErrorMsg(err.message || "Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedRegionFilter, selectedTipoFilter]);

  // CARGA DE MÉTRICAS GENERALES
  const loadMetrics = async () => {
    try {
      const { count: jovenesCount } = await supabase
        .from("participantes")
        .select("cedula", { count: "planned", head: true })
        .eq("tipo_participante", "joven");

      const { count: adultosCount } = await supabase
        .from("participantes")
        .select("cedula", { count: "planned", head: true })
        .eq("tipo_participante", "adulto");

      setTotalJovenes(jovenesCount || 0);
      setTotalAdultos(adultosCount || 0);
    } catch (e) {
      console.warn("No se pudieron obtener métricas secundarias:", e);
    }
  };

  useEffect(() => {
    loadParticipantes();
  }, [loadParticipantes]);

  useEffect(() => {
    loadMetrics();
  }, []);

  // 2. CARGA DEL EXPEDIENTE INDIVIDUAL (ON-DEMAND)
  const openExpediente = async (participante: Participante) => {
    setSelectedParticipante(participante);
    setLoadingModal(true);
    setModalPagos([]);
    setModalDocs([]);

    try {
      const cleanCedula = participante.cedula.replace(/\D/g, "").trim();

      // Peticiones paralelas livianas por Cédula exacta
      const [pagosRes, docsRes] = await Promise.all([
        supabase.from("pagos").select("*").eq("cedula_participante", cleanCedula).order("created_at", { ascending: true }),
        supabase.from("documentos_participante").select("*").eq("cedula_participante", cleanCedula)
      ]);

      if (pagosRes.error) console.warn("Error leyendo pagos:", pagosRes.error);
      if (docsRes.error) console.warn("Error leyendo documentos:", docsRes.error);

      setModalPagos(pagosRes.data || []);
      setModalDocs(docsRes.data || []);
    } catch (err) {
      console.error("Error cargando expediente:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* ENCABEZADO Y ACCIONES GENERALES */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ background: ENJ_NAVY, color: ENJ_YELLOW, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 100, letterSpacing: "0.08em" }}>
              PANEL GENERAL ENJ 2026
            </span>
            <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900, color: ENJ_NAVY }}>
              Control de Inscripciones
            </h1>
          </div>

          <button
            onClick={() => { loadParticipantes(); loadMetrics(); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(0,11,111,0.15)", borderRadius: 10, padding: "10px 18px", color: ENJ_NAVY, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            <RefreshCw size={15} /> Actualizar Datos
          </button>
        </div>

        {/* TARJETAS DE RESUMEN RÁPIDO */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,11,111,0.6)" }}>Total Registrados</span>
              <Users size={20} color={ENJ_NAVY} />
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 30, fontWeight: 900, color: ENJ_NAVY }}>{totalCount}</p>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,11,111,0.6)" }}>Jóvenes</span>
              <Users size={20} color={ENJ_MAGENTA} />
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 30, fontWeight: 900, color: ENJ_MAGENTA }}>{totalJovenes}</p>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,11,111,0.6)" }}>Adultos / Staff</span>
              <Building size={20} color={ENJ_NAVY} />
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 30, fontWeight: 900, color: ENJ_NAVY }}>{totalAdultos}</p>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 16, marginBottom: 20, border: "1px solid rgba(0,11,111,0.08)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
            <Search size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Buscar por cédula, nombre o apellido..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={selectedTipoFilter}
              onChange={(e) => { setSelectedTipoFilter(e.target.value); setPage(0); }}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, color: ENJ_NAVY, background: "#FAFBFF", cursor: "pointer", outline: "none" }}
            >
              <option value="">Todos los Tipos</option>
              <option value="joven">Jóvenes</option>
              <option value="adulto">Adultos</option>
            </select>
          </div>
        </div>

        {/* VISTA DE ERROR */}
        {errorMsg && (
          <div style={{ background: "#FDF2F4", border: `1.5px solid ${ENJ_MAGENTA}`, borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 20 }}>
            <AlertCircle size={36} color={ENJ_MAGENTA} style={{ margin: "0 auto 10px" }} />
            <h3 style={{ margin: "0 0 6px", color: ENJ_NAVY, fontSize: 18 }}>Error de conexión con la base de datos</h3>
            <p style={{ margin: "0 0 16px", color: "#9F1239", fontSize: 14, fontFamily: "monospace" }}>{errorMsg}</p>
            <button
              onClick={() => loadParticipantes()}
              style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Reintentar Carga
            </button>
          </div>
        )}

        {/* TABLA PRINCIPAL DE PARTICIPANTES */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,11,111,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: "Inter, sans-serif" }}>
              <thead>
                <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Participante</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Cédula</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Región / Distrito</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Unidad / Rama</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Tipo</th>
                  <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)", fontSize: 14 }}>
                      <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px", display: "block" }} />
                      Cargando participantes...
                    </td>
                  </tr>
                ) : participantes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)", fontSize: 14 }}>
                      No se encontraron registros de participantes.
                    </td>
                  </tr>
                ) : (
                  participantes.map((p) => (
                    <tr key={p.cedula} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 14 }}>{p.nombre} {p.apellido}</div>
                        <div style={{ fontSize: 12, color: "rgba(0,11,111,0.5)" }}>{p.correo || "Sin correo"}</div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>{p.cedula}</td>
                      <td style={{ padding: "14px 18px", fontSize: 13, color: "rgba(0,11,111,0.8)" }}>
                        <div>{p.region || "N/A"}</div>
                        <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>{p.distrito}</div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 13, color: "rgba(0,11,111,0.8)" }}>
                        {p.rama || "N/A"}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 800, 
                          padding: "4px 10px", 
                          borderRadius: 100, 
                          textTransform: "uppercase",
                          background: p.tipo_participante === "joven" ? "rgba(215,0,126,0.1)" : "rgba(0,11,111,0.1)",
                          color: p.tipo_participante === "joven" ? ENJ_MAGENTA : ENJ_NAVY
                        }}>
                          {p.tipo_participante || "joven"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <button
                          onClick={() => openExpediente(p)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          <Eye size={14} /> Ver Expediente
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div style={{ padding: "16px 20px", background: "#F8FAFF", borderTop: "1px solid rgba(0,11,111,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>
              Página {page + 1} de {totalPages} ({totalCount} participantes en total)
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.15)", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1, fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.15)", background: "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: page >= totalPages - 1 ? 0.5 : 1, fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL DETALLE DEL EXPEDIENTE */}
        {selectedParticipante && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 800, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative", padding: 32 }}>
              
              {/* BOTÓN CERRAR */}
              <button
                onClick={() => setSelectedParticipante(null)}
                style={{ position: "absolute", right: 20, top: 20, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ENJ_NAVY }}
              >
                <X size={18} />
              </button>

              {/* ENCABEZADO EXPEDIENTE */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, borderBottom: "1px solid rgba(0,11,111,0.1)", paddingBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: ENJ_NAVY, color: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 }}>
                  {selectedParticipante.nombre.charAt(0)}{selectedParticipante.apellido.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
                    {selectedParticipante.nombre} {selectedParticipante.apellido}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>
                    Cédula: {selectedParticipante.cedula} | {selectedParticipante.region} - {selectedParticipante.distrito}
                  </p>
                </div>
              </div>

              {loadingModal ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.6)" }}>
                  <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
                  Cargando pagos y documentos adjuntos...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  
                  {/* DETALLES GENERALES */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#F8FAFF", padding: 16, borderRadius: 12 }}>
                    <div><strong>Correo:</strong> {selectedParticipante.correo || "N/A"}</div>
                    <div><strong>Teléfono:</strong> {selectedParticipante.telefono || "N/A"}</div>
                    <div><strong>Grupo Scout:</strong> {selectedParticipante.grupo_scout || "N/A"}</div>
                    <div><strong>Unidad:</strong> {selectedParticipante.rama || "N/A"}</div>
                    <div><strong>Talla:</strong> {selectedParticipante.talla_uniforme || "N/A"}</div>
                    <div><strong>Tipo Sangre:</strong> {selectedParticipante.tipo_sangre || "N/A"}</div>
                  </div>

                  {/* HISTORIAL DE PAGOS */}
                  <div>
                    <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 8 }}>
                      <CreditCard size={18} color={ENJ_MAGENTA} /> Historial de Pagos Reportados
                    </h3>
                    {modalPagos.length === 0 ? (
                      <p style={{ fontSize: 13, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No hay registros de pago vinculados.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {modalPagos.map((pago, idx) => (
                          <div key={idx} style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 14 }}>{pago.numero_cuota}</div>
                              <div style={{ fontSize: 12, color: "rgba(0,11,111,0.5)" }}>Ref: {pago.referencia} | Fecha: {pago.fecha_pago}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 800, color: ENJ_MAGENTA, fontSize: 15 }}>Bs. {pago.monto_bs.toLocaleString('es-VE')}</div>
                              <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>Tasa: {pago.tasa_cambio}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DOCUMENTOS ADJUNTOS */}
                  <div>
                    <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 8 }}>
                      <FileText size={18} color={ENJ_NAVY} /> Documentos y Comprobantes
                    </h3>
                    {modalDocs.length === 0 ? (
                      <p style={{ fontSize: 13, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No hay archivos adjuntos en el expediente.</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {modalDocs.map((doc, idx) => (
                          <div key={idx} style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 13, textTransform: "capitalize" }}>{doc.tipo_documento.replace('_', ' ')}</div>
                              <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.nombre_archivo}</div>
                            </div>
                            {doc.url_archivo && (
                              <a
                                href={doc.url_archivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,11,111,0.06)", color: ENJ_NAVY, padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                              >
                                Ver <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}