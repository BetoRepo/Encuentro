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
  ShieldCheck,
  Edit3,
  Save,
  MessageCircle,
  UserCheck
} from "lucide-react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

export interface Profile {
  id: string;
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

export interface Pago {
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

export interface Documento {
  id?: string;
  cedula_participante: string;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo?: string;
  archivo_base64?: string;
  created_at?: string;
}

export interface ComunicacionAnuncio {
  id: string;
  titulo?: string;
  contenido?: string;
  mensaje?: string;
  autor?: string;
  created_at?: string;
}

export interface MensajeMuro {
  id: string;
  nombre?: string;
  autor?: string;
  cedula?: string;
  mensaje: string;
  created_at?: string;
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"perfiles" | "pagos" | "anuncios" | "muro">("perfiles");

  // ESTADOS DE LISTADO Y PAGINACIÓN DE PROFILES
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
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

  // MÉTRICAS FINANCIERAS Y GENERALES
  const [totalJovenes, setTotalJovenes] = useState<number>(0);
  const [totalAdultos, setTotalAdultos] = useState<number>(0);
  const [totalBsRecaudado, setTotalBsRecaudado] = useState<number>(0);
  const [totalUsdRecaudado, setTotalUsdRecaudado] = useState<number>(0);
  const [totalBsValidado, setTotalBsValidado] = useState<number>(0);
  const [totalUsdValidado, setTotalUsdValidado] = useState<number>(0);
  const [totalPendientesValidacion, setTotalPendientesValidacion] = useState<number>(0);

  // MODAL DE EXPEDIENTE / EDICIÓN DE PROFILE
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalPagos, setModalPagos] = useState<Pago[]>([]);
  const [modalDocs, setModalDocs] = useState<Documento[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isEditingPerfil, setIsEditingPerfil] = useState<boolean>(false);
  const [editPerfilData, setEditPerfilData] = useState<Partial<Profile>>({});

  // ANUNCIOS Y COMUNICACIONES
  const [anuncios, setAnuncios] = useState<ComunicacionAnuncio[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState<boolean>(false);

  // MURO DE MENSAJES
  const [mensajesMuro, setMensajesMuro] = useState<MensajeMuro[]>([]);
  const [loadingMuro, setLoadingMuro] = useState<boolean>(false);

  // 1. CARGA DE PROFILES DESDE LA TABLA 'profiles'
  const loadProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    setErrorMsg(null);

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("profiles")
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

      setProfiles(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("Error al cargar perfiles:", err);
      setErrorMsg(err.message || "Error al conectar con la tabla profiles.");
    } finally {
      setLoadingProfiles(false);
    }
  }, [page, searchTerm, selectedTipoFilter, selectedRegionFilter]);

  // 2. CARGA GLOBAL DE PAGOS (SECCIÓN DEDICADA A PAGOS)
  const loadGlobalPagos = async () => {
    setLoadingPagos(true);
    try {
      const { data, error } = await supabase
        .from("pagos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTodosLosPagos(data);
      }
    } catch (e) {
      console.warn("Error al cargar lista global de pagos:", e);
    } finally {
      setLoadingPagos(false);
    }
  };

  // 3. MÉTRICAS GENERALES Y TOTALES FINANCIEROS
  const loadMetricsAndFinances = async () => {
    try {
      const { count: jovenesCount } = await supabase
        .from("profiles")
        .select("id", { count: "planned", head: true })
        .eq("tipo_participante", "joven");

      const { count: adultosCount } = await supabase
        .from("profiles")
        .select("id", { count: "planned", head: true })
        .eq("tipo_participante", "adulto");

      setTotalJovenes(jovenesCount || 0);
      setTotalAdultos(adultosCount || 0);

      const { data: pagosData, error: pagosErr } = await supabase
        .from("pagos")
        .select("monto_bs, tasa_cambio, estado");

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

          const estadoLower = (pago.estado || "").toLowerCase();

          if (estadoLower === "validado") {
            bsVal += bs;
            usdVal += usd;
          } else if (!pago.estado || estadoLower === "pendiente") {
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

  // 4. ANUNCIOS Y MURO
  const loadAnuncios = async () => {
    setLoadingAnuncios(true);
    try {
      const { data } = await supabase.from("comunicaciones_anuncios").select("*").order("created_at", { ascending: false });
      if (data) setAnuncios(data);
    } catch (e) {
      console.warn("Error al cargar comunicaciones:", e);
    } finally {
      setLoadingAnuncios(false);
    }
  };

  const loadMensajesMuro = async () => {
    setLoadingMuro(true);
    try {
      const { data } = await supabase.from("muro_mensajes").select("*").order("created_at", { ascending: false });
      if (data) setMensajesMuro(data);
    } catch (e) {
      console.warn("Error al cargar mensajes del muro:", e);
    } finally {
      setLoadingMuro(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    loadMetricsAndFinances();
    loadGlobalPagos();
    loadAnuncios();
    loadMensajesMuro();
  }, []);

  // 5. EXPEDIENTE INDIVIDUAL DEL PROFILE
  const openExpediente = async (profile: Profile) => {
    setSelectedProfile(profile);
    setEditPerfilData(profile);
    setIsEditingPerfil(false);
    setLoadingModal(true);
    setModalPagos([]);
    setModalDocs([]);

    try {
      const cleanCedula = profile.cedula?.replace(/\D/g, "").trim() || "";

      const [pagosRes, docsRes] = await Promise.all([
        supabase
          .from("pagos")
          .select("*")
          .or(`usuario_id.eq.${profile.id},cedula_participante.eq.${cleanCedula},cedula_participante.eq.${profile.cedula}`)
          .order("created_at", { ascending: true }),
        supabase
          .from("documentos_participante")
          .select("*")
          .or(`cedula_participante.eq.${cleanCedula},cedula_participante.eq.${profile.cedula}`)
      ]);

      setModalPagos(pagosRes.data || []);
      setModalDocs(docsRes.data || []);
    } catch (err) {
      console.error("Error al cargar expediente:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  // 6. GUARDAR EDICIÓN DE REGISTRO EN LA TABLA 'profiles'
  const handleSavePerfil = async () => {
    if (!selectedProfile) return;
    setActionLoading("saving_profile");

    try {
      const { error } = await supabase
        .from("profiles")
        .update(editPerfilData)
        .eq("id", selectedProfile.id);

      if (error) throw error;

      const updated = { ...selectedProfile, ...editPerfilData };
      setSelectedProfile(updated);
      setProfiles((prev) =>
        prev.map((p) => (p.id === selectedProfile.id ? updated : p))
      );

      setIsEditingPerfil(false);
      alert("¡Perfil actualizado con éxito en la tabla 'profiles'!");
    } catch (err: any) {
      alert("Error al actualizar perfil: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 7. ACTUALIZACIÓN ESTATUS PAGO
  const handleUpdateEstatusPago = async (pagoId: string, nuevoEstado: 'validado' | 'rechazado') => {
    setActionLoading(pagoId);
    try {
      const { error } = await supabase
        .from("pagos")
        .update({ estado: nuevoEstado })
        .eq("id", pagoId);

      if (error) throw error;

      setModalPagos((prev) => prev.map((p) => (p.id === pagoId ? { ...p, estado: nuevoEstado } : p)));
      setTodosLosPagos((prev) => prev.map((p) => (p.id === pagoId ? { ...p, estado: nuevoEstado } : p)));
      loadMetricsAndFinances();
    } catch (err: any) {
      alert("Error al actualizar estado del pago: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // EXPORTAR CSV
  const exportToCSV = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("apellido", { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return alert("No hay perfiles para exportar.");

      const headers = ["ID", "Cedula", "Nombre", "Apellido", "Correo", "Telefono", "Region", "Distrito", "Grupo", "Rama", "Tipo"];
      const csvRows = [
        headers.join(","),
        ...data.map((p) => [
          `"${p.id || ''}"`,
          `"${p.cedula || ''}"`,
          `"${p.nombre || ''}"`,
          `"${p.apellido || ''}"`,
          `"${p.correo || ''}"`,
          `"${p.telefono || ''}"`,
          `"${p.region || ''}"`,
          `"${p.distrito || ''}"`,
          `"${p.grupo_scout || ''}"`,
          `"${p.rama || ''}"`,
          `"${p.tipo_participante || ''}"`
        ].join(","))
      ];

      const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Perfiles_ENJ2026_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert("Error al exportar CSV: " + err.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        
        {/* ENCABEZADO */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ background: ENJ_NAVY, color: ENJ_YELLOW, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 100, letterSpacing: "0.08em" }}>
              ASOCIACIÓN DE SCOUTS DE VENEZUELA • ENJ 2026
            </span>
            <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900, color: ENJ_NAVY }}>
              Panel General de Control y Gestión
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={exportToCSV}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              <FileSpreadsheet size={16} /> Exportar Perfiles CSV
            </button>

            <button
              onClick={() => { loadProfiles(); loadMetricsAndFinances(); loadGlobalPagos(); loadAnuncios(); loadMensajesMuro(); }}
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
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Perfiles Activos</span>
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
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Pagos Pendientes</span>
              <Clock size={18} color="#D97706" />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 900, color: "#D97706" }}>{totalPendientesValidacion}</p>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Total Recaudado</span>
              <CreditCard size={18} color={ENJ_NAVY} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 900, color: ENJ_NAVY }}>
              Bs. {totalBsRecaudado.toLocaleString('es-VE')}
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

        {/* BARRA NAVEGACIÓN - SECCIÓN DE PESTAÑAS SEPARADAS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("perfiles")}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: activeTab === "perfiles" ? ENJ_NAVY : "#fff",
              color: activeTab === "perfiles" ? "#fff" : ENJ_NAVY,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <Users size={16} /> Gestión de Perfiles ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab("pagos")}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: activeTab === "pagos" ? ENJ_NAVY : "#fff",
              color: activeTab === "pagos" ? "#fff" : ENJ_NAVY,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <CreditCard size={16} /> Reporte General de Pagos
          </button>

          <button
            onClick={() => setActiveTab("muro")}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: activeTab === "muro" ? ENJ_NAVY : "#fff",
              color: activeTab === "muro" ? "#fff" : ENJ_NAVY,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <MessageCircle size={16} /> Muro de Mensajes ({mensajesMuro.length})
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
            <MessageSquare size={16} /> Comunicaciones ({anuncios.length})
          </button>
        </div>

        {/* PESTAÑA 1: GESTIÓN INDEPENDIENTE DE PROFILES */}
        {activeTab === "perfiles" && (
          <>
            <div style={{ background: "#fff", padding: 18, borderRadius: 16, marginBottom: 20, border: "1px solid rgba(0,11,111,0.08)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
                <Search size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Buscar perfil por cédula, nombre o apellido..."
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
                <h3 style={{ margin: "0 0 6px", color: ENJ_NAVY, fontSize: 18 }}>Error al obtener datos de la tabla profiles</h3>
                <p style={{ margin: "0 0 16px", color: "#9F1239", fontSize: 14, fontFamily: "monospace" }}>{errorMsg}</p>
                <button onClick={() => loadProfiles()} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Reintentar
                </button>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,11,111,0.05)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: "Inter, sans-serif" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Perfil Usuario</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Cédula</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Región / Distrito</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Rama / Grupo</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase" }}>Tipo</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase", textAlign: "right" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProfiles ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)", fontSize: 14 }}>
                          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px", display: "block" }} />
                          Cargando perfiles desde la tabla profiles...
                        </td>
                      </tr>
                    ) : profiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)", fontSize: 14 }}>
                          No se encontraron registros en la tabla profiles.
                        </td>
                      </tr>
                    ) : (
                      profiles.map((p) => (
                        <tr key={p.id || p.cedula} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 14 }}>{p.nombre} {p.apellido}</div>
                            <div style={{ fontSize: 12, color: "rgba(0,11,111,0.5)" }}>{p.correo || "Sin correo"}</div>
                          </td>
                          <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>{p.cedula || "N/A"}</td>
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
                              <Eye size={14} /> Expediente
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
                  Página {page + 1} de {totalPages} ({totalCount} perfiles)
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

        {/* PESTAÑA 2: SECCIÓN DEDICADA INDEPENDIENTE PARA PAGOS */}
        {activeTab === "pagos" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={20} color={ENJ_MAGENTA} /> Control y Validación de Pagos Reportados
            </h3>

            {loadingPagos ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)" }}>
                <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px", display: "block" }} />
                Cargando registros de pagos...
              </div>
            ) : todosLosPagos.length === 0 ? (
              <p style={{ color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No se registran pagos en la base de datos.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Cédula Participante</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Concepto / Cuota</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Referencia</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Monto</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Estado</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textAlign: "right" }}>Validación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todosLosPagos.map((pago) => {
                      const estatus = (pago.estado || "pendiente").toLowerCase();
                      const isValidado = estatus === "validado";
                      const isRechazado = estatus === "rechazado";

                      return (
                        <tr key={pago.id || pago.referencia} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 700, color: ENJ_NAVY, fontSize: 13 }}>{pago.cedula_participante}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13 }}>{pago.concepto || pago.numero_cuota}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace" }}>{pago.referencia}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: ENJ_MAGENTA }}>Bs. {Number(pago.monto_bs).toLocaleString('es-VE')}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: 100,
                              background: isValidado ? "#DCFCE7" : isRechazado ? "#FEE2E2" : "#FEF3C7",
                              color: isValidado ? "#166534" : isRechazado ? "#991B1B" : "#92400E",
                              textTransform: "capitalize"
                            }}>
                              {estatus}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            {pago.id && (
                              <div style={{ display: "inline-flex", gap: 6 }}>
                                <button
                                  disabled={actionLoading === pago.id || isValidado}
                                  onClick={() => handleUpdateEstatusPago(pago.id!, "validado")}
                                  style={{ background: isValidado ? "#E2E8F0" : "#16A34A", color: isValidado ? "#94A3B8" : "#fff", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: isValidado ? "not-allowed" : "pointer" }}
                                >
                                  Validar
                                </button>
                                <button
                                  disabled={actionLoading === pago.id || isRechazado}
                                  onClick={() => handleUpdateEstatusPago(pago.id!, "rechazado")}
                                  style={{ background: isRechazado ? "#E2E8F0" : "#DC2626", color: isRechazado ? "#94A3B8" : "#fff", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: isRechazado ? "not-allowed" : "pointer" }}
                                >
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: MURO */}
        {activeTab === "muro" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageCircle size={20} color={ENJ_MAGENTA} /> Moderación del Muro de Mensajes
            </h3>
            {loadingMuro ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)" }}>Cargando mensajes...</div>
            ) : mensajesMuro.length === 0 ? (
              <p style={{ color: "rgba(0,11,111,0.5)" }}>No hay mensajes publicados.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {mensajesMuro.map((item) => (
                  <div key={item.id} style={{ background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 15, color: ENJ_NAVY }}>{item.nombre || item.autor || "Anónimo"}</strong>
                      <p style={{ margin: "4px 0 0", fontSize: 14, color: "#333" }}>"{item.mensaje}"</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("¿Eliminar este mensaje?")) return;
                        await supabase.from("muro_mensajes").delete().eq("id", item.id);
                        setMensajesMuro((prev) => prev.filter((m) => m.id !== item.id));
                      }}
                      style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: ANUNCIOS */}
        {activeTab === "anuncios" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={20} color={ENJ_MAGENTA} /> Comunicaciones Oficiales
            </h3>
            {loadingAnuncios ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)" }}>Cargando anuncios...</div>
            ) : anuncios.length === 0 ? (
              <p style={{ color: "rgba(0,11,111,0.5)" }}>No hay comunicados publicados.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {anuncios.map((item) => (
                  <div key={item.id} style={{ background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 15, color: ENJ_NAVY }}>{item.titulo || "Comunicado"}</strong>
                      <p style={{ margin: "4px 0 0", fontSize: 14, color: "#333" }}>{item.contenido || item.mensaje}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("¿Eliminar comunicado?")) return;
                        await supabase.from("comunicaciones_anuncios").delete().eq("id", item.id);
                        setAnuncios((prev) => prev.filter((a) => a.id !== item.id));
                      }}
                      style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL DE EDICIÓN Y EXPEDIENTE VINCULADO A LA TABLA PROFILES */}
        {selectedProfile && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 880, maxHeight: "90vh", overflowY: "auto", position: "relative", padding: 32 }}>
              
              <button
                onClick={() => setSelectedProfile(null)}
                style={{ position: "absolute", right: 20, top: 20, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ENJ_NAVY }}
              >
                <X size={18} />
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid rgba(0,11,111,0.1)", paddingBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: ENJ_NAVY, color: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 }}>
                    {selectedProfile.nombre?.charAt(0)}{selectedProfile.apellido?.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
                      {selectedProfile.nombre} {selectedProfile.apellido}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>
                      ID: {selectedProfile.id} | Cédula: {selectedProfile.cedula}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingPerfil(!isEditingPerfil)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: isEditingPerfil ? ENJ_YELLOW : ENJ_NAVY, color: isEditingPerfil ? ENJ_NAVY : "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                >
                  <Edit3 size={16} /> {isEditingPerfil ? "Cancelar Edición" : "Editar Perfil (profiles)"}
                </button>
              </div>

              {loadingModal ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.6)" }}>
                  <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
                  Cargando información...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  
                  {isEditingPerfil ? (
                    <div style={{ background: "#FFFBEB", border: `1.5px solid ${ENJ_YELLOW}`, padding: 20, borderRadius: 14 }}>
                      <h4 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 15, fontWeight: 800 }}>Modificar Campos en `profiles`</h4>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Nombre</label>
                          <input type="text" value={editPerfilData.nombre || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, nombre: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Apellido</label>
                          <input type="text" value={editPerfilData.apellido || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, apellido: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Correo Electrónico</label>
                          <input type="email" value={editPerfilData.correo || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, correo: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Teléfono</label>
                          <input type="text" value={editPerfilData.telefono || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, telefono: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Región</label>
                          <input type="text" value={editPerfilData.region || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, region: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Distrito</label>
                          <input type="text" value={editPerfilData.distrito || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, distrito: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Grupo Scout</label>
                          <input type="text" value={editPerfilData.grupo_scout || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, grupo_scout: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Rama / Unidad</label>
                          <input type="text" value={editPerfilData.rama || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, rama: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                        <button onClick={() => setIsEditingPerfil(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", background: "#fff", color: ENJ_NAVY, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                        <button disabled={actionLoading === "saving_profile"} onClick={handleSavePerfil} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 8, border: "none", background: "#16A34A", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                          <Save size={15} /> Actualizar Perfil
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: "#F8FAFF", padding: 18, borderRadius: 14, border: "1px solid rgba(0,11,111,0.08)" }}>
                      <h4 style={{ margin: "0 0 12px", color: ENJ_NAVY, fontSize: 14, textTransform: "uppercase" }}>Datos del Perfil</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontSize: 13 }}>
                        <div><strong>Correo:</strong> {selectedProfile.correo || "N/A"}</div>
                        <div><strong>Teléfono:</strong> {selectedProfile.telefono || "N/A"}</div>
                        <div><strong>Región:</strong> {selectedProfile.region || "N/A"}</div>
                        <div><strong>Distrito:</strong> {selectedProfile.distrito || "N/A"}</div>
                        <div><strong>Grupo Scout:</strong> {selectedProfile.grupo_scout || "N/A"}</div>
                        <div><strong>Rama / Unidad:</strong> {selectedProfile.rama || "N/A"}</div>
                        <div><strong>Tipo Sangre:</strong> {selectedProfile.tipo_sangre || "N/A"}</div>
                        <div><strong>Alergias:</strong> {selectedProfile.alergias || "Ninguna"}</div>
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTOS Y HISTORIAL DE PAGOS ASOCIADOS */}
                  <div>
                    <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Pagos Registrados</h3>
                    {modalPagos.length === 0 ? (
                      <p style={{ fontSize: 13, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No registra pagos adjuntos a este perfil.</p>
                    ) : (
                      modalPagos.map((pago) => (
                        <div key={pago.id || pago.referencia} style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.12)", borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <strong>{pago.concepto || pago.numero_cuota}</strong> - Ref: {pago.referencia}
                            <div style={{ fontSize: 12, color: ENJ_MAGENTA, fontWeight: 700 }}>Bs. {pago.monto_bs}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 100, background: pago.estado === 'validado' ? '#DCFCE7' : '#FEF3C7', color: pago.estado === 'validado' ? '#166534' : '#92400E' }}>
                            {pago.estado || 'pendiente'}
                          </span>
                        </div>
                      ))
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