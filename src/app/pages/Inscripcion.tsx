import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropzone } from "../components/FileDropzone";
import { GoogleDriveIcon } from "../components/GoogleDriveIcon";
import { CheckCircle2, User, Shield, CreditCard, Phone, Mail, MapPin, Hash, ChevronDown, ArrowLeft } from "lucide-react";

// ⚠️ DESCOMENTA esta línea para importar tu cliente de Supabase real si lo usas:
// import { supabase } from "../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

// ✅ URL DE PRODUCCIÓN ACTUALIZADA
const SUPABASE_FUNCTION_URL = "https://ikiqphxigtwkjhiachqg.supabase.co/functions/v1/manage-drive";

type ScoutDistrict = { district: string };
type ScoutRegion = { region: string; districts: ScoutDistrict[] };

const scoutRegions: ScoutRegion[] = [
  { region: "ARAGUA", districts: [{ district: "Guarico" }, { district: "HENRI PITTIER" }, { district: "JOSE FELIX RIBAS" }, { district: "MANUEL ATANASIO GIRARDOT" }, { district: "SANTIAGO MARIÑO" }, { district: "SUCRE ZAMORA" }] },
  { region: "ATENDIDOS POR LA OSN", districts: [{ district: "BOLIVAR" }, { district: "COJEDES" }, { district: "FALCON" }, { district: "GUARAPICHE" }, { district: "PORTUGUESA" }, { district: "PUERTO LA CRUZ" }, { district: "TRUJILLO" }, { district: "YARACUY" }] },
  { region: "CARABOBO", districts: [{ district: "GUACARA" }, { district: "SAN ESTEBAN" }, { district: "VALENCIA NORTE" }, { district: "VALENCIA SUR" }] },
  { region: "DISTRITO CAPITAL", districts: [{ district: "AVILA" }, { district: "CARICUAO" }, { district: "JOSE ANTONIO PAEZ" }, { district: "LOS PROCERES" }, { district: "MARISCAL SUCRE" }, { district: "SANTIAGO DE LEON" }] },
  { region: "LARA", districts: [{ district: "ANDRES ELOY BLANCO" }, { district: "CATEDRAL" }, { district: "CREPUSCULAR" }, { district: "PALAVECINO" }] },
  { region: "MERIDA", districts: [{ district: "CARI" }, { district: "LIBERTADOR" }, { district: "NO APLICA" }] },
  { region: "METROPOLITANA", districts: [{ district: "BARUTA" }, { district: "CHACAO" }, { district: "SUCRE NORTE" }, { district: "SUCRE SUR" }] },
  { region: "MIRANDA", districts: [{ district: "ALTOS MIRANDINOS" }, { district: "GUARENAS GUATIRE" }, { district: "VALLES DEL TUY" }] },
  { region: "TACHIRA", districts: [{ district: "RIO TORBES" }, { district: "SAN CRISTOBAL ESTE" }, { district: "SAN CRISTOBAL OESTE" }] },
  { region: "ZULIA", districts: [{ district: "COQUIVACOA" }, { district: "FRANCISCO POLANCO - PERIJA" }, { district: "PEDRO HENRIQUEZ AMADO" }, { district: "SAMUEL MARTINEZ" }, { district: "SAN FRANCISCO" }, { district: "ZULIA ORIENTAL" }] },
];

const ramas = ["Comunidad (Caminante)", "Clan (Rover)"];

function InputField({
  label,
  placeholder,
  type = "text",
  icon,
  required = true,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, letterSpacing: "0.01em" }}>
        {label}
        {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)", display: "flex", pointerEvents: "none" }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: icon ? "11px 14px 11px 40px" : "11px 14px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: disabled ? "#F4F5FA" : "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: disabled ? "rgba(0,11,111,0.5)" : "#0D0D2B",
            outline: "none",
            transition: "border 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => !disabled && (e.currentTarget.style.border = `1.5px solid ${ENJ_NAVY}`)}
          onBlur={(e) => !disabled && (e.currentTarget.style.border = "1.5px solid rgba(0,11,111,0.15)")}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  required = true,
  disabled = false
}: {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, letterSpacing: "0.01em" }}>
        {label}
        {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "11px 40px 11px 14px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: disabled ? "#F4F5FA" : "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: disabled ? "rgba(0,11,111,0.35)" : "#0D0D2B",
            outline: "none",
            appearance: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            boxSizing: "border-box",
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 4px" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,11,111,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.09em" }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,11,111,0.1)" }} />
    </div>
  );
}

export function Inscripcion() {
  const navigate = useNavigate();

  // FLUJO DE PANTALLAS PRINCIPAL
  const [viewMode, setViewMode] = useState<"inscripcion" | "cuotas" | "exito">("inscripcion");

  // CAMPOS DE CONTROL E INFORMACIÓN DEL SCOUT
  const [participantType, setParticipantType] = useState<"joven" | "adulto">("joven");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [ramaScout, setRamaScout] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");

  // Variables específicas según la categoría del participante
  const [ramaActual, setRamaActual] = useState("");
  const [adultoUnidad, setAdultoUnidad] = useState("");
  const [anioRegistro, setAnioRegistro] = useState("");
  const [tallaUniforme, setTallaUniforme] = useState("");
  const [cargoAdulto, setCargoAdulto] = useState("");
  const [areaAdulto, setAreaAdulto] = useState("");

  // ESTADOS FINANCIEROS (PASO CUOTAS)
  const [numCuota, setNumCuota] = useState("Cuota Inicial (Inscripción)");
  const [metodoPago, setMetodoPago] = useState("");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [montoPagado, setMontoPagado] = useState("");

  // ARCHIVOS ADJUNTOS
  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [fotoParticipante, setFotoParticipante] = useState<File | null>(null);
  const [screenshotMedica, setScreenshotMedica] = useState<File | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // CONTROL INTERNO SUPABASE / DRIVE
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dbParticipantId, setDbParticipantId] = useState<string | null>(null);
  const [userDriveFolderId, setUserDriveFolderId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // EFECTO PRINCIPAL: Recuperar sesión del Login y validar si ya se inscribió
  useEffect(() => {
    async function checkAuthAndRegistration() {
      // 1. Obtener la sesión activa de Supabase Auth
      // const { data: { user } } = await supabase.auth.getUser();
      // Si usas un mock o variable global temporal para desarrollo:
      const user = { id: "ID_USUARIO_LOGUEADO_TEMPORAL" };

      if (!user) {
        alert("Debes iniciar sesión para acceder a la inscripción.");
        navigate("/login");
        return;
      }
      setCurrentUserId(user.id);

      // 2. Verificar si este id ya existe en la tabla de participantes
      /*
      const { data, error } = await supabase
        .from('participantes')
        .select('id, nombre, apellido, cedula, google_drive_folder_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setNombre(data.nombre);
        setApellido(data.apellido);
        setCedula(data.cedula);
        setDbParticipantId(data.id);
        setUserDriveFolderId(data.google_drive_folder_id);
        setViewMode("cuotas"); // Salta directo al control de cuotas si ya completó su registro base
      }
      */
    }
    checkAuthAndRegistration();
  }, [navigate]);

  function calculateAge(dateString: string) {
    const date = new Date(dateString);
    if (!dateString || Number.isNaN(date.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    const dayDiff = now.getDate() - date.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years -= 1;
    return years >= 0 ? years : null;
  }

  // ACCIÓN 1: PROCESAR EL REGISTRO INICIAL Y CREAR LA CARPETA EN GOOGLE DRIVE
  async function handleInscriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms) return alert("Debe leer y aceptar el acuerdo de convivencia.");
    if (!currentUserId) return alert("No se detectó una sesión activa. Por favor, reingresa.");
    setLoading(true);

    try {
      // A. Invocar Edge Function para generar el directorio personal del Scout en Drive
      const folderName = `${cedula.trim()} - ${nombre.trim()} ${apellido.trim()}`;
      const folderForm = new FormData();
      folderForm.append("action", "create_folder");
      folderForm.append("folder_name", folderName);

      const driveResponse = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        // Si tienes anon key debes enviarla: headers: { "Authorization": "Bearer TU_SUPABASE_ANON_KEY" },
        body: folderForm,
      });
      const driveData = await driveResponse.json();
      if (!driveData.folderId) throw new Error("No se pudo estructurar el directorio digital en Drive.");

      const generatedFolderId = driveData.folderId;
      setUserDriveFolderId(generatedFolderId);

      // B. Guardar los datos en la tabla relacional de Supabase
      const detalles = participantType === "joven" 
        ? { ramaActual, adultoUnidad, anioRegistro, tallaUniforme }
        : { cargoAdulto, areaAdulto };

      /*
      const { data: newScout, error: dbError } = await supabase
        .from('participantes')
        .insert([{
          user_id: currentUserId,
          cedula: cedula.trim(),
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: correo.trim(),
          telefono: telefono.trim(),
          ciudad: ciudad.trim(),
          region: selectedRegion,
          distrito: selectedDistrict,
          unidad_scout: ramaScout,
          tipo_participante: participantType,
          detalles_adicionales: detalles,
          google_drive_folder_id: generatedFolderId
        }])
        .select().single();

      if (dbError) throw dbError;
      setDbParticipantId(newScout.id);
      */

      // C. Subir archivos iniciales asíncronamente a Google Drive
      if (fotoParticipante) {
        const fileForm = new FormData();
        fileForm.append("action", "upload_file");
        fileForm.append("folder_id", generatedFolderId);
        fileForm.append("file", fotoParticipante);
        fileForm.append("custom_name", `Foto_Perfil_${cedula}`);
        fetch(SUPABASE_FUNCTION_URL, { method: "POST", body: fileForm });
      }

      if (screenshotMedica) {
        const fileForm = new FormData();
        fileForm.append("action", "upload_file");
        fileForm.append("folder_id", generatedFolderId);
        fileForm.append("file", screenshotMedica);
        fileForm.append("custom_name", `Ficha_Medica_${cedula}`);
        fetch(SUPABASE_FUNCTION_URL, { method: "POST", body: fileForm });
      }

      setViewMode("cuotas");
    } catch (err: any) {
      alert(`Error en el servidor: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  // ACCIÓN 2: ENVIAR COMPROBANTES DE CUOTAS ADICIONALES
  async function handleCuotasSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comprobantePago) return alert("Por favor, adjunta el comprobante de esta cuota.");
    setLoading(true);

    try {
      // A. Cargar comprobante a la carpeta existente en Google Drive
      const fileForm = new FormData();
      fileForm.append("action", "upload_file");
      fileForm.append("folder_id", userDriveFolderId);
      fileForm.append("file", comprobantePago);
      fileForm.append("custom_name", `Comprobante_${numCuota.replace(/\s+/g, "_")}_${cedula}`);

      const driveResponse = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        body: fileForm,
      });
      const driveData = await driveResponse.json();

      // B. Registrar la transacción en la tabla 'pagos' de Supabase
      /*
      const { error: paymentError } = await supabase
        .from('pagos')
        .insert([{
          participante_id: dbParticipantId,
          cuota: numCuota,
          metodo_pago: metodoPago,
          referencia: referenciaPago.trim(),
          monto: parseFloat(montoPagado || "0"),
          drive_file_id: driveData.fileId || null
        }]);

      if (paymentError) throw paymentError;
      */

      setViewMode("exito");
    } catch (err: any) {
      alert(`Error procesando el pago: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  // VISTA: CONFIRMACIÓN EXITOSA DE TRANSACCIÓN
  if (viewMode === "exito") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
            <CheckCircle2 size={42} color="#22c55e" />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>¡Pago Registrado!</h2>
          <p style={{ margin: "0 0 28px", color: "rgba(0,11,111,0.6)", fontSize: 15, lineHeight: 1.7 }}>
            Tu comprobante ha sido anexado de manera segura a tu expediente digital en Google Drive y cargado al panel de finanzas.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => {
                setComprobantePago(null);
                setReferenciaPago("");
                setMontoPagado("");
                setViewMode("cuotas");
              }}
              style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: ENJ_NAVY, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Registrar otra cuota
            </button>
            <button onClick={() => navigate("/")} style={{ padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${ENJ_NAVY}`, background: "transparent", color: ENJ_NAVY, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F0F2FA", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        <button
          onClick={() => viewMode === "cuotas" ? setViewMode("inscripcion") : navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.6)", fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 32 }}
        >
          <ArrowLeft size={16} />
          {viewMode === "cuotas" ? "Regresar al formulario" : "Volver al inicio"}
        </button>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            ENJ 2026 · Guárico
          </span>
          <h1 style={{ margin: "16px 0 10px", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
            {viewMode === "inscripcion" ? "Formulario de Inscripción" : "Control de Cuotas de Pago"}
          </h1>
          <p style={{ margin: 0, color: "rgba(0,11,111,0.55)", fontSize: 15, lineHeight: 1.65 }}>
            {viewMode === "inscripcion"
              ? "Completa todos los campos para reservar tu cupo en el Encuentro Nacional de Jóvenes."
              : "Sube y notifica los pagos fraccionados. Los archivos se depositarán ordenadamente en tu cuenta de Drive."}
          </p>
        </div>

        {/* Indicador de Línea de Tiempo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
          {[
            { n: 1, label: "Inscripción", color: ENJ_NAVY, active: true },
            { n: 2, label: "Cuotas Drive", color: ENJ_MAGENTA, active: viewMode === "cuotas" },
          ].map(({ n, label, color, active }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: active ? color : "rgba(0,11,111,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                  {n}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? color : "rgba(0,11,111,0.4)", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {i < 1 && (
                <div style={{ width: 120, height: 2, background: viewMode === "cuotas" ? ENJ_YELLOW : "rgba(0,11,111,0.15)", margin: "0 8px", marginBottom: 22 }} />
              )}
            </div>
          ))}
        </div>

        {/* MODO A: FORMULARIO COMPLETO DE INSCRIPCIÓN */}
        {viewMode === "inscripcion" && (
          <>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 30, flexWrap: "wrap" }}>
              {[{ label: "Joven", value: "joven" }, { label: "Adulto", value: "adulto" }].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setParticipantType(option.value as "joven" | "adulto")}
                  style={{ borderRadius: 999, border: `1.5px solid ${participantType === option.value ? ENJ_MAGENTA : "rgba(0,11,111,0.18)"}`, background: participantType === option.value ? ENJ_MAGENTA : "#fff", color: participantType === option.value ? "#fff" : ENJ_NAVY, padding: "12px 28px", cursor: "pointer", fontWeight: 700, boxShadow: participantType === option.value ? "0 12px 30px rgba(215,0,126,0.16)" : "none" }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
              <form onSubmit={handleInscriptionSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <SectionDivider title="Credenciales Scout" icon={<Shield size={16} color={ENJ_NAVY} />} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Nombre(s)" placeholder="María" icon={<User size={16} />} value={nombre} onChange={setNombre} />
                  <InputField label="Apellido(s)" placeholder="González" icon={<User size={16} />} value={apellido} onChange={setApellido} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Cédula de Identidad" placeholder="V-12.345.678" icon={<Hash size={16} />} value={cedula} onChange={setCedula} />
                  <InputField label="Fecha de Nacimiento" placeholder="dd/mm/aaaa" type="date" value={birthDate} onChange={(value) => { setBirthDate(value); setAge(calculateAge(value)); }} />
                </div>
                {age !== null && <p style={{ margin: "0", fontSize: 13, color: "rgba(0,11,111,0.65)", fontWeight: 600 }}>Edad: {age} años</p>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelectField label="Región Scout" options={scoutRegions.map((region) => region.region)} value={selectedRegion} onChange={(value) => { setSelectedRegion(value); setSelectedDistrict(""); }} />
                  <SelectField label="Distrito Scout" options={selectedRegion ? scoutRegions.find((region) => region.region === selectedRegion)?.districts.map((d) => d.district) ?? [] : []} value={selectedDistrict} onChange={setSelectedDistrict} disabled={!selectedRegion} placeholder={selectedRegion ? "Seleccionar distrito..." : "Selecciona región primero"} />
                </div>

                <SelectField label="Unidad Scout" options={ramas} value={ramaScout} onChange={setRamaScout} />

                <SectionDivider title="Datos de Contacto" icon={<Mail size={16} color={ENJ_NAVY} />} />
                <InputField label="Correo Electrónico" placeholder="maria@email.com" type="email" icon={<Mail size={16} />} value={correo} onChange={setCorreo} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Teléfono" placeholder="+58 412 000 0000" type="tel" icon={<Phone size={16} />} value={telefono} onChange={setTelefono} />
                  <InputField label="Estado / Ciudad" placeholder="Caracas, D.C." icon={<MapPin size={16} />} value={ciudad} onChange={setCiudad} />
                </div>

                <SectionDivider title={participantType === "adulto" ? "Datos del Adulto" : "Datos del Joven"} icon={<User size={16} color={ENJ_NAVY} />} />
                {participantType === "joven" ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <SelectField label="Unidad Actual" options={ramas} value={ramaActual} onChange={setRamaActual} />
                      <InputField label="Adulto de Unidad" placeholder="Prof. Carlos Rodríguez" value={adultoUnidad} onChange={setAdultoUnidad} />
                    </div>
                    <InputField label="Año de Registro" placeholder="2026" value={anioRegistro} onChange={setAnioRegistro} />
                    <InputField label="Talla de Uniforme" placeholder="M / L / XL" value={tallaUniforme} onChange={setTallaUniforme} />
                  </>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <InputField label="Cargo o Rol que Ocupan" placeholder="Ej. Dirigente" value={cargoAdulto} onChange={setCargoAdulto} />
                    <InputField label="Área a la que pertenecen" placeholder="Ej. Tropa" value={areaAdulto} onChange={setAreaAdulto} />
                  </div>
                )}

                <SectionDivider title="Expediente Digital (Archivos)" icon={<GoogleDriveIcon size={16} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>Foto del Participante</p>
                    <FileDropzone label="Subir foto" sublabel="JPG o PNG · Fondo blanco" accept=".jpg,.jpeg,.png" icon={<GoogleDriveIcon size={24} />} onFileSelect={setFotoParticipante} />
                    {fotoParticipante && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {fotoParticipante.name}</p>}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>Screenshot Ficha Médica</p>
                    <FileDropzone label="Subir screenshot" sublabel="PNG o JPG" accept=".jpg,.jpeg,.png" icon={<GoogleDriveIcon size={24} />} onFileSelect={setScreenshotMedica} />
                    {screenshotMedica && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {screenshotMedica.name}</p>}
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", border: "1.5px solid rgba(0,11,111,0.12)", borderRadius: 12, padding: 16 }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>Acuerdo de Convivencia oficial:</p>
                  <div style={{ height: 100, overflowY: "scroll", background: "#fff", border: "1px solid rgba(0,11,111,0.08)", borderRadius: 8, padding: 12, fontSize: 12, color: "rgba(0,11,111,0.7)", textAlign: "justify" }}>
                    <strong>1. Participación:</strong> Asistencia del 100% a Mesas Técnicas. Lenguaje formal. Cámaras obligatorias.<br />
                    <strong>2. Instalaciones:</strong> San Juan de los Morros. Prohibido ruidos en pasillos o daños.<br />
                    <strong>3. Seguridad:</strong> Política Salvo del Peligro activa. Cero tolerancia al acoso.<br />
                    <strong>4. Documentación:</strong> Obligatorio portar Ficha Médica original.
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, cursor: "pointer", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>
                    <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                    He leído y acepto los términos del Acuerdo de Convivencia
                  </label>
                </div>

                <button type="submit" disabled={loading} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>
                  {loading ? "Creando Expediente Drive..." : "Enviar Registro de Inscripción"}
                </button>
              </form>
            </div>
          </>
        )}

        {/* MODO B: CONTROL Y LIQUIDACIÓN DE CUOTAS */}
        {viewMode === "cuotas" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
            <form onSubmit={handleCuotasSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <SectionDivider title="Datos del Scout Enlazado" icon={<User size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Nombre del Participante" placeholder="" value={nombre ? `${nombre} ${apellido}` : "Cargando..."} disabled required={false} />
                <InputField label="Cédula de Identidad" placeholder="" value={cedula} disabled required={false} />
              </div>

              <SectionDivider title="Información de la Cuota" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SelectField
                  label="¿Qué cuota estás pagando?"
                  options={["Cuota Inicial (Inscripción)", "Segunda Cuota", "Tercera Cuota", "Cuota Final / Saldo Total"]}
                  value={numCuota}
                  onChange={setNumCuota}
                />
                <SelectField
                  label="Método de Pago"
                  options={["Pago Móvil", "Transferencia Bancaria", "Zelle", "Efectivo"]}
                  value={metodoPago}
                  onChange={setMetodoPago}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Referencia / Confirmación" placeholder="REF-2026-XXXXX" icon={<Hash size={16} />} value={referenciaPago} onChange={setReferenciaPago} />
                <InputField label="Monto Pagado (USD)" placeholder="0" type="number" icon={<CreditCard size={16} />} value={montoPagado} onChange={setMontoPagado} />
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>
                  Comprobante de Pago (Se guardará en tu Drive)
                </p>
                <FileDropzone
                  label="Subir comprobante"
                  sublabel="PDF, JPG o PNG · Máx. 5MB"
                  accept=".pdf,.jpg,.jpeg,.png"
                  icon={<GoogleDriveIcon size={24} />}
                  onFileSelect={(file) => setComprobantePago(file)}
                />
                {comprobantePago && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {comprobantePago.name}</p>}
              </div>

              <button type="submit" disabled={loading} style={{ background: ENJ_MAGENTA, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 10, boxShadow: "0 8px 24px rgba(215,0,126,0.2)" }}>
                {loading ? "Subiendo Archivo a Drive..." : "Registrar Cuota y Subir Archivo"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
