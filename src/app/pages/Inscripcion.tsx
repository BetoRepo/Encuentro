import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropzone } from "../components/FileDropzone";
import { GoogleDriveIcon } from "../components/GoogleDriveIcon";
import { 
  CheckCircle2, 
  User, 
  Shield, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Hash, 
  ChevronDown, 
  ArrowLeft, 
  HeartPulse, 
  Building 
} from "lucide-react";

// CLIENTE SUPABASE
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

const LOCAL_REGISTRATION_KEY = "enj_registration";
const LOCAL_PROFILE_KEY = "enj_profile";
const ALERT_AUTHORIZED_EMAILS = ["admin@enj.org", "coordinador@enj.org"];

type ScoutDistrict = { district: string };
type ScoutRegion = { region: string; districts: ScoutDistrict[] };

export const scoutRegions: ScoutRegion[] = [
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

const acuerdoConvivenciaEnj2026 = `ACUERDO DE CONVIVENCIA Y NORMAS - ENJ 2026

1. Participación
- Cada participante es el "protagonista" de su aprendizaje. Se espera una asistencia del 100% a las Mesas Técnicas y Plenarias.
- Sesiones en línea (uso de plataformas y lenguaje): Durante las actividades virtuales, se debe utilizar un lenguaje formal y respetuoso. El uso de cámaras es obligatorio para fomentar la interacción, y los micrófonos deben permanecer silenciados mientras el facilitador o un compañero tenga el derecho de palabra. Está prohibido compartir enlaces de acceso con personas ajenas al evento.
- El proceso electoral para el Núcleo Coordinador es sagrado. Se debe garantizar un ejercicio transparente, equitativo y respetuoso.
- En los Paneles de Expertos y Masterclasses, se debe mantener el respeto hacia los facilitadores y especialistas que brindan su conocimiento.

2. Instalaciones
- Al llegar al campamento YAKON MALEIWA, cada participante debe formalizar su registro para recibir su kit y credencial, la cual es obligatoria para acceder a alimentación y actividades.
- Queda prohibido cualquier daño a la infraestructura o al equipo de producción (materiales de talleres, sonido, etc.).
- Alineados con los ODS 13 y 15, cada participante es responsable de mantener su área libre de desperdicios.
- Se prohíbe correr, gritar o realizar dinámicas de grupo en los pasillos de las habitaciones en cualquier horario, para respetar la tranquilidad de otros participantes.
- Se prohíbe dejar regletas o cargadores conectados sin supervisión en las habitaciones para evitar riesgos de cortocircuito.

3. Bienestar y Seguridad
- Entornos Seguros (Safe from Harm): Se aplicará de forma estricta la Política de Salvo del Peligro. Todo adulto y joven tiene el deber de velar por la integridad física y emocional de los demás. Cualquier sospecha de acoso, abuso o maltrato debe ser reportada de inmediato al equipo de bienestar para su intervención bajo los protocolos de la Asociación de Scouts de Venezuela.
- Salud Sexual y Reproductiva: Se manejarán estos temas con madurez y respeto profesional. Las relaciones inadecuadas o la falta de consentimiento son motivo de expulsión inmediata.
- El evento fomenta la tolerancia a la frustración y la gestión emocional. No se permiten conductas que estigmatizan trastornos o afecten la estabilidad emocional de otros.

4. Comunicaciones y Privacidad
- Solo se permite generar contenido que cuide la marca scout y la integridad de los participantes.
- La información compartida en el "Confesionario Abierto" o en dinámicas de salud mental es estrictamente privada.
- El uso de IA y herramientas digitales (Canva, Excel) debe ser ético y orientado a los proyectos de impacto social del evento.
- Mensajes en redes sociales: Las publicaciones en redes personales relacionadas con el ENJ deben alinearse con los valores scouts. Se prohíbe la difusión de imágenes que comprometan la seguridad de las instalaciones o la dignidad de los participantes.
- Uso adecuado de la tecnología: Los dispositivos electrónicos son herramientas de trabajo. Su uso en plenarias y talleres se limita a la toma de notas, investigación o actividades indicadas por los facilitadores. El uso recreativo (juegos o redes sociales) durante las sesiones de aprendizaje está restringido.

5. Prohibiciones
- Prohibido el alcohol, tabaco/vapeadores y drogas. El ENJ promueve la nutrición y el ejercicio como base del bienestar físico.
- Cualquier acto de agresión física o verbal rompe el "Guión de Temporada" y resultará en la descalificación (expulsión) del participante.

6. Emergencias y Gestión de Riesgo
- Cualquier incidente debe reportarse inmediatamente al equipo de Gestión de Riesgos siguiendo la cadena de mando establecida en los talleres previos.
- La pañoleta y la credencial del evento son obligatorios para ser identificado como miembro activo del evento.

7. Horarios
- El programa inicia a las 07:00 AM y finaliza a las 11:00 PM. La puntualidad es obligatoria para no retrasar las actividades y talleres.
- A partir de las 11:00 PM se restringe la circulación por el campamento y el ruido en las áreas de pernocta para garantizar el descanso de los participantes y otros huéspedes del hotel.

8. Alimentación
- Se establecerán turnos por "Crews" para evitar aglomeraciones. El respeto al turno asignado es fundamental.
- Solo se atenderán dietas especiales (alergias, celiaquía, vegetarianismo) que hayan sido reportadas previamente en la ficha médica.
- Se prohíbe depositar residuos de comida en las áreas no dispuestas para ellos tales como áreas verdes.

9. Aseo Personal y Uso de Baños
- Los baños y duchas son compartidos. Se debe limitar el tiempo de ducha para garantizar que todos los participantes tengan acceso al agua y por respeto ambiental.
- No se deben dejar artículos personales (shampoo, jabón, toallas) en los baños comunes. Cada participante es responsable de su kit de aseo.
- Queda prohibido lavar ropa en los lavamanos o duchas del hotel.

10. Salida del Sitio del Campamento (Perímetro Seguro)
- El ENJ es un evento de régimen cerrado. Nadie puede salir de las instalaciones del campamento YAKON MALEIWA sin una autorización.
- Para salir de las áreas de actividad hacia las habitaciones o áreas públicas del campamento, se debe informar a algún adulto/monitor de programa.
- No se permiten visitas externas de familiares o amigos durante el evento para no interrumpir la dinámica de trabajo.

11. Vestimenta e Imagen
- Se usará la indumentaria scout para las actividades que se indique.
- Solo se permite el uso de traje de baño en las horas y zonas designadas. Se exige decoro y respeto en la vestimenta dentro del campamento.
- No se permite el uso de prendas con mensajes ofensivos, políticos o que promuevan el consumo de sustancias.

12. Uso de la piscina
- El uso de las piscinas estará sujeto a los horarios establecidos en el programa y siempre bajo la presencia de adultos/monitores.
- Se deben acatar todas las normas internas del establecimiento (prohibido lanzarse de cabeza, no consumir alimentos dentro del agua, etc.).

13. Normas de Traslados y Actividades Externas
- Se realizará strictly bajo la supervisión del Staff. Nadie sube o baja de la unidad hasta que el encargado lo autorice.
- Se debe permanecer sentado mientras la unidad esté en movimiento. Queda prohibido sacar extremidades o colgar implementos (pañoletas, banderas) por las ventanas.
- La unidad de transporte debe quedar más limpia de lo que se encontró. Está prohibido dejar envoltorios, botellas o desechos en los asientos.
- Durante las actividades externas, el uso de la franela oficial del ENJ es obligatorio y debe portarse de manera impecable.
- El trato con las personas locales, autoridades o personal de las instituciones visitadas debe ser de extrema cortesía.
- Si la actividad externa es en un parque, museo o institución pública, se acatarán estrictamente las reglas del lugar.
- Nadie se desplaza solo. Para cualquier movimiento, se debe ir en parejas o tríos y dar aviso al Staff encargado.
- Al llegar a cualquier locación externa, el Staff identificará un "Punto de Encuentro" y una hora de reunión.
- Se realizarán conteos rápidos ("número") antes de cada salida y después de cada parada.
- En las actividades de campo fuera del campamento, se aplicará de forma estricta la ética de "No Deje Rastro".
- Queda prohibido recolectar especies vegetales, molestar a la fauna local o intervenir monumentos naturales/históricos.
- Para las salidas, cada joven debe portar obligatoriamente su hidratación, gorra/sombrero y protector solar.

14. Cuidado de las pertenencias
- Cada participante es responsable de la custodia de sus artículos personales. La ASV o el campamento no se hacen responsables por pérdidas de equipos o dinero no custodiado.

15. Medicamentos
- Todo medicamento traído debe estar registrado obligatoriamente en la Ficha Médica. Cualquier medicamento no registrado será retenido por el equipo de Gestión de Riesgos por seguridad.

Al aceptar este acuerdo, confirmo que he leído y entiendo las normas del ENJ 2026 y me comprometo a cumplirlas.`;

function InputField({ label, placeholder, type = "text", icon, required = true, value, onChange, disabled = false, inputMode }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)", display: "flex", pointerEvents: "none" }}>{icon}</div>}
        <input 
          type={type} 
          inputMode={inputMode} 
          placeholder={placeholder} 
          value={value} 
          onChange={(e) => onChange?.(e.currentTarget.value)} 
          disabled={disabled} 
          required={required} 
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
        <div style={{ gridColumn: "1 / -1" }}><strong>Encuentro Nacional de Jóvenes 2026</strong></div>
        <div style={{ gridColumn: "1 / -1" }}><strong>Mercantil Banco Universal</strong></div>
        <div style={{ gridColumn: "1 / -1" }}>0105 0616 63 1616066830</div>
        <div style={{ gridColumn: "1 / -1" }}>J-00066665-2</div>
        <div style={{ gridColumn: "1 / -1", color: ENJ_NAVY }}><strong>(Pago en Bolívares)</strong></div>
        <div style={{ gridColumn: "1 / -1" }}><strong>Bancamiga Cash Asv</strong></div>
        <div style={{ gridColumn: "1 / -1" }}><strong>Bancamiga Banco Universal</strong></div>
        <div style={{ gridColumn: "1 / -1" }}>0172 0111 55 1118053857</div>
        <div><strong>RIF:</strong> J-00066665-2</div>
        <div style={{ gridColumn: "1 / -1", color: ENJ_NAVY }}><strong>(Pago en divisas)</strong></div>
      </div>
    </div>
  );
}

export function Inscripcion() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"inscripcion" | "cuotas" | "exito" | "inscripcion_exito" | "error_pantalla">("inscripcion");
  const [errorMessageStr, setErrorMessageStr] = useState("");
  const [participantType, setParticipantType] = useState<"joven" | "adulto">("joven");
  const [, setRegistrationExists] = useState(false);

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

  const [nombreDirecto, setNombreDirecto] = useState("");
  const [cedulaDirecta, setCedulaDirecta] = useState("");

  const [fotoParticipante, setFotoParticipante] = useState<any>(null);
  const [comprobantePago, setComprobantePago] = useState<any>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  // AUTO-RECONOCIMIENTO DEL USUARIO EN SESIÓN
  useEffect(() => {
    async function comprobarRegistroExistente() {
      try {
        const user = JSON.parse(localStorage.getItem("enj_user") || "null");
        if (user) {
          setCorreo(user.email || "");

          const { data: participante } = await supabase
            .from("participantes")
            .select("*")
            .eq("correo", user.email)
            .maybeSingle();

          if (participante) {
            setNombre(participante.nombre || "");
            setApellido(participante.apellido || "");
            setCedula(participante.cedula || "");
            setViewMode("cuotas");
          }
        }
      } catch (err) {
        console.warn("Estado de sesión limpio:", err);
      }
    }
    comprobarRegistroExistente();

    const registroLocal = localStorage.getItem(LOCAL_REGISTRATION_KEY);
    if (registroLocal) {
      try {
        const data = JSON.parse(registroLocal);
        if (data?.cedula) {
          setRegistrationExists(true);
          setNombre(data.nombre || "");
          setApellido(data.apellido || "");
          setCedula(data.cedula || "");
          setCorreo(data.correo || "");
          setTelefono(data.telefono || "");
          setSelectedRegion(data.selectedRegion || "");
          setSelectedDistrict(data.selectedDistrict || "");
          setGrupoScout(data.grupoScout || "");
          setRamaScout(data.ramaScout || "");
          setParticipantType(data.participantType || "joven");
        }
      } catch (error) {
        console.warn("Error leyendo el registro local:", error);
      }
    }

    const perfilLocal = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (perfilLocal) {
      try {
        const data = JSON.parse(perfilLocal);
        setNombre((current) => current || data.nombre || "");
        setApellido((current) => current || data.apellido || "");
        setCedula((current) => current || data.cedula || "");
        setCorreo((current) => current || data.correo || "");
        setTelefono((current) => current || data.telefono || "");
        setBirthDate((current) => current || data.birthDate || "");
        setAge((current) => current || data.age || (data.birthDate ? calculateAge(data.birthDate) : null));
        setSelectedRegion((current) => current || data.selectedRegion || "");
        setSelectedDistrict((current) => current || data.selectedDistrict || "");
        setGrupoScout((current) => current || data.grupoScout || "");
        setRamaScout((current) => current || data.ramaScout || "");
      } catch (error) {
        console.warn("Error leyendo el perfil local:", error);
      }
    }
  }, []);

  const authorizedToAlert = ALERT_AUTHORIZED_EMAILS.includes(correo);

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

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo adjunto."));
    reader.readAsDataURL(file);
  });

  const parseMontoBsValue = (value: string) => {
    if (!value || value.trim() === "") return 0;

    const normalized = value.trim().replace(/\s+/g, "");
    const hasComma = normalized.includes(",");
    const hasDot = normalized.includes(".");

    if (hasComma && hasDot) {
      const lastCommaIndex = normalized.lastIndexOf(",");
      const lastDotIndex = normalized.lastIndexOf(".");
      const decimalSeparator = lastCommaIndex > lastDotIndex ? "," : ".";
      const thousandsSeparator = decimalSeparator === "," ? "." : ",";

      const withoutThousands = normalized.replace(new RegExp(`\\${thousandsSeparator}`, "g"), "");
      return Number(withoutThousands.replace(decimalSeparator, "."));
    }

    if (hasComma) return Number(normalized.replace(",", "."));
    if (hasDot) return Number(normalized);

    return Number(normalized);
  };

  // ENVÍO DE DOCUMENTOS Y COMPROBANTES AL BUCKET 'documentos-enj'
  const uploadParticipantDocument = async ({
    cedulaParticipante,
    file,
    type,
    label,
  }: {
    cedulaParticipante: string;
    file: File;
    type: "foto" | "ficha_medica" | "comprobante_inicial" | "comprobante_cuota";
    label: string;
  }) => {
    const cleanCedula = cedulaParticipante.replace(/\D/g, "").trim();
    const safeName = `${type}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storagePath = `${cleanCedula}/${safeName}`;
    let publicUrl = "";
    let base64Data = "";

    try {
      // BUCKET CONFIGURADO: 'documentos-enj'
      const { error: uploadError } = await supabase.storage.from("documentos-enj").upload(storagePath, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("documentos-enj").getPublicUrl(storagePath);
      publicUrl = data?.publicUrl || "";
    } catch (storageError) {
      console.warn(`Almacenamiento directo en bucket sin respuesta. Aplicando resguardo en Base64 para ${label}:`, storageError);
      base64Data = await fileToBase64(file);
    }

    const { error: insertError } = await supabase
      .from("documentos_participante")
      .insert([{
        cedula_participante: cleanCedula,
        tipo_documento: type,
        nombre_archivo: file.name,
        path_archivo: storagePath,
        url_archivo: publicUrl,
        mime_type: file.type || "",
        peso_bytes: file.size || 0,
        archivo_base64: base64Data || null,
      }]);

    if (insertError) throw new Error(`Error guardando ${label}: ${insertError.message}`);
    return { publicUrl, storagePath };
  };

  async function saveRegistrationLocally() {
    const cleanCedula = (cedula || cedulaDirecta).replace(/\D/g, "").trim();
    if (!cleanCedula) return;
    const payload = {
      nombre: nombre || nombreDirecto,
      apellido,
      cedula: cleanCedula,
      correo,
      telefono,
      selectedRegion,
      selectedDistrict,
      grupoScout,
      ramaScout,
      participantType,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_REGISTRATION_KEY, JSON.stringify(payload));
    setRegistrationExists(true);
  }

  async function triggerAlarm() {
    if (!authorizedToAlert) {
      return alert("No estás autorizado para enviar esta alerta.");
    }

    if (typeof Notification !== "undefined") {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        new Notification("Alerta ENJ", {
          body: "Se ha activado una alarma para los equipos."
        });
      }
    }

    try {
      await fetch("/api/notifications/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo, message: "Alarma de usuario autorizado" }),
      });
    } catch (err) {
      console.warn("Servicio de alerta temporalmente no disponible:", err);
    }
  }

  async function handleInscriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms) return alert("Debe leer y aceptar el acuerdo de convivencia.");
    
    const cleanPago = extractNativeFile(comprobantePago);
    if (!cleanPago) return alert("Debe adjuntar el comprobante de la cuota inicial de forma válida.");
    
    const cleanCedula = cedula.replace(/\D/g, "").trim();
    if (!cleanCedula) return alert("Ingrese un número de cédula válido.");

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("enj_user") || "null");

      const { error: partError } = await supabase
        .from("participantes")
        .upsert([{
          cedula: cleanCedula,
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
          id_usuario: user?.id || null
        }], { onConflict: 'cedula' });

      if (partError) throw new Error(`Error guardando participante: ${partError.message}`);

      const { error: pagoError } = await supabase
        .from("pagos")
        .insert([{
          cedula_participante: cleanCedula,
          numero_cuota: "Cuota Inicial",
          monto_bs: parseMontoBsValue(montoBs),
          referencia: referenciaPago.trim(),
          fecha_pago: fechaPago || new Date().toISOString().split('T')[0],
          tasa_cambio: parseFloat(tasa) || 1
        }]);

      if (pagoError) throw new Error(`Error guardando pago inicial: ${pagoError.message}`);

      const cleanFoto = extractNativeFile(fotoParticipante);

      if (cleanFoto) {
        await uploadParticipantDocument({
          cedulaParticipante: cleanCedula,
          file: cleanFoto,
          type: "foto",
          label: "la foto del participante",
        });
      }

      await uploadParticipantDocument({
        cedulaParticipante: cleanCedula,
        file: cleanPago,
        type: "comprobante_inicial",
        label: "el comprobante de cuota inicial",
      });

      setComprobantePago(null);
      setFechaPago("");
      setReferenciaPago("");
      setMontoBs("");
      setTasa("");

      await saveRegistrationLocally();
      setViewMode("inscripcion_exito");
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

    const rawCedula = cedula || cedulaDirecta || "";
    const cleanCedula = rawCedula.replace(/\D/g, "").trim();

    if (!cleanCedula) return alert("Por favor, introduce tu número de cédula de identidad.");

    setLoading(true);

    try {
      const { data: partData } = await supabase
        .from("participantes")
        .select("cedula")
        .eq("cedula", cleanCedula)
        .maybeSingle();

      if (!partData) {
        throw new Error("No se encontró ningún expediente de inscripción con la cédula suministrada. Asegúrate de estar inscrito primero.");
      }

      const { error: pagoExtraError } = await supabase
        .from("pagos")
        .insert([{
          cedula_participante: cleanCedula,
          numero_cuota: numCuota,
          monto_bs: parseMontoBsValue(montoBs),
          referencia: referenciaPago.trim(),
          fecha_pago: fechaPago || new Date().toISOString().split('T')[0],
          tasa_cambio: parseFloat(tasa) || 1
        }]);

      if (pagoExtraError) throw new Error(`Error registrando cuota en base de datos: ${pagoExtraError.message}`);

      await uploadParticipantDocument({
        cedulaParticipante: cleanCedula,
        file: cleanPago,
        type: "comprobante_cuota",
        label: "el comprobante de cuota",
      });

      await saveRegistrationLocally();
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
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>Error en la Operación</h2>
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
          <p style={{ margin: "0 0 28px", color: "rgba(0,11,111,0.6)", fontSize: 15, lineHeight: 1.7 }}>Tu cuota y su comprobante se han actualizado con éxito y quedaron guardados en el sistema del evento.</p>
          <button onClick={() => navigate("/")} style={{ padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${ENJ_NAVY}`, background: "transparent", color: ENJ_NAVY, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Terminar
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === "inscripcion_exito") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
            <CheckCircle2 size={42} color="#22c55e" />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>¡Inscripción completada!</h2>
          <p style={{ margin: "0 0 28px", color: "rgba(0,11,111,0.6)", fontSize: 15, lineHeight: 1.7 }}>Tus datos, comprobante y documentos fueron guardados correctamente. Tu expediente ya está creado.</p>
          <button onClick={() => navigate("/")} style={{ padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${ENJ_NAVY}`, background: "transparent", color: ENJ_NAVY, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F0F2FA", padding: "48px 24px 80px", position: "relative" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {authorizedToAlert && (
          <button
            type="button"
            onClick={triggerAlarm}
            style={{
              position: "fixed",
              right: 24,
              bottom: 88,
              zIndex: 200,
              background: ENJ_YELLOW,
              color: ENJ_NAVY,
              border: "none",
              borderRadius: 999,
              padding: "14px 20px",
              boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Alarma
          </button>
        )}

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
                  <InputField label="Correo Electrónico" type="email" icon={<Mail size={16} />} value={correo} onChange={setCorreo} />
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
                  <InputField label="Monto transferido (Bs)" type="text" inputMode="decimal" value={montoBs} onChange={setMontoBs} placeholder="Ej: 15.520,20" />
                  <InputField label="Tasa de cambio aplicada" type="number" value={tasa} onChange={setTasa} />
                </div>

                <SectionDivider title="Expediente Digital" icon={<GoogleDriveIcon size={16} />} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY }}>Foto del Participante *</p>
                    <FileDropzone label="Subir foto" accept=".jpg,.jpeg,.png" onFileSelect={setFotoParticipante} />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY }}>Comprobante de Pago *</p>
                    <FileDropzone label="Subir comprobante" accept=".jpg,.jpeg,.png,.pdf" onFileSelect={setComprobantePago} />
                  </div>
                </div>

                <div style={{ background: "#F8FAFF", border: "1.5px solid rgba(0,11,111,0.12)", borderRadius: 14, padding: 16 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Acuerdo de Convivencia ENJ 2026
                  </p>
                  <div style={{ maxHeight: 260, overflowY: "auto", background: "#fff", borderRadius: 10, padding: 16, border: "1px solid rgba(0,11,111,0.08)", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, color: "rgba(0,11,111,0.82)" }}>
                    {acuerdoConvivenciaEnj2026}
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: ENJ_NAVY, fontWeight: 600 }}>
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                  He leído, entiendo y acepto el Acuerdo de Convivencia.
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
              {!cedula && (
                <>
                  <SectionDivider title="Identificación del Expediente" icon={<User size={16} color={ENJ_NAVY} />} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <InputField label="Nombre Completo" placeholder="Ej. María González" value={nombreDirecto} onChange={setNombreDirecto} />
                    <InputField label="Cédula de Identidad" placeholder="Ej. V-12345678" value={cedulaDirecta} onChange={setCedulaDirecta} />
                  </div>
                </>
              )}

              <SectionDivider title="Registrar Siguiente Cuota" icon={<CreditCard size={16} color={ENJ_NAVY} />} />
              <BankDetailsCard />

              <SelectField label="¿Qué cuota estás reportando?" options={["Segunda Cuota", "Tercera Cuota / Saldo Final"]} value={numCuota} onChange={setNumCuota} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Fecha del Pago" type="date" value={fechaPago} onChange={setFechaPago} />
                <InputField label="Nro. Referencia" icon={<Hash size={16} />} value={referenciaPago} onChange={setReferenciaPago} />
                <InputField label="Monto transferido (Bs)" type="text" inputMode="decimal" value={montoBs} onChange={setMontoBs} placeholder="Ej: 1250,50" />
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