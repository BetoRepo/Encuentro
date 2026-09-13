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
  AlertCircle,
  Building,
  Clock,
  FileSpreadsheet,
  MessageSquare,
  Trash2,
  ShieldCheck,
  Edit3,
  Save,
  MessageCircle,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
  Phone,
  Mail,
  ShieldAlert
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
  celular?: string;
  phone?: string;
  region?: string;
  distrito?: string;
  grupo_scout?: string;
  grupo?: string;
  rama?: string;
  unidad?: string;
  tipo_participante?: string;
  talla_uniforme?: string;
  tipo_sangre?: string;
  grupo_sanguineo?: string;
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
  profile?: Profile | null;
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

export const getProfileFields = (p: Partial<Profile> | null | undefined) => {
  if (!p) return {
    nombre: "", apellido: "", cedula: "N/A", correo: "N/A",
    telefono: "N/A", region: "N/A", distrito: "N/A",
    grupo_scout: "N/A", rama: "N/A", tipo_participante: "joven",
    tipo_sangre: "N/A", alergias: "Ninguna", enfermedades: "Ninguna",
    medicamentos: "Ninguno", contacto_emergencia: "N/A", talla_uniforme: "N/A"
  };
  const rawRegion = (p as any).region || (p as any).region_scout || "";
  const rawDistrito = (p as any).distrito || (p as any).distrito_scout || "";

  let region = rawRegion;
  let distrito = rawDistrito;

  if (rawRegion.includes("-") && (!rawDistrito || rawDistrito === "N/A")) {
    const parts = rawRegion.split("-");
    region = parts[0].trim();
    distrito = parts.slice(1).join("-").trim();
  }

  return {
    nombre: p.nombre || (p as any).first_name || "",
    apellido: p.apellido || (p as any).last_name || "",
    cedula: p.cedula || (p as any).dni || "N/A",
    correo: p.correo || (p as any).email || "N/A",
    telefono: p.telefono || (p as any).celular || (p as any).phone || "N/A",
    region: region || "N/A",
    distrito: distrito || "N/A",
    grupo_scout: p.grupo_scout || (p as any).grupo || "N/A",
    rama: p.rama || (p as any).unidad || (p as any).rama_scout || "N/A",
    tipo_participante: p.tipo_participante || (p as any).tipo || "joven",
    tipo_sangre: p.tipo_sangre || (p as any).grupo_sanguineo || "N/A",
    alergias: p.alergias || "Ninguna",
    enfermedades: p.enfermedades || "Ninguna",
    medicamentos: p.medicamentos || "Ninguno",
    contacto_emergencia: p.contacto_emergencia || "N/A",
    talla_uniforme: p.talla_uniforme || "N/A"
  };
};

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"perfiles" | "pagos" | "anuncios" | "muro">("perfiles");

  // ESTADOS DE LISTADO Y PAGINACIÓN DE PROFILES
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  // FILTROS DE BÚSQUEDA PERFILES
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");

  // ESTADOS Y FILTROS DE PAGOS
  const [todosLosPagos, setTodosLosPagos] = useState<Pago[]>([]);
  const [loadingPagos, setLoadingPagos] = useState<boolean>(false);
  const [pagoSearchTerm, setPagoSearchTerm] = useState<string>("");
  const [pagoEstadoFilter, setPagoEstadoFilter] = useState<string>("");

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

  // ANUNCIOS Y MURO
  const [anuncios, setAnuncios] = useState<ComunicacionAnuncio[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState<boolean>(false);

  const [mensajesMuro, setMensajesMuro] = useState<MensajeMuro[]>([]);
  const [loadingMuro, setLoadingMuro] = useState<boolean>(false);

  // 1. CARGA DE PROFILES DESDE SUPABASE
  const loadProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    setErrorMsg(null);

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" });

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

  // 2. CARGA GLOBAL DE PAGOS CON PARTICIPANTE ASOCIADO
  const loadGlobalPagos = async () => {
    setLoadingPagos(true);
    try {
      const { data: pagosData, error: pagosErr } = await supabase
        .from("pagos")
        .select("*")
        .order("created_at", { ascending: false });

      if (pagosErr) throw pagosErr;

      if (pagosData && pagosData.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*");

        const profilesMapByCedula: Record<string, Profile> = {};
        const profilesMapById: Record<string, Profile> = {};

        if (profilesData) {
          profilesData.forEach((prof) => {
            if (prof.cedula) {
              const clean = prof.cedula.replace(/\D/g, "").trim();
              profilesMapByCedula[clean] = prof;
              profilesMapByCedula[prof.cedula.trim()] = prof;
            }
            if (prof.id) profilesMapById[prof.id] = prof;
          });
        }

        const mergedPagos = pagosData.map((pago) => {
          const cleanCedula = pago.cedula_participante?.replace(/\D/g, "").trim() || "";
          const profile =
            profilesMapByCedula[pago.cedula_participante?.trim()] ||
            profilesMapByCedula[cleanCedula] ||
            (pago.usuario_id ? profilesMapById[pago.usuario_id] : null) ||
            null;

          return { ...pago, profile };
        });

        setTodosLosPagos(mergedPagos);
      } else {
        setTodosLosPagos([]);
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
        .select("id", { count: "exact", head: true })
        .eq("tipo_participante", "joven");

      const { count: adultosCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
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

  // 6. GUARDAR EDICIÓN DE PROFILE EN LA BASE DE DATOS
  const handleSavePerfil = async () => {
    if (!selectedProfile) return;
    setActionLoading("saving_profile");

    try {
      const { error } = await supabase
        .from("profiles")
        .update(editPerfilData)
        .eq("id", selectedProfile.id);

      if (error) throw error;

      const updated = { ...selectedProfile, ...editPerfilData } as Profile;
      setSelectedProfile(updated);
      setProfiles((prev) =>
        prev.map((p) => (p.id === selectedProfile.id ? updated : p))
      );

      setIsEditingPerfil(false);
      alert("¡Perfil actualizado con éxito en la base de datos!");
    } catch (err: any) {
      alert("Error al actualizar perfil: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 7. ACTUALIZACIÓN DE ESTATUS DE PAGO (VALIDAR / RECHAZAR / PENDIENTE)
  const handleUpdateEstatusPago = async (pagoId: string, nuevoEstado: 'validado' | 'rechazado' | 'pendiente') => {
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

  // EXPORTAR CSV DE PERFILES
  const exportToCSV = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("apellido", { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return alert("No hay perfiles para exportar.");

      const headers = [
        "ID", "Cedula", "Nombre", "Apellido", "Correo", "Telefono", 
        "Region", "Distrito", "Grupo", "Rama", "Tipo", "Talla", 
        "Tipo Sangre", "Alergias", "Contacto Emergencia"
      ];

      const csvRows = [
        headers.join(","),
        ...data.map((p) => {
          const f = getProfileFields(p);
          return [
            `"${p.id || ''}"`,
            `"${f.cedula}"`,
            `"${f.nombre}"`,
            `"${f.apellido}"`,
            `"${f.correo}"`,
            `"${f.telefono}"`,
            `"${f.region}"`,
            `"${f.distrito}"`,
            `"${f.grupo_scout}"`,
            `"${f.rama}"`,
            `"${f.tipo_participante}"`,
            `"${f.talla_uniforme}"`,
            `"${f.tipo_sangre}"`,
            `"${f.alergias.replace(/"/g, '""')}"`,
            `"${f.contacto_emergencia.replace(/"/g, '""')}"`
          ].join(",");
        })
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

  // FILTRADO LOCAL EN TABLA DE PAGOS
  const pagosFiltrados = todosLosPagos.filter((pago) => {
    const f = getProfileFields(pago.profile);
    const search = pagoSearchTerm.toLowerCase().trim();
    const matchesSearch = 
      !search ||
      pago.referencia?.toLowerCase().includes(search) ||
      pago.cedula_participante?.toLowerCase().includes(search) ||
      f.nombre.toLowerCase().includes(search) ||
      f.apellido.toLowerCase().includes(search) ||
      pago.concepto?.toLowerCase().includes(search);

    const matchesEstado = 
      !pagoEstadoFilter || 
      (pago.estado || "pendiente").toLowerCase() === pagoEstadoFilter.toLowerCase();

    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        
        {/* ENCABEZADO OFICIAL SCOUT */}
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

        {/* NAVEGACIÓN PRINCIPAL */}
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
            <CreditCard size={16} /> Control de Pagos  ({todosLosPagos.length})
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
                      profiles.map((p) => {
                        const fields = getProfileFields(p);
                        return (
                          <tr key={p.id || p.cedula} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 14 }}>{fields.nombre} {fields.apellido}</div>
                              <div style={{ fontSize: 12, color: "rgba(0,11,111,0.5)" }}>{fields.correo}</div>
                            </td>
                            <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>{fields.cedula}</td>
                            <td style={{ padding: "14px 18px", fontSize: 13, color: "rgba(0,11,111,0.8)" }}>
                              <div>{fields.region}</div>
                              <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>{fields.distrito}</div>
                            </td>
                            <td style={{ padding: "14px 18px", fontSize: 13, color: "rgba(0,11,111,0.8)" }}>
                              <div><strong>{fields.rama}</strong></div>
                              <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>{fields.grupo_scout}</div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <span style={{ 
                                fontSize: 11, 
                                fontWeight: 800, 
                                padding: "4px 10px", 
                                borderRadius: 100, 
                                textTransform: "uppercase",
                                background: fields.tipo_participante === "joven" ? "rgba(215,0,126,0.1)" : "rgba(0,11,111,0.1)",
                                color: fields.tipo_participante === "joven" ? ENJ_MAGENTA : ENJ_NAVY
                              }}>
                                {fields.tipo_participante}
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
                        );
                      })
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

        {/* PESTAÑA 2: CONTROL Y VALIDACIÓN DE PAGOS */}
        {activeTab === "pagos" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ margin: 0, color: ENJ_NAVY, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <CreditCard size={20} color={ENJ_MAGENTA} /> Control y Validación de Pagos Reportados
              </h3>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", minWidth: 240 }}>
                  <Search size={15} color="rgba(0,11,111,0.4)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Buscar ref, cédula o participante..."
                    value={pagoSearchTerm}
                    onChange={(e) => setPagoSearchTerm(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Filter size={15} color={ENJ_NAVY} />
                  <select
                    value={pagoEstadoFilter}
                    onChange={(e) => setPagoEstadoFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, color: ENJ_NAVY, outline: "none", background: "#FAFBFF" }}
                  >
                    <option value="">Todos los Estatus</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="validado">Validados</option>
                    <option value="rechazado">Rechazados</option>
                  </select>
                </div>
              </div>
            </div>

            {loadingPagos ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)" }}>
                <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px", display: "block" }} />
                Cargando registros de pagos...
              </div>
            ) : pagosFiltrados.length === 0 ? (
              <p style={{ color: "rgba(0,11,111,0.5)", fontStyle: "italic", textAlign: "center", padding: 30 }}>
                No se encontraron reportes de pago con los filtros seleccionados.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Participante</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Grupo / Región</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Concepto / Fecha</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Referencia</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Monto (Bs.)</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Estado</th>
                      <th style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textAlign: "right" }}>Acción de Validación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFiltrados.map((pago) => {
                      const estatus = (pago.estado || "pendiente").toLowerCase();
                      const isValidado = estatus === "validado";
                      const isRechazado = estatus === "rechazado";
                      const pFields = getProfileFields(pago.profile);

                      return (
                        <tr key={pago.id || pago.referencia} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                              {pago.profile ? `${pFields.nombre} ${pFields.apellido}` : "Participante No Registrado"}
                              {pago.profile && (
                                <button
                                  onClick={() => openExpediente(pago.profile!)}
                                  title="Ver expediente del participante"
                                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: ENJ_NAVY }}
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(0,11,111,0.6)" }}>
                              C.I: {pago.cedula_participante} {pFields.correo !== "N/A" ? `• ${pFields.correo}` : ""}
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: ENJ_NAVY }}>
                            <div><strong>{pFields.grupo_scout}</strong></div>
                            <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>{pFields.region}</div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13 }}>
                            <div>{pago.concepto || `Cuota #${pago.numero_cuota}`}</div>
                            <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-VE") : "S/F"}</div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: ENJ_NAVY }}>
                            {pago.referencia}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: ENJ_MAGENTA }}>
                            Bs. {Number(pago.monto_bs).toLocaleString('es-VE')}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "3px 10px",
                              borderRadius: 100,
                              background: isValidado ? "#DCFCE7" : isRechazado ? "#FEE2E2" : "#FEF3C7",
                              color: isValidado ? "#166534" : isRechazado ? "#991B1B" : "#92400E",
                              textTransform: "capitalize",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}>
                              {isValidado && <CheckCircle2 size={12} />}
                              {isRechazado && <XCircle size={12} />}
                              {!isValidado && !isRechazado && <Clock size={12} />}
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

        {/* PESTAÑA 3: MURO DE MENSAJES */}
        {activeTab === "muro" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageCircle size={20} color={ENJ_MAGENTA} /> Moderación del Muro de Mensajes
            </h3>
            {loadingMuro ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)" }}>Cargando mensajes...</div>
            ) : mensajesMuro.length === 0 ? (
              <p style={{ color: "rgba(0,11,111,0.5)" }}>No hay mensajes publicados en el muro.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {mensajesMuro.map((item) => (
                  <div key={item.id} style={{ background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 15, color: ENJ_NAVY }}>{item.nombre || item.autor || "Anónimo"}</strong>
                      {item.cedula && <span style={{ fontSize: 12, color: "rgba(0,11,111,0.5)", marginLeft: 8 }}>({item.cedula})</span>}
                      <p style={{ margin: "4px 0 0", fontSize: 14, color: "#333" }}>"{item.mensaje}"</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("¿Eliminar este mensaje del muro?")) return;
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

        {/* PESTAÑA 4: ANUNCIOS Y COMUNICACIONES */}
        {activeTab === "anuncios" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={20} color={ENJ_MAGENTA} /> Comunicaciones Oficiales
            </h3>
            {loadingAnuncios ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.5)" }}>Cargando anuncios...</div>
            ) : anuncios.length === 0 ? (
              <p style={{ color: "rgba(0,11,111,0.5)" }}>No hay comunicados registrados.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {anuncios.map((item) => (
                  <div key={item.id} style={{ background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 15, color: ENJ_NAVY }}>{item.titulo || "Comunicado"}</strong>
                      <p style={{ margin: "4px 0 0", fontSize: 14, color: "#333" }}>{item.contenido || item.mensaje}</p>
                      {item.autor && <span style={{ fontSize: 11, color: "rgba(0,11,111,0.5)", marginTop: 4, display: "block" }}>Emitido por: {item.autor}</span>}
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("¿Eliminar este comunicado oficial?")) return;
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

        {/* MODAL EXPEDIENTE COMPLETO / EDICIÓN PERFIL */}
        {selectedProfile && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 880, maxHeight: "90vh", overflowY: "auto", position: "relative", padding: 32 }}>
              
              <button
                onClick={() => setSelectedProfile(null)}
                style={{ position: "absolute", right: 20, top: 20, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ENJ_NAVY }}
              >
                <X size={18} />
              </button>

              {(() => {
                const modalFields = getProfileFields(selectedProfile);
                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid rgba(0,11,111,0.1)", paddingBottom: 20, flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 60, height: 60, borderRadius: "50%", background: ENJ_NAVY, color: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 }}>
                          {modalFields.nombre.charAt(0)}{modalFields.apellido.charAt(0)}
                        </div>
                        <div>
                          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
                            {modalFields.nombre} {modalFields.apellido}
                          </h2>
                          <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>
                            Cédula: {modalFields.cedula} | Tipo: <span style={{ textTransform: "capitalize", color: ENJ_MAGENTA }}>{modalFields.tipo_participante}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditingPerfil(!isEditingPerfil)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: isEditingPerfil ? ENJ_YELLOW : ENJ_NAVY, color: isEditingPerfil ? ENJ_NAVY : "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                      >
                        <Edit3 size={16} /> {isEditingPerfil ? "Cancelar Edición" : "Editar Perfil"}
                      </button>
                    </div>

                    {loadingModal ? (
                      <div style={{ padding: 40, textAlign: "center", color: "rgba(0,11,111,0.6)" }}>
                        <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
                        Cargando expediente completo...
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        
                        {/* MODO FORMULARIO DE EDICIÓN DE PERFIL */}
                        {isEditingPerfil ? (
                          <div style={{ background: "#FFFBEB", border: `1.5px solid ${ENJ_YELLOW}`, padding: 20, borderRadius: 14 }}>
                            <h4 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 15, fontWeight: 800 }}>Modificar Campos en la Base de Datos (`profiles`)</h4>

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
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Teléfono / Celular</label>
                                <input type="text" value={editPerfilData.telefono || editPerfilData.celular || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, telefono: e.target.value, celular: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                              </div>

                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Región Scout</label>
                                <input type="text" value={editPerfilData.region || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, region: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                              </div>

                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Distrito Scout</label>
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

                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Tipo Participante</label>
                                <select value={editPerfilData.tipo_participante || "joven"} onChange={(e) => setEditPerfilData({ ...editPerfilData, tipo_participante: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box", background: "#fff" }}>
                                  <option value="joven">Joven</option>
                                  <option value="adulto">Adulto</option>
                                </select>
                              </div>

                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Talla Uniforme</label>
                                <input type="text" value={editPerfilData.talla_uniforme || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, talla_uniforme: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                              </div>

                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Grupo Sanguíneo</label>
                                <input type="text" value={editPerfilData.tipo_sangre || editPerfilData.grupo_sanguineo || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, tipo_sangre: e.target.value, grupo_sanguineo: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                              </div>

                              <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Contacto Emergencia</label>
                                <input type="text" value={editPerfilData.contacto_emergencia || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, contacto_emergencia: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                              </div>
                            </div>

                            <div style={{ marginTop: 14 }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, marginBottom: 4 }}>Alergias / Condiciones Médicas</label>
                              <textarea rows={2} value={editPerfilData.alergias || ""} onChange={(e) => setEditPerfilData({ ...editPerfilData, alergias: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, boxSizing: "border-box" }} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                              <button onClick={() => setIsEditingPerfil(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", background: "#fff", color: ENJ_NAVY, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                              <button disabled={actionLoading === "saving_profile"} onClick={handleSavePerfil} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 8, border: "none", background: "#16A34A", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                                <Save size={15} /> Guardar Cambios en BD
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* MODO LECTURA DE VISTA GENERAL */
                          <div style={{ background: "#F8FAFF", padding: 18, borderRadius: 14, border: "1px solid rgba(0,11,111,0.08)" }}>
                            <h4 style={{ margin: "0 0 12px", color: ENJ_NAVY, fontSize: 14, textTransform: "uppercase", fontWeight: 800 }}>Información Institucional y Médica</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontSize: 13 }}>
                              <div><Mail size={13} style={{ display: "inline", marginRight: 4 }} /><strong>Correo:</strong> {modalFields.correo}</div>
                              <div><Phone size={13} style={{ display: "inline", marginRight: 4 }} /><strong>Teléfono:</strong> {modalFields.telefono}</div>
                              <div><strong>Región:</strong> {modalFields.region}</div>
                              <div><strong>Distrito:</strong> {modalFields.distrito}</div>
                              <div><strong>Grupo Scout:</strong> {modalFields.grupo_scout}</div>
                              <div><strong>Rama / Unidad:</strong> {modalFields.rama}</div>
                              <div><strong>Talla Uniforme:</strong> {modalFields.talla_uniforme}</div>
                              <div><strong>Tipo Sangre:</strong> {modalFields.tipo_sangre}</div>
                              <div><ShieldAlert size={13} style={{ display: "inline", marginRight: 4 }} /><strong>Contacto Emergencia:</strong> {modalFields.contacto_emergencia}</div>
                              <div style={{ gridColumn: "1 / -1" }}><strong>Alergias / Cuidados:</strong> {modalFields.alergias}</div>
                            </div>
                          </div>
                        )}

                        {/* SECCIÓN DE PAGOS DEL PARTICIPANTE */}
                        <div>
                          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Pagos Registrados por el Participante</h3>
                          {modalPagos.length === 0 ? (
                            <p style={{ fontSize: 13, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No registra pagos reportados adjuntos a este perfil.</p>
                          ) : (
                            modalPagos.map((pago) => {
                              const est = (pago.estado || "pendiente").toLowerCase();
                              return (
                                <div key={pago.id || pago.referencia} style={{ background: "#fff", border: "1px solid rgba(0,11,111,0.12)", borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                                  <div>
                                    <strong style={{ fontSize: 14, color: ENJ_NAVY }}>{pago.concepto || `Cuota #${pago.numero_cuota}`}</strong> - Ref: <span style={{ fontFamily: "monospace" }}>{pago.referencia}</span>
                                    <div style={{ fontSize: 12, color: ENJ_MAGENTA, fontWeight: 800, marginTop: 2 }}>Bs. {Number(pago.monto_bs).toLocaleString("es-VE")}</div>
                                  </div>
                                  
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 100, background: est === 'validado' ? '#DCFCE7' : est === 'rechazado' ? '#FEE2E2' : '#FEF3C7', color: est === 'validado' ? '#166534' : est === 'rechazado' ? '#991B1B' : '#92400E' }}>
                                      {est}
                                    </span>
                                    {pago.id && (
                                      <div style={{ display: "flex", gap: 4 }}>
                                        <button
                                          disabled={actionLoading === pago.id || est === "validado"}
                                          onClick={() => handleUpdateEstatusPago(pago.id!, "validado")}
                                          style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: est === "validado" ? 0.5 : 1 }}
                                        >
                                          Validar
                                        </button>
                                        <button
                                          disabled={actionLoading === pago.id || est === "rechazado"}
                                          onClick={() => handleUpdateEstatusPago(pago.id!, "rechazado")}
                                          style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: est === "rechazado" ? 0.5 : 1 }}
                                        >
                                          Rechazar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* SECCIÓN DE DOCUMENTOS ADJUNTOS */}
                        <div>
                          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Documentos Cargados</h3>
                          {modalDocs.length === 0 ? (
                            <p style={{ fontSize: 13, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>No registra permisos ni fichas adjuntas.</p>
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                              {modalDocs.map((doc) => (
                                <div key={doc.id || doc.nombre_archivo} style={{ background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", padding: 12, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                                  <FileText size={20} color={ENJ_NAVY} />
                                  <div style={{ overflow: "hidden" }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                      {doc.tipo_documento || doc.nombre_archivo}
                                    </div>
                                    {(doc.url_archivo || doc.archivo_base64) && (
                                      <a
                                        href={doc.url_archivo || doc.archivo_base64}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: 11, color: ENJ_MAGENTA, fontWeight: 700, textDecoration: "none" }}
                                      >
                                        Ver Documento
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
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