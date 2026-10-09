import { useState, useEffect, useCallback } from "react";
import {
  Users, CreditCard, Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, X, AlertCircle, Building, Clock,
  ShieldCheck, Edit3, Save, Download,
  UserCheck, FileText, DollarSign, User, CheckCircle
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { getStoredUser } from "../session";
import { CREWS } from "../crews";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

const EXPORT_FIELDS: { key: keyof Participante; label: string }[] = [
  { key: "cedula", label: "Cédula" },
  { key: "nombre", label: "Nombre" },
  { key: "apellido", label: "Apellido" },
  { key: "correo", label: "Correo" },
  { key: "telefono", label: "Teléfono" },
  { key: "fecha_nacimiento", label: "Fecha de nacimiento" },
  { key: "direccion", label: "Dirección" },
  { key: "region", label: "Región" },
  { key: "distrito", label: "Distrito" },
  { key: "grupo_scout", label: "Grupo scout" },
  { key: "rama", label: "Rama" },
  { key: "tipo_participante", label: "Tipo de participante" },
  { key: "talla_uniforme", label: "Talla de uniforme" },
  { key: "tipo_sangre", label: "Tipo de sangre" },
  { key: "alergias", label: "Alergias" },
  { key: "enfermedades", label: "Enfermedades" },
  { key: "medicamentos", label: "Medicamentos" },
  { key: "contacto_emergencia", label: "Contacto de emergencia" },
  { key: "aplica_pronto_pago", label: "Pronto pago" },
  { key: "monto_cuota", label: "Monto de cuota" },
  { key: "created_at", label: "Fecha de inscripción" },
];

const DEFAULT_EXPORT_FIELDS: (keyof Participante)[] = [
  "cedula", "nombre", "apellido", "correo", "telefono", "region", "distrito",
  "grupo_scout", "rama", "tipo_participante", "aplica_pronto_pago", "monto_cuota",
];

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
  aplica_pronto_pago?: boolean;
  monto_cuota?: number;
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
  crew?: string | null;
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
  validado_por?: string;
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

// El validador es el usuario con sesión iniciada; el servidor confirma su rol de admin.
const detectarAuditorActual = (): string => {
  const user = getStoredUser();
  return user?.name?.trim() || user?.email || "Administrador ENJ";
};

export function Dashboard() {
  // ESTADOS DE PARTICIPANTES
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;
  const [pendingPayments, setPendingPayments] = useState<Pago[]>([]);
  const [selectedPendingPayments, setSelectedPendingPayments] = useState<string[]>([]);
  const [approvingPendingPayments, setApprovingPendingPayments] = useState(false);

  // ESTADO DE AUDITOR / ADMINISTRADOR ACTIVO
  const [auditorActual] = useState<string>(detectarAuditorActual);

  // FILTROS DE BÚSQUEDA Y EXPORTACIÓN
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFields, setExportFields] = useState<(keyof Participante)[]>(DEFAULT_EXPORT_FIELDS);

  // MÉTRICAS Y FINANZAS
  const [totalJovenes, setTotalJovenes] = useState<number>(0);
  const [totalAdultos, setTotalAdultos] = useState<number>(0);
  const [totalUsdValidado, setTotalUsdValidado] = useState<number>(0);
  const [totalPendientesValidacion, setTotalPendientesValidacion] = useState<number>(0);
  const [tasaBcvActual, setTasaBcvActual] = useState<number>(0);
  const [tasaBcvEstimada, setTasaBcvEstimada] = useState<boolean>(false);

  // MODAL EXPEDIENTE & EDICIÓN DE PERFIL
  const [selectedParticipante, setSelectedParticipante] = useState<Participante | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalPagos, setModalPagos] = useState<Pago[]>([]);
  const [modalDocs, setModalDocs] = useState<Documento[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditingPerfil, setIsEditingPerfil] = useState<boolean>(false);

  // ESTADOS FORMULARIO EDICIÓN DUAL
  const [editPartData, setEditPartData] = useState<Partial<Participante>>({});
  const [editProfileData, setEditProfileData] = useState<Partial<Profile>>({});

  useEffect(() => {
    fetch("/api/tasa-bcv")
      .then((response) => response.json())
      .then((result) => {
        if (!result.ok) throw new Error(result.error);
        setTasaBcvActual(Number(result.rate) || 0);
        setTasaBcvEstimada(Boolean(result.estimated));
      })
      .catch((error) => {
        console.warn("No se pudo obtener la tasa BCV:", error);
        setTasaBcvEstimada(true);
      });
  }, []);

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

      if (filtroTipo === "adulto") {
        query = query.or('tipo_participante.ilike.%adulto%,tipo_participante.ilike.%staff%,tipo_participante.ilike.%dirigente%');
      } else if (filtroTipo === "joven") {
        query = query.not('tipo_participante', 'ilike', '%adulto%')
                     .not('tipo_participante', 'ilike', '%staff%')
                     .not('tipo_participante', 'ilike', '%dirigente%');
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
  }, [page, searchTerm, filtroTipo]);

  const loadPendingPayments = async () => {
    const { data, error } = await supabase
      .from("pagos")
      .select("*")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error al cargar pagos pendientes:", error.message);
      return;
    }

    const payments = (data || []) as Pago[];
    const cedulas = [...new Set(payments.map((payment) => payment.cedula_participante))];
    if (cedulas.length === 0) {
      setPendingPayments([]);
      setSelectedPendingPayments([]);
      return;
    }

    const { data: participants } = await supabase
      .from("participantes")
      .select("cedula, nombre, apellido")
      .in("cedula", cedulas);
    const participantByCedula = new Map((participants || []).map((participant) => [participant.cedula, participant]));
    setPendingPayments(payments.map((payment) => ({
      ...payment,
      participante: participantByCedula.get(payment.cedula_participante) || null,
    })));
    setSelectedPendingPayments((selected) => selected.filter((id) => payments.some((payment) => payment.id === id)));
  };

  // 2. DESCARGAR EXCEL (CSV Compatible)
  const handleDownloadExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import("@e965/xlsx");
      if (exportFields.length === 0) {
        alert("Selecciona al menos una columna para exportar.");
        return;
      }

      const allParticipants: Participante[] = [];
      const exportPageSize = 500;
      for (let from = 0; ; from += exportPageSize) {
        let query = supabase.from("participantes").select("*");

        if (searchTerm.trim() !== "") {
          const term = `%${searchTerm.trim()}%`;
          query = query.or(`cedula.ilike.${term},nombre.ilike.${term},apellido.ilike.${term},correo.ilike.${term}`);
        }

        if (filtroTipo === "adulto") {
          query = query.or('tipo_participante.ilike.%adulto%,tipo_participante.ilike.%staff%,tipo_participante.ilike.%dirigente%');
        } else if (filtroTipo === "joven") {
          query = query.not('tipo_participante', 'ilike', '%adulto%')
                       .not('tipo_participante', 'ilike', '%staff%')
                       .not('tipo_participante', 'ilike', '%dirigente%');
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .range(from, from + exportPageSize - 1);
        if (error) throw error;
        allParticipants.push(...((data || []) as Participante[]));
        if (!data || data.length < exportPageSize) break;
      }

      if (allParticipants.length === 0) {
        alert("No hay datos para exportar con los filtros actuales.");
        return;
      }

      const selectedFields = EXPORT_FIELDS.filter((field) => exportFields.includes(field.key));
      const rows = allParticipants.map((participant) => Object.fromEntries(
        selectedFields.map(({ key, label }) => {
          const value = participant[key];
          return [label, typeof value === "boolean" ? (value ? "SI" : "NO") : value ?? ""];
        }),
      ));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet["!cols"] = selectedFields.map(({ label }) => ({ wch: Math.min(Math.max(label.length + 3, 14), 32) }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Miembros");
      XLSX.writeFile(workbook, `Miembros_ENJ_${filtroTipo}_${Date.now()}.xlsx`);

    } catch (err: any) {
      console.error("Error al exportar:", err);
      alert("Hubo un error al exportar los datos.");
    } finally {
      setIsExporting(false);
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
          if (tipo.includes("adulto") || tipo.includes("staff") || tipo.includes("dirigente")) adu++;
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
    loadPendingPayments();
  }, []);

  // 4. ABRIR EXPEDIENTE Y VINCULAR PERFIL
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

      const { data: pagosData } = await supabase
        .from("pagos")
        .select("*")
        .eq("cedula_participante", cleanCedula)
        .order("created_at", { ascending: true });

      if (pagosData) setModalPagos(pagosData);

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

  const handleDualChange = (field: string, value: any) => {
    setEditPartData((prev) => ({ ...prev, [field]: value }));
    setEditProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // 5. GUARDAR EDICIÓN DUAL EN `participantes` Y EN `profiles`
  const handleSaveExpediente = async () => {
    if (!selectedParticipante) return;
    setActionLoading("saving_all");
    try {
      const { error: partErr } = await supabase
        .from("participantes")
        .update(editPartData)
        .eq("cedula", selectedParticipante.cedula);

      if (partErr) throw partErr;

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

  // 6. CAMBIAR ESTATUS DE PAGO EN SUPABASE
  const handleUpdateEstatusPago = async (pagoId: string, nuevoEstado: "validado" | "rechazado" | "pendiente") => {
    setActionLoading(pagoId);
    try {
      const firmaValidador = auditorActual.trim() !== "" ? auditorActual.trim() : "Administrador ENJ";

      const updatePayload: Partial<Pago> = { estado: nuevoEstado };

      if (nuevoEstado === "validado") {
        updatePayload.validado_por = firmaValidador;
      }

      const { error } = await supabase.from("pagos").update(updatePayload).eq("id", pagoId);
      if (error) throw error;

      setModalPagos((prev) => prev.map((p) => (p.id === pagoId ? { ...p, ...updatePayload } : p)));
      loadMetricsAndFinances();
      loadPendingPayments();
    } catch (err: any) {
      alert("Error al actualizar pago: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveSelectedPayments = async () => {
    if (selectedPendingPayments.length === 0) return;
    setApprovingPendingPayments(true);
    try {
      const { error } = await supabase
        .from("pagos")
        .update({
          estado: "validado",
          validado_por: auditorActual.trim() || "Administrador ENJ",
        })
        .in("id", selectedPendingPayments)
        .eq("estado", "pendiente");
      if (error) throw error;

      setSelectedPendingPayments([]);
      await Promise.all([loadPendingPayments(), loadMetricsAndFinances()]);
    } catch (error: any) {
      alert("No se pudieron aprobar los pagos seleccionados: " + (error.message || "Error desconocido"));
    } finally {
      setApprovingPendingPayments(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const tipoPart = selectedParticipante ? (selectedParticipante.tipo_participante || "").toLowerCase() : "";
  const esAdulto = tipoPart.includes("adulto") || tipoPart.includes("staff") || tipoPart.includes("dirigente");

  let cuotaTotal = 145;
  let etiquetaTarifa = "(Joven Base $145)";

  if (selectedParticipante) {
    if (!esAdulto && selectedParticipante.aplica_pronto_pago) {
      cuotaTotal = 115;
      etiquetaTarifa = "(Pronto Pago $115)";
    } 
    else if (esAdulto) {
      cuotaTotal = 100;
      etiquetaTarifa = "(Adulto/Staff $100)";
    } 
    else if (selectedParticipante.monto_cuota !== undefined && selectedParticipante.monto_cuota !== null && Number(selectedParticipante.monto_cuota) >= 0) {
      cuotaTotal = Number(selectedParticipante.monto_cuota);
      etiquetaTarifa = "(Personalizado)";
    }
  }

  const totalPagadoUsd = modalPagos.filter((p) => p.estado === "validado").reduce((acc, p) => acc + Number(p.monto_bs) / (Number(p.tasa_cambio) || 1), 0);
  const deudaUsd = Math.max(0, cuotaTotal - totalPagadoUsd);
  const deudaBsActual = deudaUsd * tasaBcvActual;

  return (
    <div className="dash-container">
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

        {pendingPayments.length > 0 && (
          <section style={{ background: "#fff", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 18px", borderBottom: "1px solid #FDE68A" }}>
              <div>
                <strong style={{ color: ENJ_NAVY }}>Pagos pendientes</strong>
                <span style={{ marginLeft: 8, color: "#B45309", fontSize: 13 }}>{pendingPayments.length}{pendingPayments.length === 100 ? "+" : ""} por revisar</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={pendingPayments.length > 0 && selectedPendingPayments.length === pendingPayments.length}
                    onChange={(event) => setSelectedPendingPayments(event.target.checked ? pendingPayments.map((payment) => payment.id) : [])}
                  />
                  Seleccionar todos
                </label>
                <button
                  onClick={handleApproveSelectedPayments}
                  disabled={selectedPendingPayments.length === 0 || approvingPendingPayments}
                  style={{ display: "flex", alignItems: "center", gap: 6, border: 0, borderRadius: 7, padding: "9px 12px", background: "#16A34A", color: "#fff", fontWeight: 700, fontSize: 12, cursor: selectedPendingPayments.length ? "pointer" : "not-allowed", opacity: selectedPendingPayments.length && !approvingPendingPayments ? 1 : 0.55 }}
                >
                  <CheckCircle size={15} />
                  {approvingPendingPayments ? "Aprobando..." : `Aprobar seleccionados (${selectedPendingPayments.length})`}
                </button>
              </div>
            </div>
            <div style={{ maxHeight: 310, overflowY: "auto" }}>
              {pendingPayments.map((payment) => (
                <div key={payment.id} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: "1px solid #F1F5F9" }}>
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar pago ${payment.referencia || payment.id}`}
                    checked={selectedPendingPayments.includes(payment.id)}
                    onChange={(event) => setSelectedPendingPayments((selected) => event.target.checked ? [...selected, payment.id] : selected.filter((id) => id !== payment.id))}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>
                      {payment.participante ? `${payment.participante.nombre} ${payment.participante.apellido}` : payment.cedula_participante}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>
                      Ref. {payment.referencia || "Sin referencia"} · Bs. {Number(payment.monto_bs).toLocaleString("es-VE")} · {payment.fecha_pago || "Sin fecha"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateEstatusPago(payment.id, "validado")}
                    disabled={actionLoading === payment.id}
                    style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #86EFAC", borderRadius: 7, padding: "7px 10px", background: "#F0FDF4", color: "#15803D", fontWeight: 700, fontSize: 11, cursor: "pointer" }}
                  >
                    <CheckCircle size={14} /> Aprobar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ padding: "10px 20px", borderRadius: 12, background: ENJ_NAVY, color: "#fff", fontWeight: 800, fontSize: 14 }}>
            Expedientes de Participantes ({totalCount})
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", overflow: "hidden" }}>

          {/* BUSCADOR Y FILTROS */}
          <div style={{ padding: 16, borderBottom: "1px solid rgba(0,11,111,0.08)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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
            
            <select 
              value={filtroTipo} 
              onChange={(e) => { setFiltroTipo(e.target.value); setPage(0); }}
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, background: "#fff", color: ENJ_NAVY, fontWeight: "bold" }}
            >
              <option value="todos">Todos los Participantes</option>
              <option value="joven">Solo Jóvenes</option>
              <option value="adulto">Adultos / Staff</option>
            </select>

            <details style={{ position: "relative" }}>
              <summary style={{ listStyle: "none", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8, color: ENJ_NAVY, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Columnas ({exportFields.length})
              </summary>
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 20, width: "min(360px, 85vw)", maxHeight: 340, overflowY: "auto", padding: 12, background: "#fff", border: "1px solid #CBD5E1", borderRadius: 8, boxShadow: "0 12px 30px rgba(15,23,42,0.16)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <button type="button" onClick={() => setExportFields(EXPORT_FIELDS.map((field) => field.key))} style={{ border: 0, background: "none", color: ENJ_NAVY, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Todas</button>
                  <button type="button" onClick={() => setExportFields([])} style={{ border: 0, background: "none", color: "#64748B", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Ninguna</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 10px" }}>
                  {EXPORT_FIELDS.map((field) => (
                    <label key={field.key} style={{ display: "flex", alignItems: "flex-start", gap: 6, color: "#334155", fontSize: 11, lineHeight: 1.3, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={exportFields.includes(field.key)}
                        onChange={(event) => setExportFields((selected) => event.target.checked ? [...selected, field.key] : selected.filter((key) => key !== field.key))}
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>
            </details>

            <button
              onClick={handleDownloadExcel}
              disabled={isExporting}
              style={{
                display: "flex", alignItems: "center", gap: 8, background: "#16A34A", color: "#fff", 
                border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: "bold", cursor: isExporting ? "wait" : "pointer"
              }}
            >
              <Download size={16} /> {isExporting ? "Generando..." : "Descargar Excel"}
            </button>
          </div>

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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#F8FAFF", borderTop: "1px solid rgba(0,11,111,0.08)" }}>
            <span style={{ fontSize: 13, color: ENJ_NAVY, fontWeight: 600 }}>Página {page + 1} de {totalPages}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer" }}><ChevronLeft size={16} /></button>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: page + 1 >= totalPages ? "not-allowed" : "pointer" }}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* ================= MODAL EXPEDIENTE UNIFICADO SCOUT ================= */}
        {selectedParticipante && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div className="modal-window" style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 1050, maxHeight: "90vh", overflowY: "auto", position: "relative", padding: 32 }}>
              <button onClick={() => setSelectedParticipante(null)} style={{ position: "absolute", right: 16, top: 16, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>

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
                
                <div>
                  <div style={{ background: "#E0F2FE", padding: 12, borderRadius: 12, border: "1px solid #BAE6FD", marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: ENJ_NAVY, display: "block", marginBottom: 4 }}>
                      👤 FIRMA DEL VALIDADOR DE PAGOS:
                    </label>
                    <input
                      type="text"
                      value={auditorActual}
                      readOnly
                      aria-readonly="true"
                      style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #7DD3FC", fontSize: 12, fontWeight: "bold", background: "#fff", color: ENJ_NAVY }}
                    />
                    <span style={{ fontSize: 10, color: "#0369A1", marginTop: 4, display: "block" }}>
                      Esta identidad quedará grabada en los pagos que valides.
                    </span>
                  </div>

                  <div style={{ background: "#F8FAFF", padding: 18, borderRadius: 16, border: "1px solid rgba(0,11,111,0.1)", marginBottom: 20 }}>
                    <h3 style={{ margin: "0 0 14px", color: ENJ_NAVY, fontSize: 15, fontWeight: 900 }}>
                      <DollarSign size={18} style={{ display: "inline", verticalAlign: "middle" }} /> Estado de Cuenta
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "#666" }}>Costo Evento:</span>
                      <strong>
                        ${cuotaTotal.toFixed(2)} USD <span style={{ color: ENJ_MAGENTA, fontSize: 10 }}>{etiquetaTarifa}</span>
                      </strong>
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
                        <div style={{ fontSize: 11, color: "#777" }}>
                          {tasaBcvActual > 0
                            ? `~ Bs. ${deudaBsActual.toLocaleString("es-VE", { maximumFractionDigits: 2 })} (BCV ${tasaBcvActual.toLocaleString("es-VE")}${tasaBcvEstimada ? ", estimada" : ""})`
                            : "Tasa BCV no disponible"}
                        </div>
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
                      const auditorRegistrado = pago.validado_por && pago.validado_por !== "Desconocido" ? pago.validado_por : null;

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
                          
                          {pago.estado === "validado" && (
                            <div style={{ fontSize: 11, color: "#16A34A", marginTop: 4, fontWeight: "700", display: "flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle size={12} /> Aprobado por: <span style={{ textDecoration: "underline" }}>{auditorRegistrado || auditorActual}</span>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                            <button disabled={pago.estado === "validado"} onClick={() => handleUpdateEstatusPago(pago.id, "validado")} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: "bold", cursor: "pointer", opacity: pago.estado === "validado" ? 0.5 : 1 }}>Validar</button>
                            <button disabled={pago.estado === "rechazado"} onClick={() => handleUpdateEstatusPago(pago.id, "rechazado")} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: "bold", cursor: "pointer", opacity: pago.estado === "rechazado" ? 0.5 : 1 }}>Rechazar</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div>
                  {isEditingPerfil ? (
                    <div style={{ background: "#FFFBEB", border: `1.5px solid ${ENJ_YELLOW}`, padding: 18, borderRadius: 14, maxHeight: "55vh", overflowY: "auto" }}>
                      <h4 style={{ margin: "0 0 14px", color: ENJ_NAVY, fontSize: 15, fontWeight: 900 }}>
                        Edición de Expediente Completo
                      </h4>

                      <h5 style={{ margin: "14px 0 8px", color: ENJ_MAGENTA, fontSize: 13 }}>Datos Financieros y Tarifas</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: "bold" }}>Monto Cuota Personalizada ($)</label>
                          <input 
                            type="number" 
                            placeholder={esAdulto ? "$100 (Adulto)" : "$145 (Joven)"}
                            value={editPartData.monto_cuota !== undefined && editPartData.monto_cuota !== null ? editPartData.monto_cuota : ""}
                            onChange={(e) => setEditPartData({ ...editPartData, monto_cuota: e.target.value === "" ? undefined : Number(e.target.value) })}
                            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} 
                          />
                        </div>
                        {!esAdulto && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
                            <input 
                              type="checkbox" 
                              id="chkProntoPago"
                              checked={!!editPartData.aplica_pronto_pago}
                              onChange={(e) => setEditPartData({ ...editPartData, aplica_pronto_pago: e.target.checked })}
                              style={{ width: 16, height: 16 }}
                            />
                            <label htmlFor="chkProntoPago" style={{ fontSize: 11, fontWeight: "bold", cursor: "pointer", color: ENJ_NAVY }}>
                              Pronto Pago ($115 USD)
                            </label>
                          </div>
                        )}
                      </div>

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
                          }} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} placeholder="Ej: Joven, Adulto, Staff" />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: "bold" }}>Talla Uniforme</label>
                          <input type="text" value={editPartData.talla_uniforme || ""} onChange={(e) => setEditPartData({ ...editPartData, talla_uniforme: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }} />
                        </div>
                      </div>

                      <h5 style={{ margin: "14px 0 8px", color: ENJ_MAGENTA, fontSize: 13 }}>Perfil Social</h5>
                      <label style={{ fontSize: 11, fontWeight: "bold" }}>Crew ENJ</label>
                      {selectedProfile?.id ? (
                        <select
                          value={editProfileData.crew || ""}
                          onChange={(e) => setEditProfileData({ ...editProfileData, crew: e.target.value || null })}
                          style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 13, background: "#fff" }}
                        >
                          <option value="">Sin crew asignado</option>
                          {CREWS.map((nombreCrew) => <option key={nombreCrew} value={nombreCrew}>{nombreCrew}</option>)}
                        </select>
                      ) : (
                        <p style={{ fontSize: 12, color: "#777", margin: "2px 0 10px" }}>Este participante aún no ha creado su perfil social; podrá asignarse el crew cuando lo cree.</p>
                      )}
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
                      <p style={{ fontSize: 13, margin: "6px 0" }}><strong>Crew ENJ:</strong> {selectedProfile?.crew ? <span style={{ color: ENJ_MAGENTA, fontWeight: 800 }}>★ {selectedProfile.crew}</span> : "Sin crew asignado"}</p>
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
            </div>
          </div>
        )}

      </div>
    </div>
  );
}