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

// ================= INTERFACES =================
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
  rol_evento?: string;
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
  autor?: string;
  autor_id?: string;
  mensaje: string;
  fecha?: string;
}

// ================= UTILS =================
export const getProfileFields = (p: Partial<Profile> | null | undefined) => {
  if (!p) return {
    nombre: "", apellido: "", cedula: "N/A", correo: "N/A",
    telefono: "N/A", region: "N/A", distrito: "N/A",
    grupo_scout: "N/A", rama: "N/A", tipo_participante: "joven",
    tipo_sangre: "N/A", alergias: "Ninguna", enfermedades: "Ninguna",
    medicamentos: "Ninguno", contacto_emergencia: "N/A", talla_uniforme: "N/A"
  };
  
  const rawRegion = (p as any).region || (p as any).selected_region || "";
  const rawDistrito = (p as any).distrito || (p as any).selected_district || "";

  let region = rawRegion;
  let distrito = rawDistrito;

  if (rawRegion.includes("-") && (!rawDistrito || rawDistrito === "N/A")) {
    const parts = rawRegion.split("-");
    region = parts[0].trim();
    distrito = parts.slice(1).join("-").trim();
  }

  let tipoPart = p.tipo_participante || (p as any).rol_evento || "joven";
  if (tipoPart.toLowerCase().includes("adulto") || tipoPart.toLowerCase().includes("staff")) {
    tipoPart = "adulto";
  } else {
    tipoPart = "joven";
  }

  return {
    nombre: p.nombre || "",
    apellido: p.apellido || "",
    cedula: p.cedula || "N/A",
    correo: p.correo || "N/A",
    telefono: p.telefono || p.celular || p.phone || "N/A",
    region: region || "N/A",
    distrito: distrito || "N/A",
    grupo_scout: p.grupo_scout || p.grupo || "N/A",
    rama: p.rama || (p as any).rama_scout || p.unidad || "N/A",
    tipo_participante: tipoPart,
    tipo_sangre: p.tipo_sangre || p.grupo_sanguineo || "N/A",
    alergias: p.alergias || "Ninguna",
    enfermedades: p.enfermedades || "Ninguna",
    medicamentos: p.medicamentos || "Ninguno",
    contacto_emergencia: p.contacto_emergencia || "N/A",
    talla_uniforme: p.talla_uniforme || "N/A"
  };
};

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"perfiles" | "pagos" | "anuncios" | "muro">("perfiles");

  // ESTADOS PROFILES
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");

  // ESTADOS PAGOS
  const [todosLosPagos, setTodosLosPagos] = useState<Pago[]>([]);
  const [loadingPagos, setLoadingPagos] = useState<boolean>(false);
  const [pagoSearchTerm, setPagoSearchTerm] = useState<string>("");
  const [pagoEstadoFilter, setPagoEstadoFilter] = useState<string>("");

  // MÉTRICAS
  const [totalJovenes, setTotalJovenes] = useState<number>(0);
  const [totalAdultos, setTotalAdultos] = useState<number>(0);
  const [totalBsRecaudado, setTotalBsRecaudado] = useState<number>(0);
  const [totalUsdRecaudado, setTotalUsdRecaudado] = useState<number>(0);
  const [totalBsValidado, setTotalBsValidado] = useState<number>(0);
  const [totalUsdValidado, setTotalUsdValidado] = useState<number>(0);
  const [totalPendientesValidacion, setTotalPendientesValidacion] = useState<number>(0);
  const [tasaBcvActual, setTasaBcvActual] = useState<number>(36.5);

  // MODAL EXPEDIENTE
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalPagos, setModalPagos] = useState<Pago[]>([]);
  const [modalDocs, setModalDocs] = useState<Documento[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditingPerfil, setIsEditingPerfil] = useState<boolean>(false);
  const [editPerfilData, setEditPerfilData] = useState<Partial<Profile>>({});

  // ANUNCIOS Y MURO
  const [anuncios, setAnuncios] = useState<ComunicacionAnuncio[]>([]);
  const [mensajesMuro, setMensajesMuro] = useState<MensajeMuro[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState<boolean>(false);
  const [loadingMuro, setLoadingMuro] = useState<boolean>(false);

  // 1. CARGAR PERFILES (PAGINADO OPTIMIZADO)
  const loadProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    setErrorMsg(null);
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from("profiles").select("*", { count: "exact" });

      if (searchTerm.trim() !== "") {
        query = query.or(`cedula.ilike.%${searchTerm.trim()}%,nombre.ilike.%${searchTerm.trim()}%,apellido.ilike.%${searchTerm.trim()}%`);
      }

      const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
      
      if (error) throw error;

      let filteredData = data || [];
      if (selectedTipoFilter) {
          filteredData = filteredData.filter(p => getProfileFields(p).tipo_participante === selectedTipoFilter);
      }
      if (selectedRegionFilter) {
          filteredData = filteredData.filter(p => getProfileFields(p).region.toLowerCase().includes(selectedRegionFilter.toLowerCase()));
      }

      setProfiles(filteredData);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("🔥 Error en loadProfiles:", err);
      setErrorMsg(err.message || "Error al cargar perfiles por timeout.");
    } finally {
      setLoadingProfiles(false);
    }
  }, [page, searchTerm, selectedTipoFilter, selectedRegionFilter]);

  // 2. CARGAR PAGOS GLOBALES (SOLO PERFILES CON PAGOS)
  const loadGlobalPagos = async () => {
    setLoadingPagos(true);
    try {
      const { data: pagosData, error: pagosErr } = await supabase.from("pagos").select("*").order("created_at", { ascending: false });
      if (pagosErr) throw pagosErr;

      if (pagosData && pagosData.length > 0) {
        // Extraer cédulas únicas asociadas a pagos para consulta puntual y evitar timeout
        const cedulasUnicas = Array.from(new Set(pagosData.map(p => p.cedula_participante?.trim()).filter(Boolean)));
        
        const { data: profilesData, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .in("cedula", cedulasUnicas);

        if (profErr) console.warn("Error al buscar perfiles para pagos:", profErr.message);

        const profilesMap: Record<string, Profile> = {};
        if (profilesData) {
          profilesData.forEach((prof) => {
            if (prof.cedula) profilesMap[prof.cedula.trim()] = prof;
            if (prof.id) profilesMap[prof.id] = prof;
          });
        }

        const mergedPagos = pagosData.map((pago) => {
          const profile = profilesMap[pago.cedula_participante?.trim()] || (pago.usuario_id ? profilesMap[pago.usuario_id] : null) || null;
          return { ...pago, profile };
        });
        setTodosLosPagos(mergedPagos);
      } else {
        setTodosLosPagos([]);
      }
    } catch (e: any) {
      console.warn("Error general en pagos:", e);
    } finally {
      setLoadingPagos(false);
    }
  };

  // 3. MÉTRICAS (CONSULTAS LIGERAS)
  const loadMetricsAndFinances = async () => {
    try {
      // Consulta ligera seleccionando únicamente campos de tipo de participante
      const { data: profilesData } = await supabase.from("profiles").select("tipo_participante, rol_evento");
      
      if (profilesData) {
        let jov = 0; let adu = 0;
        profilesData.forEach(p => {
          getProfileFields(p).tipo_participante === 'joven' ? jov++ : adu++;
        });
        setTotalJovenes(jov);
        setTotalAdultos(adu);
      }

      const { data: pagosData } = await supabase.from("pagos").select("monto_bs, tasa_cambio, estado");
      if (pagosData) {
        let bsSum = 0, usdSum = 0, bsVal = 0, usdVal = 0, pendientesCount = 0;
        pagosData.forEach((pago) => {
          const bs = Number(pago.monto_bs) || 0;
          const tasa = Number(pago.tasa_cambio) || 1;
          const usd = tasa > 0 ? bs / tasa : 0;
          bsSum += bs; usdSum += usd;

          if ((pago.estado || "").toLowerCase() === "validado") {
            bsVal += bs; usdVal += usd;
          } else if (!pago.estado || (pago.estado || "").toLowerCase() === "pendiente") {
            pendientesCount++;
          }
        });
        setTotalBsRecaudado(bsSum); setTotalUsdRecaudado(usdSum);
        setTotalBsValidado(bsVal); setTotalUsdValidado(usdVal);
        setTotalPendientesValidacion(pendientesCount);
      }
    } catch (e) {
      console.warn("Excepción en métricas:", e);
    }
  };

  const loadAnuncios = async () => {
    setLoadingAnuncios(true);
    const { data } = await supabase.from("comunicaciones_anuncios").select("*").order("created_at", { ascending: false });
    if (data) setAnuncios(data);
    setLoadingAnuncios(false);
  };

  const loadMensajesMuro = async () => {
    setLoadingMuro(true);
    const { data } = await supabase.from("muro_social").select("*").order("fecha", { ascending: false });
    if (data) setMensajesMuro(data);
    setLoadingMuro(false);
  };

  useEffect(() => { loadProfiles(); }, [loadProfiles]);
  useEffect(() => { loadMetricsAndFinances(); loadGlobalPagos(); loadAnuncios(); loadMensajesMuro(); }, []);

  // 4. EXPEDIENTE UNIFICADO
  const openExpediente = async (profile: Profile) => {
    setSelectedProfile(profile);
    setEditPerfilData(profile);
    setIsEditingPerfil(false);
    setLoadingModal(true);
    setModalPagos([]);
    setModalDocs([]);

    try {
      const cleanCedula = profile.cedula?.trim() || "";
      const [pagosRes, docsRes] = await Promise.all([
        supabase.from("pagos").select("*").or(`usuario_id.eq.${profile.id},cedula_participante.eq.${cleanCedula}`).order("created_at", { ascending: true }),
        supabase.from("documentos_participante").select("*").eq("cedula_participante", cleanCedula)
      ]);
      setModalPagos(pagosRes.data || []);
      setModalDocs(docsRes.data || []);
    } catch (err) {
      console.error("Error al cargar expediente:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSavePerfil = async () => {
    if (!selectedProfile) return;
    setActionLoading("saving_profile");
    try {
      const { error } = await supabase.from("profiles").update(editPerfilData).eq("id", selectedProfile.id);
      if (error) throw error;
      const updated = { ...selectedProfile, ...editPerfilData } as Profile;
      setSelectedProfile(updated);
      setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? updated : p));
      setIsEditingPerfil(false);
      alert("¡Perfil actualizado con éxito!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateEstatusPago = async (pagoId: string, nuevoEstado: 'validado' | 'rechazado' | 'pendiente') => {
    setActionLoading(pagoId);
    try {
      const { error } = await supabase.from("pagos").update({ estado: nuevoEstado }).eq("id", pagoId);
      if (error) throw error;
      setModalPagos(prev => prev.map(p => p.id === pagoId ? { ...p, estado: nuevoEstado } : p));
      setTodosLosPagos(prev => prev.map(p => p.id === pagoId ? { ...p, estado: nuevoEstado } : p));
      loadMetricsAndFinances();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pagosFiltrados = todosLosPagos.filter((pago) => {
    const f = getProfileFields(pago.profile);
    const search = pagoSearchTerm.toLowerCase().trim();
    const matchesSearch = !search || pago.referencia?.toLowerCase().includes(search) || pago.cedula_participante?.toLowerCase().includes(search) || f.nombre.toLowerCase().includes(search) || f.apellido.toLowerCase().includes(search);
    const matchesEstado = !pagoEstadoFilter || (pago.estado || "pendiente").toLowerCase() === pagoEstadoFilter.toLowerCase();
    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        
        {/* ENCABEZADO OFICIAL SCOUT */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ background: ENJ_NAVY, color: ENJ_YELLOW, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 100 }}>ASOCIACIÓN DE SCOUTS DE VENEZUELA • ENJ 2026</span>
            <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900, color: ENJ_NAVY }}>Panel General de Control y Gestión</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { loadProfiles(); loadMetricsAndFinances(); loadGlobalPagos(); }} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(0,11,111,0.15)", borderRadius: 10, padding: "10px 18px", color: ENJ_NAVY, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: 16, borderRadius: 12, marginBottom: 20, fontWeight: "bold", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={20} />
            Error de conexion: {errorMsg}
          </div>
        )}

        {/* MÉTRICAS FINANCIERAS Y GENERALES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 24 }}>
           <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Perfiles Activos</span><UserCheck size={18} color={ENJ_NAVY} /></div>
            <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>{totalCount}</p>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Jóvenes / Adultos</span><Building size={18} color={ENJ_MAGENTA} /></div>
            <p style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}><span style={{ color: ENJ_MAGENTA }}>{totalJovenes}</span> / {totalAdultos}</p>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.6)", textTransform: "uppercase" }}>Pagos Pendientes</span><Clock size={18} color="#D97706" /></div>
            <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 900, color: "#D97706" }}>{totalPendientesValidacion}</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #000B6F 0%, #0015B8 100%)", padding: 20, borderRadius: 16, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12, fontWeight: 700, color: ENJ_YELLOW, textTransform: "uppercase" }}>Total Validado ($)</span><ShieldCheck size={18} color={ENJ_YELLOW} /></div>
            <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 900, color: "#fff" }}>$ {totalUsdValidado.toFixed(2)} USD</p>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {["perfiles", "pagos", "muro", "anuncios"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: activeTab === tab ? ENJ_NAVY : "#fff", color: activeTab === tab ? "#fff" : ENJ_NAVY, fontWeight: 800, fontSize: 14, cursor: "pointer", textTransform: 'capitalize' }}>
              {tab === 'perfiles' ? `Gestión Integral (${totalCount})` : tab}
            </button>
          ))}
        </div>

        {/* ================= PESTAÑA PERFILES ================= */}
        {activeTab === "perfiles" && (
           <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                    <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Perfil Usuario</th>
                    <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Cédula</th>
                    <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY }}>Grupo / Región</th>
                    <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProfiles ? (
                    <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#666" }}>Cargando expediente scout...</td></tr>
                  ) : profiles.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#666" }}>No se encontraron registros.</td></tr>
                  ) : profiles.map((p) => {
                    const fields = getProfileFields(p);
                    return (
                      <tr key={p.id || p.cedula} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 700, color: ENJ_NAVY, fontSize: 14 }}>{fields.nombre} {fields.apellido}</div>
                          <div style={{ fontSize: 12, color: "rgba(0,11,111,0.5)" }}>{fields.tipo_participante.toUpperCase()}</div>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>{fields.cedula}</td>
                        <td style={{ padding: "14px 18px", fontSize: 13 }}>
                           <div><strong>{fields.grupo_scout}</strong></div>
                           <div style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>{fields.region}</div>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <button onClick={() => openExpediente(p)} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            Abrir Expediente
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* PAGINACIÓN */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#F8FAFF", borderTop: "1px solid rgba(0,11,111,0.08)" }}>
                <span style={{ fontSize: 13, color: ENJ_NAVY, fontWeight: 600 }}>Página {page + 1} de {totalPages}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer" }}><ChevronLeft size={16}/></button>
                  <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page + 1 >= totalPages ? "not-allowed" : "pointer" }}><ChevronRight size={16}/></button>
                </div>
              </div>
           </div>
        )}

        {/* ================= PESTAÑA PAGOS ================= */}
        {activeTab === "pagos" && (
           <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,11,111,0.08)" }}>
             <h3 style={{ margin: "0 0 20px", color: ENJ_NAVY, fontSize: 18, fontWeight: 800 }}>Historial Global de Pagos</h3>
             <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(0,11,111,0.08)" }}>
                    <th style={{ padding: "12px" }}>Participante</th>
                    <th style={{ padding: "12px" }}>Referencia</th>
                    <th style={{ padding: "12px" }}>Monto / Tasa</th>
                    <th style={{ padding: "12px" }}>Estado</th>
                    <th style={{ padding: "12px" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPagos ? (
                    <tr><td colSpan={5} style={{ padding: 20, textAlign: "center" }}>Cargando pagos...</td></tr>
                  ) : pagosFiltrados.map(pago => (
                     <tr key={pago.id} style={{ borderBottom: "1px solid rgba(0,11,111,0.05)" }}>
                       <td style={{ padding: "12px" }}>{pago.cedula_participante}</td>
                       <td style={{ padding: "12px" }}>{pago.referencia}</td>
                       <td style={{ padding: "12px" }}>Bs. {pago.monto_bs} (T: {pago.tasa_cambio})</td>
                       <td style={{ padding: "12px", fontWeight: "bold", color: pago.estado === 'validado' ? 'green' : pago.estado === 'rechazado' ? 'red' : 'orange' }}>
                         {(pago.estado || "pendiente").toUpperCase()}
                       </td>
                       <td style={{ padding: "12px" }}>
                          {pago.profile && <button onClick={() => openExpediente(pago.profile!)} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>Ver Expediente</button>}
                       </td>
                     </tr>
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {/* ================= MODAL EXPEDIENTE UNIFICADO ================= */}
        {selectedProfile && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 1000, maxHeight: "90vh", overflowY: "auto", position: "relative", padding: 32 }}>
              
              <button onClick={() => setSelectedProfile(null)} style={{ position: "absolute", right: 20, top: 20, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer" }}>
                <X size={18} />
              </button>

              {(() => {
                const modalFields = getProfileFields(selectedProfile);
                const isJoven = modalFields.tipo_participante === 'joven';
                const cuotaTotal = isJoven ? 145 : 100;
                const totalPagadoUsd = modalPagos.filter(p => p.estado === 'validado').reduce((acc, p) => acc + (Number(p.monto_bs) / Number(p.tasa_cambio || 1)), 0);
                const deudaUsd = Math.max(0, cuotaTotal - totalPagadoUsd);
                const deudaBsActual = deudaUsd * tasaBcvActual;

                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #eee", paddingBottom: 20 }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: ENJ_NAVY }}>{modalFields.nombre} {modalFields.apellido}</h2>
                        <p style={{ margin: "4px 0 0", color: "#666" }}>Cédula: {modalFields.cedula} | Tipo: <span style={{ color: ENJ_MAGENTA, fontWeight: 'bold', textTransform: 'uppercase' }}>{modalFields.tipo_participante}</span></p>
                      </div>
                      <button onClick={() => setIsEditingPerfil(!isEditingPerfil)} style={{ background: isEditingPerfil ? ENJ_YELLOW : ENJ_NAVY, color: isEditingPerfil ? ENJ_NAVY : "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>
                        <Edit3 size={16} style={{ display: "inline", marginRight: 6 }}/> {isEditingPerfil ? "Cerrar Edición" : "Editar Perfil"}
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                      <div>
                        <div style={{ background: "#F8FAFF", padding: 20, borderRadius: 16, border: "1px solid rgba(0,11,111,0.1)", marginBottom: 20 }}>
                          <h3 style={{ margin: "0 0 16px", color: ENJ_NAVY, fontSize: 16, fontWeight: 900 }}><DollarSign size={18} style={{ display: "inline" }}/> Estado de Cuenta</h3>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ color: "#666" }}>Costo Total Evento:</span>
                            <strong>${cuotaTotal.toFixed(2)} USD</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ color: "#666" }}>Pagado (Validado):</span>
                            <strong style={{ color: "#16A34A" }}>${totalPagadoUsd.toFixed(2)} USD</strong>
                          </div>
                          <hr style={{ border: "0.5px solid #ddd", margin: "10px 0" }}/>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
                            <span style={{ color: ENJ_NAVY, fontWeight: 800 }}>Deuda Restante:</span>
                            <div style={{ textAlign: "right" }}>
                              <strong style={{ color: deudaUsd > 0 ? ENJ_MAGENTA : "#16A34A" }}>${deudaUsd.toFixed(2)} USD</strong>
                              <div style={{ fontSize: 12, color: "#888", fontWeight: "normal" }}>~ Bs. {deudaBsActual.toLocaleString('es-VE')} (Tasa actual)</div>
                            </div>
                          </div>
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Gestión de Pagos</h3>
                        {loadingModal ? <p>Cargando pagos...</p> : modalPagos.length === 0 ? <p style={{ color: "#888" }}>Sin pagos reportados.</p> : (
                           modalPagos.map((pago) => {
                            const est = (pago.estado || "pendiente").toLowerCase();
                            const usdValue = Number(pago.monto_bs) / Number(pago.tasa_cambio || 1);
                            return (
                              <div key={pago.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14, marginBottom: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <strong>Ref: {pago.referencia}</strong>
                                  <span style={{ color: est === 'validado' ? '#166534' : '#92400E', fontWeight: 'bold', fontSize: 12 }}>{est.toUpperCase()}</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#555", margin: "6px 0" }}>
                                  Bs. {Number(pago.monto_bs).toLocaleString("es-VE")} (Tasa: {pago.tasa_cambio}) = <strong style={{ color: ENJ_NAVY }}>${usdValue.toFixed(2)}</strong>
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                                  <button disabled={est === "validado"} onClick={() => handleUpdateEstatusPago(pago.id!, "validado")} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer", opacity: est === "validado" ? 0.5 : 1 }}>Validar</button>
                                  <button disabled={est === "rechazado"} onClick={() => handleUpdateEstatusPago(pago.id!, "rechazado")} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer", opacity: est === "rechazado" ? 0.5 : 1 }}>Rechazar</button>
                                </div>
                              </div>
                            )
                           })
                        )}
                      </div>

                      <div>
                        {isEditingPerfil ? (
                           <div style={{ background: "#FFFBEB", border: `1.5px solid ${ENJ_YELLOW}`, padding: 20, borderRadius: 14 }}>
                             <h4 style={{ margin: "0 0 16px", color: ENJ_NAVY }}>Modificar Perfil</h4>
                             <label style={{ fontSize: 12, fontWeight: 'bold' }}>Nombre</label>
                             <input type="text" value={editPerfilData.nombre || ""} onChange={e => setEditPerfilData({...editPerfilData, nombre: e.target.value})} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}/>
                             <label style={{ fontSize: 12, fontWeight: 'bold' }}>Apellido</label>
                             <input type="text" value={editPerfilData.apellido || ""} onChange={e => setEditPerfilData({...editPerfilData, apellido: e.target.value})} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}/>
                             <button onClick={handleSavePerfil} style={{ background: "#16A34A", color: "#fff", padding: "10px", width: "100%", border: "none", borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
                           </div>
                        ) : (
                          <div style={{ background: "#FAFAFA", padding: 20, borderRadius: 14, border: "1px solid #eee", marginBottom: 20 }}>
                            <h4 style={{ margin: "0 0 12px", color: ENJ_NAVY }}>Información Médica e Institucional</h4>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Grupo Scout:</strong> {modalFields.grupo_scout}</p>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Alergias:</strong> {modalFields.alergias}</p>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Sangre:</strong> {modalFields.tipo_sangre}</p>
                            <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Emergencia:</strong> {modalFields.contacto_emergencia}</p>
                          </div>
                        )}

                        <h3 style={{ fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>Documentos Adjuntos</h3>
                        {loadingModal ? <p>Cargando documentos...</p> : modalDocs.length === 0 ? <p style={{ color: "#888" }}>Sin documentos subidos.</p> : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {modalDocs.map((doc) => (
                              <div key={doc.id} style={{ background: "#F8FAFF", border: "1px solid #eee", padding: 12, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FileText size={18} color={ENJ_NAVY} />
                                  <span style={{ fontSize: 13, fontWeight: "bold" }}>{doc.tipo_documento}</span>
                                </div>
                                {(doc.url_archivo || doc.archivo_base64) && (
                                  <a href={doc.url_archivo || doc.archivo_base64} target="_blank" rel="noopener noreferrer" style={{ background: ENJ_MAGENTA, color: "#fff", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontSize: 11, fontWeight: "bold" }}>Descargar / Ver</a>
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