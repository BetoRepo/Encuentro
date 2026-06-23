import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropzone } from "../components/FileDropzone";
import { GoogleDriveIcon } from "../components/GoogleDriveIcon";
import { CheckCircle2, User, Shield, CreditCard, Phone, Mail, MapPin, Hash, ChevronDown, ArrowLeft, HeartPulse, Building } from "lucide-react";

// 🚀 RUTA CORREGIDA: Subimos dos niveles hasta 'src/' y apuntamos a 'supabaseClient'
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

const SUPABASE_FUNCTION_URL = "https://ikiqphxigtwkjhiachqg.supabase.co/functions/v1/manage-drive";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraXFwaHhpZ3R3a2poaWFjaHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTQ1NDIsImV4cCI6MjA5NjU3MDU0Mn0.s8QdkpqOihtanulS1okUkT3g1YCOPXxeOjrf67pZsio";

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
const tiposSangre = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "No lo sé"];

function InputField({ label, placeholder, type = "text", icon, required = true, value, onChange, disabled = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)", display: "flex", pointerEvents: "none" }}>{icon}</div>}
        <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.currentTarget.value)} disabled={disabled} required={required} style={{ width: "100%", padding: icon ? "11px 14px 11px 40px" : "11px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", background: disabled ? "#F4F5FA" : "#FAFBFF", fontFamily: "Inter, sans-serif", fontSize: 14, color: disabled ? "rgba(0,11,111,0.5)" : "#0D0D2B", outline: "none", boxSizing: "border-box" }} />
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange, placeholder = "Seleccionar...", required = true, disabled = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <select value={value} onChange={(e) => onChange?.(e.currentTarget.value)} disabled={disabled} required={required} style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", background: disabled ? "#F4F5FA" : "#FAFBFF", fontFamily: "Inter, sans-serif", fontSize: 14, color: disabled ? "rgba(0,11,111,0.35)" : "#0D0D2B", outline: "none", appearance: "none", cursor: disabled ? "not-allowed" : "pointer", boxSizing: "border-box" }}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 4px" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,11,111,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.09em" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,11,111,0.1)" }} />
    </div>
  );
}

function BankDetailsCard() {
  return (
    <div style={{ background: "#F4F6FB", border: "1.5px dashed rgba(0,11,111,0.2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: 13, color: ENJ_NAVY, fontWeight: 700 }}>Datos para Transferencia Bancaria</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "rgba(0,11,111,0.7)" }}>
        <div><strong>Banco:</strong> Banesco</div>
        <div><strong>RIF:</strong> J-12345678-9</div>
        <div style={{ gridColumn: "1 / -1" }}><strong>Cuenta:</strong> 0134-0000-0000-0000-0000</div>
        <div style={{ gridColumn: "1 / -1" }}><strong>Titular:</strong> Asociación de Scouts de Venezuela</div>
      </div>
    </div>
  );
}

export function Inscripcion() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"inscripcion" | "cuotas" | "exito" | "error_pantalla">("inscripcion");
  const [errorMessageStr, setErrorMessageStr] = useState("");
  const [participantType, setParticipantType] = useState<"joven" | "adulto">("joven");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [tallaUniforme, setTallaUniforme] = useState("");
  const [direccion, setDireccion] = useState("");

  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  const [tipoSangre, setTipoSangre] = useState("");
  const [alergias, setAlergias] = useState("");
  const [enfermedades, setEnfermedades] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [grupoScout, setGrupoScout] = useState("");
  const [ramaScout, setRamaScout] = useState("");
  const [adultoUnidad, setAdultoUnidad] = useState("");
  const [cargoAdulto, setCargoAdulto] = useState("");
  const [areaAdulto, setAreaAdulto] = useState("");

  const [fechaPago, setFechaPago] = useState("");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [montoBs, setMontoBs] = useState("");
  const [tasa, setTasa] = useState("");
  const [numCuota, setNumCuota] = useState("Segunda Cuota");

  const [cedulaDirecta, setCedulaDirecta] = useState("");
  const [folderIdDirecto, setFolderIdDirecto] = useState("");

  const [fotoParticipante, setFotoParticipante] = useState<any>(null);
  const [screenshotMedica, setScreenshotMedica] = useState<any>(null);
  const [comprobantePago, setComprobantePago] = useState<any>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [userDriveFolderId, setUserDriveFolderId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // AUTO-RECONOCIMIENTO DEL USUARIO LOGUEADO
  // ==========================================
  useEffect(() => {
    async function comprobarRegistroExistente() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setCorreo(user.email || "");

          // Búsqueda limpia y segura en Supabase
          const { data: participante } = await supabase
            .from("participantes")
            .select("*")
            .eq("correo", user.email)
            .maybeSingle();

          if (participante) {
            setNombre(participante.nombre || "");
            setApellido(participante.apellido || "");
            setCedula(participante.cedula || "");
            setUserDriveFolderId(participante.drive_folder_id || "");
            setViewMode("cuotas");
          }
        }
      } catch (err) {
        console.warn("Estado de sesión limpio:", err);
      }
    }
    comprobarRegistroExistente();
  }, []);

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

  const extractNativeFile = (fileValue: any): File | null => {
    if (!fileValue) return null;
    if (fileValue instanceof File) return fileValue;
    if (fileValue.file instanceof File) return fileValue.file;
    if (fileValue.target?.files?.[0]) return fileValue.target.files[0];
    return null;
  };

  async function handleInscriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms) return alert("Debe leer y aceptar el acuerdo de convivencia.");
    
    const cleanPago = extractNativeFile(comprobantePago);
    if (!cleanPago) return alert("Debe adjuntar el comprobante de la cuota inicial de forma válida.");
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const folderName = `${cedula.trim()} - ${nombre.trim()} ${apellido.trim()}`;
      const folderForm = new FormData();
      folderForm.append("action", "create_folder");
      folderForm.append("folder_name", folderName);

      const driveResponse = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: folderForm,
      });
      
      if (!driveResponse.ok) throw new Error("Error creando carpeta en el servidor de Google Drive.");

      const driveData = await driveResponse.json();
      const generatedFolderId = driveData.folderId;
      setUserDriveFolderId(generatedFolderId);

      const { error: partError } = await supabase
        .from("participantes")
        .upsert([{
          cedula: cedula.trim(),
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          fecha_nacimiento: birthDate,
          talla_uniforme: tallaUniforme,
          direccion: direccion,
          correo: correo.trim() || user?.email,
          telefono: telefono,
          tipo_sangre: tipoSangre,
          alergias: alergias,
          enfermedades: enfermedades,
          medicamentos: medicamentos,
          contacto_emergencia: contactoEmergencia,
          region: selectedRegion,
          distrito: selectedDistrict,
          grupo_scout: grupoScout,
          rama: ramaScout,
          tipo_participante: participantType,
          drive_folder_id: generatedFolderId,
          id_usuario: user?.id || null
        }], { onConflict: 'cedula' });

      if (partError) throw new Error(`Error guardando participante: ${partError.message}`);

      const { error: pagoError } = await supabase
        .from("pagos")
        .insert([{
          cedula_participante: cedula.trim(),
          numero_cuota: "Cuota Inicial",
          monto_bs: parseFloat(montoBs) || 0,
          referencia: referenciaPago.trim(),
          fecha_pago: fechaPago || new Date().toISOString().split('T')[0],
          tasa_cambio: parseFloat(tasa) || 1
        }]);

      if (pagoError) throw new Error(`Error guardando pago inicial: ${pagoError.message}`);

      const uploadFile = async (nativeFile: File, name: string) => {
        const fileForm = new FormData();
        fileForm.append("action", "upload_file");
        fileForm.append("folder_id", generatedFolderId);
        fileForm.append("file", nativeFile, nativeFile.name);
        fileForm.append("custom_name", name);
        await fetch(SUPABASE_FUNCTION_URL, { method: "POST", headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }, body: fileForm });
      };

      const cleanFoto = extractNativeFile(fotoParticipante);
      const cleanMedica = extractNativeFile(screenshotMedica);

      if (cleanFoto) await uploadFile(cleanFoto, `Foto_Perfil_${cedula}`);
      if (cleanMedica) await uploadFile(cleanMedica, `Ficha_Medica_${cedula}`);
      await uploadFile(cleanPago, `Comprobante_Inicial_${cedula}`);

      setComprobantePago(null);
      setFechaPago("");
      setReferenciaPago("");
      setMontoBs("");
      setTasa("");

      setViewMode("cuotas");
    } catch (err: any) {
      setErrorMessageStr(err.message || String(err));
      setViewMode("error_pantalla");
    } finally {
      setLoading(false);
    }
  }

  async function handleCuotasSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanPago = extractNativeFile(comprobantePago);
    if (!cleanPago) return alert("Por favor, adjunta el comprobante de esta cuota de forma válida.");
    
    const finalFolderId = userDriveFolderId || folderIdDirecto;
    const finalCedula = cedula || cedulaDirecta;

    if (!finalFolderId) return alert("Por favor, introduce tu ID de carpeta Drive o completa tu inscripción.");

    setLoading(true);

    try {
      const { error: pagoExtraError } = await supabase
        .from("pagos")
        .insert([{
          cedula_participante: finalCedula.trim(),
          numero_cuota: numCuota,
          monto_bs: parseFloat(montoBs) || 0,
          referencia: referenciaPago.trim(),
          fecha_pago: fechaPago || new Date().toISOString().split('T')[0],
          tasa_cambio: parseFloat(tasa) || 1
        }]);

      if (pagoExtraError) throw new Error(`Error registrando cuota en base de datos: ${pagoExtraError.message}`);

      const fileForm = new FormData();
      fileForm.append("action", "upload_file");
      fileForm.append("folder_id", finalFolderId); 
      fileForm.append("file", cleanPago, cleanPago.name);
      fileForm.append("custom_name", `Comprobante_${numCuota.replace(/\s+/g, "_")}_${finalCedula}`);

      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: fileForm,
      });

      if (!res.ok) throw new Error("Error cargando el archivo de pago en Google Drive.");

      setViewMode("exito");
    } catch (err: any) {
      setErrorMessageStr(err.message || String(err));
      setViewMode("error_pantalla");
    } finally {
      setLoading(false);
    }
  }

  if (viewMode === "error_pantalla") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(215,0,126,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
            <span style={{ fontSize: 32, color: ENJ_MAGENTA, fontWeight: "bold" }}>⚠️</span>
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>Error de Configuración</h2>
          <div style={{ background: "#FDF2F4", border: `1px solid ${ENJ_MAGENTA}`, borderRadius: 10, padding: 16, margin: "16px 0 24px", textAlign: "left" }}>
            <p style={{ margin: 0, color: "#9F1239", fontSize: 14, fontFamily: "monospace", wordBreak: "break-word" }}>{errorMessageStr}</p>
          </div>
          <button onClick={() => setViewMode("inscripcion")} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: ENJ_NAVY, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === "exito") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
            <CheckCircle2 size={42} color="#22c55e" />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>¡Reporte Guardado!</h2>
          <p style={{ margin: "0 0 28px", color: "rgba(0,11,111,0.6)", fontSize: 15, lineHeight: 1.7 }}>Tu cuota y su comprobante se han actualizado con éxito en Google Drive y el sistema general.</p>
          <button onClick={() => navigate("/")} style={{ padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${ENJ_NAVY}`, background: "transparent", color: ENJ_NAVY, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Terminar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F0F2FA", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <button type="button" onClick={() => viewMode === "cuotas" ? setViewMode("inscripcion") : navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.6)", fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> {viewMode === "cuotas" ? "Regresar al formulario principal" : "Volver al inicio"}
          </button>

          {viewMode === "inscripcion" && (
            <button type="button" onClick={() => setViewMode("cuotas")} style={{ background: ENJ_MAGENTA, color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Reportar Siguiente Cuota ➜
            </button>
          )}
        </div>

        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 100, textTransform: "uppercase" }}>ENJ 2026</span>
          <h1 style={{ margin: "16px 0 10px", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: ENJ_NAVY }}>
            {viewMode === "inscripcion" ? "Inscripción Oficial" : "Registro de Cuotas Adicionales"}
          </h1>
          {viewMode === "cuotas" && cedula && (
            <p style={{ color: ENJ_MAGENTA, fontWeight: 700, margin: 0 }}>Expediente Reconocido: {nombre} {apellido} (CI: {cedula})</p>
          )}
        </div>

        {viewMode === "inscripcion" && (
          <>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 30 }}>
              {[{ label: "Joven", value: "joven" }, { label: "Adulto", value: "adulto" }].map((option) => (
                <button key={option.value} type="button" onClick={() => setParticipantType(option.value as "joven" | "adulto")} style={{ borderRadius: 999, border: `1.5px solid ${participantType === option.value ? ENJ_MAGENTA : "rgba(0,11,111,0.18)"}`, background: participantType === option.value ? ENJ_MAGENTA : "#fff", color: participantType === option.value ? "#fff" : ENJ_NAVY, padding: "12px 28px", cursor: "pointer", fontWeight: 700 }}>
                  {option.label}
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
              <form onSubmit={handleInscriptionSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <SectionDivider title="Datos Personales" icon={<User size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Nombre(s)" placeholder="Ej. María" value={nombre} onChange={setNombre} />
                  <InputField label="Apellido(s)" placeholder="Ej. González" value={apellido} onChange={setApellido} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Cédula de Identidad" placeholder="V-12.345.678" icon={<Hash size={16} />} value={cedula} onChange={setCedula} />
                  <InputField label="Fecha de Nacimiento" type="date" value={birthDate} onChange={(value: string) => { setBirthDate(value); setAge(calculateAge(value)); }} />
                </div>
                {age !== null && <p style={{ margin: "0", fontSize: 13, color: "rgba(0,11,111,0.65)", fontWeight: 600 }}>Edad calculada: {age} años</p>}
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Talla de Uniforme" placeholder="Ej. M, L" value={tallaUniforme} onChange={setTallaUniforme} />
                  <InputField label="Dirección de Habitación" placeholder="Av / Calle" icon={<MapPin size={16} />} value={direccion} onChange={setDireccion} />
                </div>

                <SectionDivider title="Datos de Contacto" icon={<Phone size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Correo Electrónico" type="email" icon={<Mail size={16} />} value={correo} onChange={setCorreo} disabled={true} />
                  <InputField label="Teléfono (WhatsApp)" type="tel" icon={<Phone size={16} />} value={telefono} onChange={setTelefono} />
                </div>

                <SectionDivider title="Ficha Médica Básica" icon={<HeartPulse size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelectField label="Tipo de Sangre" options={tiposSangre} value={tipoSangre} onChange={setTipoSangre} />
                  <InputField label="Alergias Conocidas" required={false} value={alergias} onChange={setAlergias} />
                  <InputField label="Enfermedades o Condiciones" required={false} value={enfermedades} onChange={setEnfermedades} />
                  <InputField label="Medicamentos actuales" required={false} value={medicamentos} onChange={setMedicamentos} />
                </div>
                <InputField label="Contacto de Emergencia" value={contactoEmergencia} onChange={setContactoEmergencia} />

                <SectionDivider title="Credenciales Scouts" icon={<Shield size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelectField label="Región Scout" options={scoutRegions.map(r => r.region)} value={selectedRegion} onChange={(val: string) => { setSelectedRegion(val); setSelectedDistrict(""); }} />
                  <SelectField label="Distrito Scout" options={selectedRegion ? scoutRegions.find(r => r.region === selectedRegion)?.districts.map(d => d.district) ?? [] : []} value={selectedDistrict} onChange={setSelectedDistrict} disabled={!selectedRegion} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Grupo Scout" placeholder="Ej. Mafeking" icon={<Building size={16} />} value={grupoScout} onChange={setGrupoScout} />
                  <SelectField label="Unidad Scout" options={ramas} value={ramaScout} onChange={setRamaScout} />
                </div>
                {participantType === "joven" ? (
                  <InputField label="Adulto de Unidad" value={adultoUnidad} onChange={setAdultoUnidad} />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <InputField label="Cargo o Rol" value={cargoAdulto} onChange={setCargoAdulto} />
                    <InputField label="Área" value={areaAdulto} onChange={setAreaAdulto} />
                  </div>
                )}

                <SectionDivider title="Cuota Inicial (Inscripción)" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
                <BankDetailsCard />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Fecha del Pago" type="date" value={fechaPago} onChange={setFechaPago} />
                  <InputField label="Nro. Referencia (6 dígitos)" icon={<Hash size={16} />} value={referenciaPago} onChange={setReferenciaPago} />
                  <InputField label="Monto transferido (Bs)" type="number" value={montoBs} onChange={setMontoBs} />
                  <InputField label="Tasa de cambio aplicada" type="number" value={tasa} onChange={setTasa} />
                </div>

                <SectionDivider title="Expediente Digital" icon={<GoogleDriveIcon size={16} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY }}>Foto del Participante *</p>
                    <FileDropzone label="Subir foto" accept=".jpg,.jpeg,.png" onFileSelect={setFotoParticipante} />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY }}>Comprobante Cuota Inicial *</p>
                    <FileDropzone label="Subir pago" accept=".jpg,.jpeg,.png,.pdf" onFileSelect={setComprobantePago} />
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: ENJ_NAVY, fontWeight: 600 }}>
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                  He leído y acepto los términos del Acuerdo de Convivencia.
                </label>

                <button type="submit" disabled={loading} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  {loading ? "Procesando inscripción..." : "Finalizar Inscripción y Guardar"}
                </button>
              </form>
            </div>
          </>
        )}

        {viewMode === "cuotas" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
            <form onSubmit={handleCuotasSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {!userDriveFolderId && (
                <>
                  <SectionDivider title="Identificación del Expediente" icon={<User size={16} color={ENJ_NAVY} />} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <InputField label="Cédula del Participante" placeholder="Ej. V-12345678" value={cedulaDirecta} onChange={setCedulaDirecta} />
                    <InputField label="ID de Carpeta Google Drive" placeholder="ID enviado a tu correo" value={folderIdDirecto} onChange={setFolderIdDirecto} />
                  </div>
                </>
              )}

              <SectionDivider title="Registrar Siguiente Cuota" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
              <BankDetailsCard />

              <SelectField label="¿Qué cuota estás reportando?" options={["Segunda Cuota", "Tercera Cuota / Saldo Final"]} value={numCuota} onChange={setNumCuota} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Fecha del Pago" type="date" value={fechaPago} onChange={setFechaPago} />
                <InputField label="Nro. Referencia" icon={<Hash size={16} />} value={referenciaPago} onChange={setReferenciaPago} />
                <InputField label="Monto transferido (Bs)" type="number" value={montoBs} onChange={setMontoBs} />
                <InputField label="Tasa de cambio" type="number" value={tasa} onChange={setTasa} />
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY }}>Comprobante de Pago *</p>
                <FileDropzone label="Subir comprobante" accept=".pdf,.jpg,.jpeg,.png" onFileSelect={setComprobantePago} />
              </div>

              <button type="submit" disabled={loading} style={{ background: ENJ_MAGENTA, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {loading ? "Sincronizando pago..." : "Registrar Cuota Extra"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}