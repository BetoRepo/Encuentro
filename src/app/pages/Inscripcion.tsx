import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropzone } from "../components/FileDropzone";
import { GoogleDriveIcon } from "../components/GoogleDriveIcon";
import { CheckCircle2, User, Shield, CreditCard, Phone, Mail, MapPin, Hash, ChevronDown, ArrowLeft, HeartPulse, Building } from "lucide-react";

// ⚠️ DESCOMENTA esta línea para importar tu cliente de Supabase real si lo usas:
// import { supabase } from "../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

// ✅ URL DE PRODUCCIÓN Y LLAVE DE ACCESO
const SUPABASE_FUNCTION_URL = "https://ikiqphxigtwkjhiachqg.supabase.co/functions/v1/manage-drive";
// 👇 PEGA AQUÍ TU "anon key" DE SUPABASE PARA QUE NO TE DE ERROR EL SERVIDOR 👇
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
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, letterSpacing: "0.01em" }}>
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
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, letterSpacing: "0.01em" }}>
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

  const [viewMode, setViewMode] = useState<"inscripcion" | "cuotas" | "exito">("inscripcion");
  const [participantType, setParticipantType] = useState<"joven" | "adulto">("joven");

  // 1. DATOS PERSONALES
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [tallaUniforme, setTallaUniforme] = useState("");
  const [direccion, setDireccion] = useState("");

  // 2. CONTACTO
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  // 3. FICHA MEDICA BASICA
  const [tipoSangre, setTipoSangre] = useState("");
  const [alergias, setAlergias] = useState("");
  const [enfermedades, setEnfermedades] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");

  // 4. CREDENCIALES SCOUTS
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [grupoScout, setGrupoScout] = useState("");
  const [ramaScout, setRamaScout] = useState("");
  const [adultoUnidad, setAdultoUnidad] = useState("");
  const [cargoAdulto, setCargoAdulto] = useState("");
  const [areaAdulto, setAreaAdulto] = useState("");

  // 5. PAGO INICIAL
  const [fechaPago, setFechaPago] = useState("");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [montoBs, setMontoBs] = useState("");
  const [tasa, setTasa] = useState("");
  const [numCuota, setNumCuota] = useState("Segunda Cuota");

  // ARCHIVOS
  const [fotoParticipante, setFotoParticipante] = useState<File | null>(null);
  const [screenshotMedica, setScreenshotMedica] = useState<File | null>(null);
  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // CONTROL INTERNO
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userDriveFolderId, setUserDriveFolderId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentUserId("ID_USUARIO_LOGUEADO_TEMPORAL");
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

  // ACCIÓN 1: PROCESAR REGISTRO INICIAL (Incluye el 1er pago)
  async function handleInscriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms) return alert("Debe leer y aceptar el acuerdo de convivencia.");
    if (!comprobantePago) return alert("Debe adjuntar el comprobante de la cuota inicial.");
    if (!currentUserId) return alert("No se detectó una sesión activa. Por favor, reingresa.");
    setLoading(true);

    try {
      // A. Crear Carpeta en Drive asegurando método POST explícito
      const folderName = `${cedula.trim()} - ${nombre.trim()} ${apellido.trim()}`;
      const folderForm = new FormData();
      folderForm.append("action", "create_folder");
      folderForm.append("folder_name", folderName);

      const driveResponse = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: folderForm,
      });
      
      if (!driveResponse.ok) {
        const errorText = await driveResponse.text();
        throw new Error(`Respuesta del servidor (${driveResponse.status}): ${errorText}`);
      }

      const driveData = await driveResponse.json();
      
      if (driveData && driveData.error) {
        throw new Error(`Error devuelto por la función de Drive: ${driveData.error}`);
      }

      if (!driveData || !driveData.folderId) {
        throw new Error(`El servidor respondió correctamente pero no generó un ID de carpeta válido. Datos: ${JSON.stringify(driveData)}`);
      }

      const generatedFolderId = driveData.folderId;
      setUserDriveFolderId(generatedFolderId);

      // B. Subir archivos asíncronamente con POST explícito
      const uploadFile = async (file: File, name: string) => {
        const fileForm = new FormData();
        fileForm.append("action", "upload_file");
        fileForm.append("folder_id", generatedFolderId);
        // ✅ SOLUCIÓN: Pasamos file.name explícitamente como 3er argumento para que el Servidor detecte los bytes correctamente.
        fileForm.append("file", file, file.name); 
        fileForm.append("custom_name", name);
        
        const res = await fetch(SUPABASE_FUNCTION_URL, { 
          method: "POST", 
          headers: { 
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: fileForm 
        });

        if (!res.ok) {
          const textErr = await res.text();
          throw new Error(`Error subiendo el archivo "${name}": ${textErr}`);
        }
        return res;
      };

      if (fotoParticipante) await uploadFile(fotoParticipante, `Foto_Perfil_${cedula}`);
      if (screenshotMedica) await uploadFile(screenshotMedica, `Ficha_Medica_${cedula}`);
      await uploadFile(comprobantePago, `Comprobante_Inicial_${cedula}`);

      setViewMode("exito");
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
      const fileForm = new FormData();
      fileForm.append("action", "upload_file");
      fileForm.append("folder_id", userDriveFolderId); 
      // ✅ SOLUCIÓN: Pasamos file.name explícitamente aquí también.
      fileForm.append("file", comprobantePago, comprobantePago.name);
      fileForm.append("custom_name", `Comprobante_${numCuota.replace(/\s+/g, "_")}_${cedula}`);

      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: fileForm,
      });

      if (!res.ok) {
        const textErr = await res.text();
        throw new Error(`Error en el canal de subida al servidor: ${textErr}`);
      }

      setViewMode("exito");
    } catch (err: any) {
      alert(`Error procesando el pago: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  // (El resto de la interfaz visual e idéntica se mantiene intacto debajo...)
  if (viewMode === "exito") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
            <CheckCircle2 size={42} color="#22c55e" />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>¡Proceso Exitoso!</h2>
          <p style={{ margin: "0 0 28px", color: "rgba(0,11,111,0.6)", fontSize: 15, lineHeight: 1.7 }}>
            Tus datos y comprobante han sido guardados de manera segura en tu expediente digital.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
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

        <button type="button" onClick={() => viewMode === "cuotas" ? setViewMode("inscripcion") : navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.6)", fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 32 }}>
          <ArrowLeft size={16} />
          {viewMode === "cuotas" ? "Regresar al formulario principal" : "Volver al inicio"}
        </button>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            ENJ 2026 · Guárico
          </span>
          <h1 style={{ margin: "16px 0 10px", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
            {viewMode === "inscripcion" ? "Inscripción Oficial" : "Registro de Cuotas Adicionales"}
          </h1>
        </div>

        {/* MODO A: FORMULARIO COMPLETO + CUOTA INICIAL */}
        {viewMode === "inscripcion" && (
          <>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 30, flexWrap: "wrap" }}>
              {[{ label: "Joven", value: "joven" }, { label: "Adulto", value: "adulto" }].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setParticipantType(option.value as "joven" | "adulto")}
                  style={{ borderRadius: 999, border: `1.5px solid ${participantType === option.value ? ENJ_MAGENTA : "rgba(0,11,111,0.18)"}`, background: participantType === option.value ? ENJ_MAGENTA : "#fff", color: participantType === option.value ? "#fff" : ENJ_NAVY, padding: "12px 28px", cursor: "pointer", fontWeight: 700 }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
              <form onSubmit={handleInscriptionSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* 1. DATOS PERSONALES */}
                <SectionDivider title={`Datos Personales (${participantType === 'joven' ? 'Joven' : 'Adulto'})`} icon={<User size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Nombre(s)" placeholder="Ej. María" value={nombre} onChange={setNombre} />
                  <InputField label="Apellido(s)" placeholder="Ej. González" value={apellido} onChange={setApellido} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Cédula de Identidad" placeholder="V-12.345.678" icon={<Hash size={16} />} value={cedula} onChange={setCedula} />
                  <InputField label="Fecha de Nacimiento" placeholder="dd/mm/aaaa" type="date" value={birthDate} onChange={(value: string) => { setBirthDate(value); setAge(calculateAge(value)); }} />
                </div>
                {age !== null && <p style={{ margin: "0", fontSize: 13, color: "rgba(0,11,111,0.65)", fontWeight: 600 }}>Edad calculada: {age} años</p>}
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Talla de Uniforme" placeholder="Ej. M, L, XL" value={tallaUniforme} onChange={setTallaUniforme} />
                  <InputField label="Dirección de Habitación" placeholder="Av / Calle / Zona" icon={<MapPin size={16} />} value={direccion} onChange={setDireccion} />
                </div>

                {/* 2. CONTACTO */}
                <SectionDivider title="Datos de Contacto" icon={<Phone size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Correo Electrónico" placeholder="usuario@email.com" type="email" icon={<Mail size={16} />} value={correo} onChange={setCorreo} />
                  <InputField label="Teléfono (WhatsApp)" placeholder="+58 412 000 0000" type="tel" icon={<Phone size={16} />} value={telefono} onChange={setTelefono} />
                </div>

                {/* 3. FICHA MÉDICA BÁSICA */}
                <SectionDivider title="Ficha Médica Básica" icon={<HeartPulse size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelectField label="Tipo de Sangre" options={tiposSangre} value={tipoSangre} onChange={setTipoSangre} />
                  <InputField label="Alergias Conocidas" placeholder="Ninguna, o especifique..." required={false} value={alergias} onChange={setAlergias} />
                  <InputField label="Enfermedades o Condiciones" placeholder="Asma, diabetes, etc..." required={false} value={enfermedades} onChange={setEnfermedades} />
                  <InputField label="Medicamentos actuales" placeholder="Dosis y frecuencia..." required={false} value={medicamentos} onChange={setMedicamentos} />
                </div>
                <InputField label="Contacto de Emergencia" placeholder="Nombre completo y número de teléfono" required={true} value={contactoEmergencia} onChange={setContactoEmergencia} />

                {/* 4. CREDENCIALES SCOUTS */}
                <SectionDivider title="Credenciales Scouts" icon={<Shield size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelectField label="Región Scout" options={scoutRegions.map(r => r.region)} value={selectedRegion} onChange={(val: string) => { setSelectedRegion(val); setSelectedDistrict(""); }} />
                  <SelectField label="Distrito Scout" options={selectedRegion ? scoutRegions.find(r => r.region === selectedRegion)?.districts.map(d => d.district) ?? [] : []} value={selectedDistrict} onChange={setSelectedDistrict} disabled={!selectedRegion} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Grupo Scout" placeholder="Ej. Mafeking 14" icon={<Building size={16} />} value={grupoScout} onChange={setGrupoScout} />
                  <SelectField label="Unidad Scout" options={ramas} value={ramaScout} onChange={setRamaScout} />
                </div>
                
                {participantType === "joven" ? (
                  <InputField label="Adulto de Unidad" placeholder="Nombre del dirigente responsable" value={adultoUnidad} onChange={setAdultoUnidad} />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <InputField label="Cargo o Rol" placeholder="Ej. Dirigente, JdG" value={cargoAdulto} onChange={setCargoAdulto} />
                    <InputField label="Área a la que pertenece" placeholder="Ej. Tropa" value={areaAdulto} onChange={setAreaAdulto} />
                  </div>
                )}

                {/* 5. PAGO INICIAL */}
                <SectionDivider title="Cuota Inicial (Inscripción)" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
                <BankDetailsCard />
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Fecha del Pago" type="date" value={fechaPago} onChange={setFechaPago} />
                  <InputField label="Nro. Referencia (Últimos 6 dígitos)" placeholder="123456" icon={<Hash size={16} />} value={referenciaPago} onChange={setReferenciaPago} />
                  <InputField label="Monto transferido (Bs)" placeholder="0.00" type="number" value={montoBs} onChange={setMontoBs} />
                  <InputField label="Tasa de cambio aplicada" placeholder="0.00" type="number" value={tasa} onChange={setTasa} />
                </div>

                {/* ARCHIVOS DIGITALES */}
                <SectionDivider title="Expediente Digital" icon={<GoogleDriveIcon size={16} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>Foto del Participante *</p>
                    <FileDropzone label="Subir foto" sublabel="Fondo blanco" accept=".jpg,.jpeg,.png" icon={<GoogleDriveIcon size={24} />} onChange={setFotoParticipante} />
                    {fotoParticipante && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {fotoParticipante.name}</p>}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>Comprobante Cuota Inicial *</p>
                    <FileDropzone label="Subir pago" sublabel="PDF o Imágen" accept=".jpg,.jpeg,.png,.pdf" icon={<GoogleDriveIcon size={24} />} onChange={setComprobantePago} />
                    {comprobantePago && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {comprobantePago.name}</p>}
                  </div>
                </div>

                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>Ficha Médica Impeesa (Opcional si llenaste lo anterior)</p>
                  <FileDropzone label="Screenshot Ficha" sublabel="Imágen" accept=".jpg,.jpeg,.png" icon={<GoogleDriveIcon size={24} />} onChange={setScreenshotMedica} />
                  {screenshotMedica && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {screenshotMedica.name}</p>}
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, cursor: "pointer", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                  He leído y acepto los términos del Acuerdo de Convivencia oficial del evento.
                </label>

                <button type="submit" disabled={loading} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>
                  {loading ? "Procesando inscripción..." : "Finalizar Inscripción y Registrar Primer Pago"}
                </button>
              </form>
            </div>
          </>
        )}

        {/* MODO B: CONTROL Y LIQUIDACIÓN DE CUOTAS */}
        {viewMode === "cuotas" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
            <form onSubmit={handleCuotasSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <SectionDivider title="Registrar Siguiente Cuota" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
              <BankDetailsCard />

              <SelectField
                label="¿Qué cuota estás reportando?"
                options={["Segunda Cuota", "Tercera Cuota / Saldo Final"]}
                value={numCuota}
                onChange={setNumCuota}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Fecha del Pago" type="date" value={fechaPago} onChange={setFechaPago} />
                <InputField label="Nro. Referencia (Últimos 6)" placeholder="123456" icon={<Hash size={16} />} value={referenciaPago} onChange={setReferenciaPago} />
                <InputField label="Monto transferido (Bs)" placeholder="0.00" type="number" value={montoBs} onChange={setMontoBs} />
                <InputField label="Tasa de cambio aplicada" placeholder="0.00" type="number" value={tasa} onChange={setTasa} />
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase" }}>Comprobante de Pago *</p>
                <FileDropzone label="Subir comprobante" sublabel="PDF, JPG o PNG" accept=".pdf,.jpg,.jpeg,.png" icon={<GoogleDriveIcon size={24} />} onChange={setComprobantePago} />
                {comprobantePago && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {comprobantePago.name}</p>}
              </div>

              <button type="submit" disabled={loading} style={{ background: ENJ_MAGENTA, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>
                {loading ? "Subiendo Archivo a Drive..." : "Registrar Cuota y Subir Archivo"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}