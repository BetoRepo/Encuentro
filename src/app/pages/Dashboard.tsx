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
  FileText, 
  AlertCircle,
  Download,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
  MessageSquare,
  Trash2,
  ShieldCheck
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
  usuario_id?: string;
  numero_cuota: string;
  concepto?: string;
  monto_bs: number;
  referencia: string;
  fecha_pago: string;
  tasa_cambio: number;
  estado?: string;
  created_at?: string;
}

interface Documento {
  id?: string;
  cedula_participante: string;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo?: string;
  archivo_base64?: string;
  created_at?: string;
}

interface ComunicacionAnuncio {
  id: string;
  titulo?: string;
  contenido?: string;
  mensaje?: string;
  autor?: string;
  created_at?: string;
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"participantes" | "anuncios">("participantes");

  // ESTADOS DE LISTADO Y PAGINACIÓN
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  // FILTROS
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");

  // MÉTRICAS FINANCIERAS Y GENERALES
  const [totalJovenes, setTotalJovenes] = useState<number>(0);
  const [totalAdultos, setTotalAdultos] = useState<number>(0);
  const [totalBsRecaudado, setTotalBsRecaudado] = useState<number>(0);
  const [totalUsdRecaudado, setTotalUsdRecaudado] = useState<number>(0);
  const [totalBsValidado, setTotalBsValidado] = useState<number>(0);
  const [totalUsdValidado, setTotalUsdValidado] = useState<number>(0);
  const [totalPendientesValidacion, setTotalPendientesValidacion] = useState<number>(0);

  // MODAL DE EXPEDIENTE
  const [selectedParticipante, setSelectedParticipante] = useState<Participante | null>(null);
  const [modalPagos, setModalPagos] = useState<Pago[]>([]);
  const [modalDocs, setModalDocs] = useState<Documento[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ANUNCIOS Y COMUNICACIONES
  const [anuncios, setAnuncios] = useState<ComunicacionAnuncio[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState<boolean>(false);

  // 1. CARGA DE PARTICIPANTES CON PAGINACIÓN Y FILTROS
  const loadParticipantes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("participantes")
        .select("*", { count: "planned" });

      if (searchTerm.trim() !== "") {
        const cleanSearch = searchTerm.trim();
        query = query.or(`cedula.ilike.%${cleanSearch}%,nombre.ilike.%${cleanSearch}%,apellido.ilike.%${cleanSearch}%`);
      }

      if (selectedTipoFilter) {
        query = query.eq("tipo_participante", selectedTipoFilter);
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
      console.error("Error al cargar participantes:", err);
      setErrorMsg(err.message || "Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedTipoFilter, selectedRegionFilter]);

  // 2. MÉTRICAS GENERALES Y TOTALES FINANCIEROS (RECAUDADO VS VALIDADO)
  const loadMetricsAndFinances = async () => {
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

      const { data: pagosData, error: pagosErr } = await supabase
        .from("pagos")
        .select("monto_bs, tasa_cambio, estatus_validacion");

      if (!pagosErr && pagosData) {
        let bsSum = 0;
        let usdSum = 0;
        let bsVal = 0;
        let usdVal = 0;
        let pendientesCount = 0;

        pagosData.forEach((pago) => {
          const bs = Number(pago.monto_bs) || 0;
          const tasa = Number(pago.tasa_cambio) || 1;
          const usd = tasa > 0 ? bs / tasa : 0;

          bsSum += bs;
          usdSum += usd;

          if (pago.estatus_validacion === "Validado") {
            bsVal += bs;
            usdVal += usd;
          } else if (!pago.estatus_validacion || pago.estatus_validacion === "Pendiente") {
            pendientesCount++;
          }
        });

        setTotalBsRecaudado(bsSum);
        setTotalUsdRecaudado(usdSum);
        setTotalBsValidado(bsVal);
        setTotalUsdValidado(usdVal);
        setTotalPendientesValidacion(pendientesCount);
      }
    } catch (e) {
      console.warn("No se pudieron cargar métricas financieras:", e);
    }
  };

  // 3. CARGA DE TABLA DE ANUNCIOS / COMUNICACIONES
  const loadAnuncios = async () => {
    setLoadingAnuncios(true);
    try {
      const { data, error } = await supabase
        .from("comunicaciones_anuncios")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAnuncios(data);
      }
    } catch (e) {
      console.warn("Error al cargar comunicaciones:", e);
    } finally {
      setLoadingAnuncios(false);
    }
  };

  useEffect(() => {
    loadParticipantes();
  }, [loadParticipantes]);

  useEffect(() => {
    loadMetricsAndFinances();
    loadAnuncios();
  }, []);

  // 4. ABRIR EXPEDIENTE INDIVIDUAL Y Cargar PAGOS + DOCUMENTOS
  const openExpediente = async (participante: Participante) => {
    setSelectedParticipante(participante);
    setLoadingModal(true);
    setModalPagos([]);
    setModalDocs([]);

    try {
      const cleanCedula = participante.cedula.replace(/\D/g, "").trim();

      const [pagosRes, docsRes] = await Promise.all([
        supabase
          .from("pagos")
          .select("*")
          .or(`cedula_participante.eq.${cleanCedula},cedula_participante.eq.${participante.cedula}`)
          .order("created_at", { ascending: true }),
        supabase
          .from("documentos_participante")
          .select("*")
          .or(`cedula_participante.eq.${cleanCedula},cedula_participante.eq.${participante.cedula}`)
      ]);

      setModalPagos(pagosRes.data || []);
      setModalDocs(docsRes.data || []);
    } catch (err) {
      console.error("Error al cargar expediente:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  // 5. CAMBIAR ESTATUS DE PAGO (VALIDAR / RECHAZAR)
const handleUpdateEstatusPago = async (pagoId: string, nuevoEstado: 'validado' | 'rechazado') => {
  setActionLoading(pagoId);
  try {
    // CAMBIO CLAVE: Usamos 'estado' en lugar de 'estatus_validacion'
    const { error } = await supabase
      .from("pagos")
      .update({ estado: nuevoEstado })
      .eq("id", pagoId);

    if (error) throw error;

    // Actualizamos el estado local en el modal sin recargar
    setModalPagos((prev) =>
      prev.map((p) => (p.id === pagoId ? { ...p, estado: nuevoEstado } : p))
    );
    // Recargamos las métricas globales de finanzas
    loadMetricsAndFinances();
  } catch (err: any) {
    alert("Error al actualizar pago: " + err.message);
  } finally {
    setActionLoading(null);
  }
};
  // 6. ELIMINAR COMUNICADO
  const handleDeleteAnuncio = async (id: string) => {
    if (!confirm("¿Deseas eliminar este anuncio oficial?")) return;
    try {
      const { error } = await supabase.from("comunicaciones_anuncios").delete().eq("id", id);
      if (error) throw error;
      setAnuncios((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert("Error al eliminar comunicado: " + err.message);
    }
  };

  // 7. DESCARGA DE DOCUMENTOS
  const handleDownloadFile = (doc: Documento) => {
    try {
      if (doc.url_archivo) {
        window.open(doc.url_archivo, "_blank");
        return;
      }

      if (doc.archivo_base64) {
        const link = document.createElement("a");
        const isFullDataUrl = doc.archivo_base64.startsWith("data:");
        
        link.href = isFullDataUrl ? doc.archivo_base64 : `data:application/octet-stream;base64,${doc.archivo_base64}`;
        link.download = doc.nombre_archivo || `documento_${doc.tipo_documento}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("El archivo no posee un formato válido para descargar.");
      }
    } catch (e) {
      console.error("Error al descargar archivo:", e);
      alert("No se pudo iniciar la descarga.");
    }
  };

  // 8. EXPORTAR LISTADO EN FORMATO CSV / EXCEL
  const exportToCSV = async () => {
    try {
      const { data, error } = await supabase
        .from("participantes")
        .select("*")
        .order("apellido", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return alert("No hay datos de participantes para exportar.");

      const headers = ["Cedula", "Nombre", "Apellido", "Correo", "Telefono", "Region", "Distrito", "Grupo", "Rama", "Tipo", "Talla"];
      const csvRows = [
        headers.join(","),
        ...data.map((p) => [
          `"${p.cedula || ''}"`,
          `"${p.nombre || ''}"`,
          `"${p.apellido || ''}"`,
          `"${p.correo || ''}"`,
          `"${p.telefono || ''}"`,
          `"${p.region || ''}"`,
          `"${p.distrito || ''}"`,
          `"${p.grupo_scout || ''}"`,
          `"${p.rama || ''}"`,
          `"${p.tipo_participante || ''}"`,
          `"${p.talla_uniforme || ''}"`
        ].join(","))
      ];

      const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Inscritos_ENJ2026_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert("Error al exportar CSV: " + err.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const modalTotalBs = modalPagos.reduce((acc, p) => acc + (Number(p.monto_bs) || 0), 0);
  const modalTotalUsd = modalPagos.reduce((acc, p) => {
    const bs = Number(p.monto_bs) || 0;
    const tasa = Number(p.tasa_cambio) || 1;
    return acc + (tasa > 0 ? bs / tasa : 0);
  }, 0);

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        
        {/* ENCABEZADO Y ACCIONES */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ background: ENJ_NAVY, color: ENJ_YELLOW, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 100, letterSpacing: "0.08em" }}>
              ASOCIACIÓN DE SCOUTS DE VENEZUELA • ENJ 2026
            </span>
            <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900, color: ENJ_NAVY }}>
              Panel General de Control y Validación
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={exportToCSV}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              <FileSpreadsheet size={16} /> Exportar CSV / Excel
            </button>

            <button
              onClick={() => { loadParticipantes(); loadMetricsAndFinances(); loadAnuncios(); }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(0,11,111,0.15)", borderRadius: 10, padding: "10px 18px", color: ENJ_NAVY, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>
        </div>

        {/* MÉTRICAS FINANCIERAS Y GENERALES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Inscritos Totales</span>
              <Users size={18} color={ENJ_NAVY} />
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
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Por Validar</span>
              <Clock size={18} color="#D97706" />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 900, color: "#D97706" }}>{totalPendientesValidacion}</p>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Total Reportado</span>
              <CreditCard size={18} color={ENJ_NAVY} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 900, color: ENJ_NAVY }}>
              Bs. {totalBsRecaudado.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.5)" }}>~ ${totalUsdRecaudado.toFixed(2)} USD</span>
          </div>

          <div style={{ background: "linear-gradient(135deg, #000B6F 0%, #0015B8 100%)", padding: 20, borderRadius: 16, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: ENJ_YELLOW, textTransform: "uppercase" }}>Total Validado ($)</span>
              <ShieldCheck size={18} color={ENJ_YELLOW} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 900, color: "#fff" }}>
              $ {totalUsdValidado.toFixed(2)} USD
            </p>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Bs. {totalBsValidado.toLocaleString('es-VE')}</span>
          </div>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab("participantes")}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: activeTab === "participantes" ? ENJ_NAVY : "#fff",
              color: activeTab === "participantes" ? "#fff" : ENJ_NAVY,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <Users size={16} /> Registro de Participantes
          </button>

          <button
            onClick={() => setActiveTab("anuncios")}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: activeTab === "anuncios" ? ENJ_NAVY : "#fff",
              color: activeTab === "anuncios" ? "#fff" : ENJ_NAVY,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <MessageSquare size={16} /> Comunicaciones y Anuncios ({anuncios.length})
          </button>
        </div>

        {/* CONTENIDO PESTAÑA 1: PARTICIPANTES */}
        {activeTab === "participantes" && (
          <>
            <div style={{ background: "#fff", padding: 18, borderRadius: 16, marginBottom: 20, border: "1px solid rgba(0,11,111,0.08)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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

              <select
                value={selectedTipoFilter}
                onChange={(e) => { setSelectedTipoFilter(e.target.value); setPage(0); }}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, color: ENJ_NAVY, background: "#FAFBFF", cursor: "pointer", outline: "none" }}
              >
                <option value="">Todos los Tipos</option>
                <option value="joven">Jóvenes</option>
                <option value="adulto">Adultos</option>
              </select>

              <input
                type="text"
                placeholder="Filtrar por Región..."
                value={selectedRegionFilter}
                onChange={(e) => { setSelectedRegionFilter(e.target.value); setPage(0); }}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, color: ENJ_NAVY, outline: "none", width: 160 }}
              />
            </div>

            {errorMsg && (
              <div style={{ background: "#FDF2F4", border: `1.5px solid ${ENJ_MAGENTA}`, borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 20 }}>
                <AlertCircle size={36} color={ENJ_MAGENTA} style={{ margin: "0 auto 10px" }} />
                <h3 style={{ margin: "0 0 6px", color: ENJ_NAVY, fontSize: 18 }}>Error al conectar con Supabase</h3>
                <p style={{ margin: "0 0 16px", color: "#9F1239", fontSize: 14, fontFamily: "monospace" }}>{errorMsg}</p>
                <button onClick={() => loadParticipantes()} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Reintentar Carga
                </button>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,11,111,0.05)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: "Inter, sans-serif" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Participante</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Cédula</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Región / Distrito</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Rama / Grupo</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Tipo</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase", textAlign: "right" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)", fontSize: 14 }}>
                          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px", display: "block" }} />
                          Cargando lista de inscritos...
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
                            <div><strong>{p.rama || "N/A"}</strong></div>
                            <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>{p.grupo_scout}</div>
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

              <div style={{ padding: "16px 20px", background: "#F8FAFF", borderTop: "1px solid rgba(0,11,111,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>
                  Página {page + 1} de {totalPages} ({totalCount} registros)
                </span>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.15)", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1, fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.15)", background: "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: page >= totalPages - 1 ? 0.5 : 1, fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CONTENIDO PESTAÑA 2: ANUNCIOS Y COMUNICACIONES */}
        {activeTab === "anuncios" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={20} color={ENJ_MAGENTA} /> Anuncios y Comunicaciones Publicadas
            </h3>

            {loadingAnuncios ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)" }}>
                <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px", display: "block" }} />
                Cargando anuncios...
              </div>
            ) : anuncios.length === 0 ? (
              <p style={{ color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No se registran anuncios o comunicaciones cargadas.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {anuncios.map((item) => (
                  <div key={item.id} style={{ background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: 15, color: ENJ_NAVY }}>{item.titulo || "Comunicado Oficial"}</strong>
                        {item.created_at && (
                          <span style={{ fontSize: 11, color: "rgba(0,11,111,0.4)" }}>
                            {new Date(item.created_at).toLocaleString("es-VE")}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: 1.5 }}>
                        {item.contenido || item.mensaje}
                      </p>
                      {item.autor && <span style={{ fontSize: 11, color: ENJ_MAGENTA, fontWeight: 700 }}>Publicado por: {item.autor}</span>}
                    </div>

                    <button
                      onClick={() => handleDeleteAnuncio(item.id)}
                      style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL COMPLETO DE EXPEDIENTE DEL PARTICIPANTE */}
        {selectedParticipante && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 880, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative", padding: 32 }}>
              
              <button
                onClick={() => setSelectedParticipante(null)}
                style={{ position: "absolute", right: 20, top: 20, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ENJ_NAVY }}
              >
                <X size={18} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, borderBottom: "1px solid rgba(0,11,111,0.1)", paddingBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: ENJ_NAVY, color: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 }}>
                  {selectedParticipante.nombre.charAt(0)}{selectedParticipante.apellido.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
                    {selectedParticipante.nombre} {selectedParticipante.apellido}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>
                    Cédula: {selectedParticipante.cedula} | Región: {selectedParticipante.region || "N/A"} - {selectedParticipante.distrito || "N/A"}
                  </p>
                </div>
              </div>

              {loadingModal ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.6)" }}>
                  <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
                  Cargando expediente, ficha y pagos...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  
                  {/* FICHA SCOUT Y MÉDICA DETALLADA */}
                  <div style={{ background: "#F8FAFF", padding: 18, borderRadius: 14, border: "1px solid rgba(0,11,111,0.08)" }}>
                    <h4 style={{ margin: "0 0 12px", color: ENJ_NAVY, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ficha Médica y de Registro</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontSize: 13 }}>
                      <div><strong>Correo:</strong> {selectedParticipante.correo || "N/A"}</div>
                      <div><strong>Teléfono:</strong> {selectedParticipante.telefono || "N/A"}</div>
                      <div><strong>Grupo Scout:</strong> {selectedParticipante.grupo_scout || "N/A"}</div>
                      <div><strong>Rama / Unidad:</strong> {selectedParticipante.rama || "N/A"}</div>
                      <div><strong>Talla Uniforme:</strong> {selectedParticipante.talla_uniforme || "N/A"}</div>
                      <div><strong>Tipo Sangre:</strong> {selectedParticipante.tipo_sangre || "N/A"}</div>
                      <div><strong>Alergias:</strong> {selectedParticipante.alergias || "Ninguna"}</div>
                      <div><strong>Contacto Emergencia:</strong> {selectedParticipante.contacto_emergencia || "N/A"}</div>
                    </div>
                  </div>

                  {/* SECCIÓN DE VALIDACIÓN DE CUOTAS / PAGOS */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 8 }}>
                        <CreditCard size={18} color={ENJ_MAGENTA} /> Pagos Reportados y Validación
                      </h3>
                      <div style={{ fontSize: 13, fontWeight: 800, color: ENJ_NAVY }}>
                        Total Pagado: <span style={{ color: ENJ_MAGENTA }}>Bs. {modalTotalBs.toLocaleString('es-VE')}</span> (~ ${modalTotalUsd.toFixed(2)} USD)
                      </div>
                    </div>

                    {modalPagos.length === 0 ? (
                      <p style={{ fontSize: 13, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No registra pagos cargados en el sistema.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {modalPagos.map((pago) => {
                          const bs = Number(pago.monto_bs) || 0;
                          const tasa = Number(pago.tasa_cambio) || 1;
                          const usd = tasa > 0 ? bs / tasa : 0;
                          const estatus = pago.estado || "Pendiente";
                          const isValidado = estatus === "Validado";
                          const isRechazado = estatus === "Rechazado";

                          return (
                            <div key={pago.id || pago.referencia} style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.12)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                  <strong style={{ fontSize: 14, color: ENJ_NAVY }}>{pago.concepto || pago.numero_cuota || "Cuota ENJ"}</strong>
                                  <span style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    padding: "2px 8px",
                                    borderRadius: 100,
                                    background: isValidado ? "#DCFCE7" : isRechazado ? "#FEE2E2" : "#FEF3C7",
                                    color: isValidado ? "#166534" : isRechazado ? "#991B1B" : "#92400E",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4
                                  }}>
                                    {isValidado && <CheckCircle size={12} />}
                                    {isRechazado && <XCircle size={12} />}
                                    {!isValidado && !isRechazado && <Clock size={12} />}
                                    {estatus}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: "rgba(0,11,111,0.6)" }}>
                                  Ref: <strong>{pago.referencia}</strong> | Fecha: {pago.fecha_pago}
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontWeight: 800, color: ENJ_MAGENTA, fontSize: 15 }}>
                                    Bs. {bs.toLocaleString('es-VE')}
                                  </div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY }}>
                                    $ {usd.toFixed(2)} USD <span style={{ fontSize: 11, color: "rgba(0,11,111,0.5)", fontWeight: 400 }}>(Tasa: {tasa})</span>
                                  </div>
                                </div>

                                {/* BOTONES DE VALIDACIÓN */}
                                {pago.id && (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                      disabled={actionLoading === pago.id || isValidado}
                                      onClick={() => handleUpdateEstatusPago(pago.id!, "Validado")}
                                      style={{ background: isValidado ? "#E2E8F0" : "#16A34A", color: isValidado ? "#94A3B8" : "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: isValidado ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                    >
                                      <CheckCircle size={14} /> Validar
                                    </button>

                                    <button
                                      disabled={actionLoading === pago.id || isRechazado}
                                      onClick={() => handleUpdateEstatusPago(pago.id!, "Rechazado")}
                                      style={{ background: isRechazado ? "#E2E8F0" : "#DC2626", color: isRechazado ? "#94A3B8" : "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: isRechazado ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                    >
                                      <XCircle size={14} /> Rechazar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* DOCUMENTOS ADJUNTOS */}
                  <div>
                    <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 8 }}>
                      <FileText size={18} color={ENJ_NAVY} /> Documentos Adjuntos
                    </h3>
                    {modalDocs.length === 0 ? (
                      <p style={{ fontSize: 13, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No hay documentos adjuntos en este expediente.</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                        {modalDocs.map((doc, idx) => (
                          <div key={idx} style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ overflow: "hidden" }}>
                              <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 13, textTransform: "capitalize" }}>
                                {doc.tipo_documento.replace('_', ' ')}
                              </div>
                              <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {doc.nombre_archivo || "Documento sin nombre"}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownloadFile(doc)}
                              style={{ display: "flex", alignItems: "center", gap: 6, background: ENJ_NAVY, color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                            >
                              <Download size={14} /> Descargar
                            </button>
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