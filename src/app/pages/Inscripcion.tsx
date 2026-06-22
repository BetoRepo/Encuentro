import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropzone } from "../components/FileDropzone";
import { GoogleDriveIcon } from "../components/GoogleDriveIcon";
import { CheckCircle2, User, Shield, CreditCard, Phone, Mail, MapPin, Hash, ChevronDown, ArrowLeft, HeartPulse, Building } from "lucide-react";

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
        <input 
          type={type} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.currentTarget.value)} disabled={disabled} required={required} 
          style={{ width: "100%", padding: icon ? "11px 14px 11px 40px" : "11px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", background: disabled ? "#F4F5FA" : "#FAFBFF", fontFamily: "Inter, sans-serif", fontSize: 14, color: disabled ? "rgba(0,11,111,0.5)" : "#0D0D2B", outline: "none", boxSizing: "border-box" }} 
        />
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
        <select 
          value={value} onChange={(e) => onChange?.(e.currentTarget.value)} disabled={disabled} required={required} 
          style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", background: disabled ? "#F4F5FA" : "#FAFBFF", fontFamily: "Inter, sans-serif", fontSize: 14, color: disabled ? "rgba(0,11,111,0.35)" : "#0D0D2B", outline: "none", appearance: "none", cursor: disabled ? "not-allowed" : "pointer", boxSizing: "border-box" }}
        >
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

  // Estados
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

  const [fotoParticipante, setFotoParticipante] = useState<any>(null);
  const [screenshotMedica, setScreenshotMedica] = useState<any>(null);
  const [comprobantePago, setComprobantePago] = useState<any>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [userDriveFolderId, setUserDriveFolderId] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  // Helper esencial para desenvolver archivos provenientes de FileDropzone[cite: 2]
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
    if (!cleanPago) return alert("Debe adjuntar el comprobante de la cuota inicial correctamente.");
    
    setLoading(true);

    try {
      // 1. Crear Carpeta
      const folderName = `${cedula.trim()} - ${nombre.trim()} ${apellido.trim()}`;
      const folderForm = new FormData();
      folderForm.append("action", "create_folder");
      folderForm.append("folder_name", folderName);

      const driveResponse = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: folderForm,
      });
      
      if (!driveResponse.ok) {
        throw new Error("Error creando carpeta en el servidor.");
      }

      const driveData = await driveResponse.json();
      const generatedFolderId = driveData.folderId;
      setUserDriveFolderId(generatedFolderId);

      // Función subida robusta
      const uploadFile = async (nativeFile: File, name: string) => {
        const fileForm = new FormData();
        fileForm.append("action", "upload_file");
        fileForm.append("folder_id", generatedFolderId);
        fileForm.append("file", nativeFile, nativeFile.name); // El nombre es obligatorio para Deno[cite: 2]
        fileForm.append("custom_name", name);
        
        const uploadRes = await fetch(SUPABASE_FUNCTION_URL, { 
          method: "POST", 
          headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
          body: fileForm 
        });

        if (!uploadRes.ok) throw new Error(`Fallo al subir: ${name}`);
      };

      // 2. Generar archivo de datos txt (como Objeto File Real)
      const dataContenido = `EXPEDIENTE ENJ 2026\n===================\nNombre: ${nombre} ${apellido}\nCédula: ${cedula}\nEdad: ${age}\nSangre: ${tipoSangre}\nAlergias: ${alergias || "N/A"}\nRegión: ${selectedRegion}\nDistrito: ${selectedDistrict}\nGrupo: ${grupoScout}\nPago Inicial: ${montoBs} Bs | Ref: ${referenciaPago}`;
      
      const datosFile = new File([dataContenido], "Datos_Inscripcion.txt", { type: "text/plain" });

      // 3. Extraer y subir archivos
      const cleanFoto = extractNativeFile(fotoParticipante);
      const cleanMedica = extractNativeFile(screenshotMedica);

      await uploadFile(datosFile, `Ficha_Datos_${cedula}.txt`);
      if (cleanFoto) await uploadFile(cleanFoto, `Foto_Perfil_${cedula}`);
      if (cleanMedica) await uploadFile(cleanMedica, `Ficha_Medica_${cedula}`);
      await uploadFile(cleanPago, `Comprobante_Inicial_${cedula}`);

      // 4. Limpiar datos de pago para la nueva vista y cambiar la pantalla
      setComprobantePago(null);
      setFechaPago("");
      setReferenciaPago("");
      setMontoBs("");
      setTasa("");
      
      // AL FIN, CAMBIAR A MODO CUOTAS
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
    if (!cleanPago) return alert("Adjunta un comprobante válido.");
    
    setLoading(true);

    try {
      const fileForm = new FormData();
      fileForm.append("action", "upload_file");
      fileForm.append("folder_id", userDriveFolderId); 
      fileForm.append("file", cleanPago, cleanPago.name);
      fileForm.append("custom_name", `Comprobante_${numCuota.replace(/\s+/g, "_")}_${cedula}`);

      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: fileForm,
      });

      if (!res.ok) throw new Error("Fallo al subir la cuota.");

      setViewMode("exito");
    } catch (err: any) {
      setErrorMessageStr(err.message || String(err));
      setViewMode("error_pantalla");
    } finally {
      setLoading(false);
    }
  }

  // --- VISTAS ---

  if (viewMode === "error_pantalla") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 520, width: "100%", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, color: ENJ_NAVY }}>⚠️ Ocurrió un error</h2>
          <p style={{ color: "#9F1239" }}>{errorMessageStr}</p>
          <button onClick={() => setViewMode("inscripcion")} style={{ padding: "12px 28px", background: ENJ_NAVY, color: "#fff", borderRadius: 10, border: "none", cursor: "pointer", marginTop: 20 }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === "exito") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 480, width: "100%", textAlign: "center" }}>
          <CheckCircle2 size={42} color="#22c55e" style={{ margin: "0 auto 20px" }} />
          <h2 style={{ margin: "0 0 12px", fontSize: 26, color: ENJ_NAVY }}>¡Todo Listo!</h2>
          <p style={{ margin: "0 0 28px", color: "rgba(0,11,111,0.6)" }}>Expediente actualizado correctamente.</p>
          <button onClick={() => navigate("/")} style={{ padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${ENJ_NAVY}`, background: "transparent", color: ENJ_NAVY, cursor: "pointer" }}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F0F2FA", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 100 }}>ENJ 2026</span>
          <h1 style={{ margin: "16px 0 10px", fontSize: 32, color: ENJ_NAVY }}>
            {viewMode === "inscripcion" ? "Inscripción Oficial" : "Registro de Cuotas"}
          </h1>
        </div>

        {viewMode === "inscripcion" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 40, boxShadow: "0 4px 40px rgba(0,0,0,0.05)" }}>
            <form onSubmit={handleInscriptionSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              <SectionDivider title="Datos Básicos" icon={<User size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Nombre" value={nombre} onChange={setNombre} />
                <InputField label="Apellido" value={apellido} onChange={setApellido} />
                <InputField label="Cédula" value={cedula} onChange={setCedula} />
                <InputField label="Fecha Nacimiento" type="date" value={birthDate} onChange={(v: string) => { setBirthDate(v); setAge(calculateAge(v)); }} />
              </div>
              
              <SectionDivider title="Credenciales" icon={<Shield size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SelectField label="Región" options={scoutRegions.map(r => r.region)} value={selectedRegion} onChange={(v: string) => { setSelectedRegion(v); setSelectedDistrict(""); }} />
                <SelectField label="Distrito" options={selectedRegion ? scoutRegions.find(r => r.region === selectedRegion)?.districts.map(d => d.district) ?? [] : []} value={selectedDistrict} onChange={setSelectedDistrict} disabled={!selectedRegion} />
              </div>

              <SectionDivider title="Pago Inicial" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Monto" type="number" value={montoBs} onChange={setMontoBs} />
                <InputField label="Referencia" value={referenciaPago} onChange={setReferenciaPago} />
              </div>

              <SectionDivider title="Archivos" icon={<GoogleDriveIcon size={16} />} />
              <FileDropzone label="Foto" accept=".jpg,.png" onFileSelect={setFotoParticipante} />
              <FileDropzone label="Comprobante Pago Inicial *" accept=".jpg,.png,.pdf" onFileSelect={setComprobantePago} />

              <label style={{ display: "flex", gap: 10, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} /> Acepto términos
              </label>

              <button type="submit" disabled={loading} style={{ background: ENJ_NAVY, color: "#fff", padding: 15, borderRadius: 10, border: "none", cursor: "pointer" }}>
                {loading ? "Procesando y creando expediente..." : "Enviar Inscripción"}
              </button>
            </form>
          </div>
        )}

        {viewMode === "cuotas" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 40, boxShadow: "0 4px 40px rgba(0,0,0,0.05)" }}>
            <form onSubmit={handleCuotasSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SectionDivider title="Registrar Siguiente Cuota" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
              <SelectField label="Cuota a reportar" options={["Segunda Cuota", "Tercera Cuota / Saldo Final"]} value={numCuota} onChange={setNumCuota} />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Monto" type="number" value={montoBs} onChange={setMontoBs} />
                <InputField label="Referencia" value={referenciaPago} onChange={setReferenciaPago} />
              </div>

              <FileDropzone label="Comprobante Cuota *" accept=".pdf,.jpg,.png" onFileSelect={setComprobantePago} />

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={loading} style={{ flex: 1, background: ENJ_MAGENTA, color: "#fff", padding: 15, borderRadius: 10, border: "none", cursor: "pointer" }}>
                  {loading ? "Subiendo..." : "Registrar Cuota"}
                </button>
                <button type="button" onClick={() => setViewMode("exito")} style={{ background: "#eee", padding: 15, borderRadius: 10, border: "none", cursor: "pointer" }}>
                  Terminar por ahora
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}