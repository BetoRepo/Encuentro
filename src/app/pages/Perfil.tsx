import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, User, ChevronDown, Camera, MapPin, Heart, Instagram,
  ShieldCheck, Send, Users, CheckCircle, Clock, AlertCircle, Edit3, Share2,
  Sparkles, Award, Trophy, X, Upload
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../supabaseClient";
import bannerImg from "../../assets/Bannerperfil.jpeg";

// ==========================================
// CONSTANTES DE DISEÑO ENJ 2026 (ASV)
// ==========================================
const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

// ==========================================
// ESTRUCTURA ORGANIZATIVA SCOUT DE VENEZUELA
// ==========================================
export interface ScoutRegion {
  region: string;
  districts: string[];
}

export const scoutRegions: ScoutRegion[] = [
  {
    region: "ESTRUCTURA NACIONAL / OSN",
    districts: [
      "CONSEJO SCOUT NACIONAL",
      "COOPERADORES DE SOPORTE",
      "OFICINA SCOUT NACIONAL",
      "COMISIONADO"
    ]
  },
  { region: "ANZOÁTEGUI", districts: ["EL TIGRE", "PUERTO LA CRUZ", "BARCELONA"] },
  { region: "APURE", districts: ["SAN FERNANDO"] },
  { region: "ARAGUA", districts: ["GUARICO", "HENRI PITTIER", "JOSE FELIX RIBAS", "MANUEL ATANASIO GIRARDOT", "SANTIAGO MARIÑO", "SUCRE ZAMORA"] },
  { region: "ATENDIDOS POR LA OSN", districts: ["BOLIVAR", "COJEDES", "FALCON", "GUARAPICHE", "PORTUGUESA", "PUERTO LA CRUZ", "TRUJILLO", "YARACUY"] },
  { region: "BARINAS", districts: ["BARINAS CENTRO"] },
  { region: "BOLÍVAR", districts: ["CARONÍ", "ANGOSTURA", "UPATA"] },
  { region: "CARABOBO", districts: ["GUACARA", "SAN ESTEBAN", "VALENCIA NORTE", "VALENCIA SUR"] },
  { region: "COJEDES", districts: ["SAN CARLOS"] },
  { region: "DISTRITO CAPITAL", districts: ["AVILA", "CARICUAO", "JOSE ANTONIO PAEZ", "LOS PROCERES", "MARISCAL SUCRE", "SANTIAGO DE LEON"] },
  { region: "FALCÓN", districts: ["CORO", "PARAGUANÁ"] },
  { region: "GUÁRICO", districts: ["VALLE DE LA PASCUA", "SAN JUAN DE LOS MORROS"] },
  { region: "LARA", districts: ["ANDRES ELOY BLANCO", "CATEDRAL", "CREPUSCULAR", "PALAVECINO"] },
  { region: "MÉRIDA", districts: ["CARI", "LIBERTADOR", "NO APLICA"] },
  { region: "METROPOLITANA", districts: ["BARUTA", "CHACAO", "SUCRE NORTE", "SUCRE SUR"] },
  { region: "MIRANDA", districts: ["ALTOS MIRANDINOS", "GUARENAS GUATIRE", "VALLES DEL TUY"] },
  { region: "MONAGAS", districts: ["MATURÍN"] },
  { region: "NUEVA ESPARTA", districts: ["PORLAMAR", "MARGARITA"] },
  { region: "PORTUGUESA", districts: ["ACARIGUA", "GUANARE"] },
  { region: "SUCRE", districts: ["CUMANÁ", "CARÚPANO"] },
  { region: "TÁCHIRA", districts: ["RIO TORBES", "SAN CRISTOBAL ESTE", "SAN CRISTOBAL OESTE"] },
  { region: "TRUJILLO", districts: ["VALERA", "TRUJILLO"] },
  { region: "YARACUY", districts: ["SAN FELIPE"] },
  { region: "ZULIA", districts: ["COQUIVACOA", "FRANCISCO POLANCO - PERIJA", "PEDRO HENRIQUEZ AMADO", "SAMUEL MARTINEZ", "SAN FRANCISCO", "ZULIA ORIENTAL"] }
];

const tiposRol = [
  "Protagonista (Joven participante)",
  "Equipo de Producción (Adultos de Soporte)",
  "Directores (Staff)"
];

const ramas = ["Comunidad (Caminante)", "Clan (Rover)", "Dirigencia / Adulto de Soporte"];
const opcionesGustos = [
  "RDJ", "Herramientas digitales", "Marca personal", "Comunicación y negociación", 
  "Educación financiera", "Idiomas", "Inclusión y diversidad", "Gestión de Riesgo", 
  "A Salvo del Peligro", "Gobernanza", "Ciudadanía activa", "Salud mental", 
  "Nutrición", "Derechos sexuales y reproductivos", "Intercambio cultural", 
  "Hacer amigos", "Intercambiar pañoletas", "Música/Canto", "Deportes", "Aldea Global"
];

interface InsigniaCatalogo {
  id: string;
  nombre: string;
  puntos?: number;
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
function InputField({ label, placeholder, type = "text", icon, required = true, value, onChange, disabled = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)", display: "flex", pointerEvents: "none" }}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            padding: icon ? "12px 14px 12px 42px" : "12px 14px",
            borderRadius: 12,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: disabled ? "#F4F5FA" : "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: disabled ? "rgba(0,11,111,0.5)" : "#0D0D2B",
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange, placeholder = "Seleccionar...", required = true, disabled = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            padding: "12px 40px 12px 14px",
            borderRadius: 12,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: disabled ? "#F4F5FA" : "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: disabled ? "rgba(0,11,111,0.35)" : "#0D0D2B",
            outline: "none",
            appearance: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 12px" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,11,111,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
      <div style={{ flex: 1, height: 1.5, background: "linear-gradient(to right, rgba(0,11,111,0.12), rgba(0,11,111,0.02))" }} />
    </div>
  );
}

// ==========================================
// MODAL DE POSTULACIÓN DE INSIGNIAS
// ==========================================
interface ModalProps {
  insignia: InsigniaCatalogo;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function SolicitudInsigniaModal({ insignia, userId, onClose, onSuccess }: ModalProps) {
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return alert("Por favor describe la prueba o evidencia realizada.");

    setLoading(true);
    try {
      let fotoUrl = "";

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${insignia.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("evidencias_insignias")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("evidencias_insignias")
          .getPublicUrl(filePath);

        fotoUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("solicitudes_insignias")
        .insert([
          {
            user_id: userId,
            insignia_id: insignia.id,
            descripcion_evidencia: descripcion.trim(),
            foto_url: fotoUrl,
            estado: "pendiente"
          }
        ]);

      if (insertError) throw insertError;

      alert("¡Solicitud de insignia enviada con éxito al Equipo Evaluador!");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error al enviar la solicitud: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", position: "relative" }}>
        
        <button type="button" onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ENJ_NAVY }}>
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ background: "rgba(215,0,126,0.1)", padding: 8, borderRadius: 12 }}>
            <Sparkles color={ENJ_MAGENTA} size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: 19, color: ENJ_NAVY, fontWeight: 900 }}>Demuestra tu Logro ENJ</h3>
        </div>

        <p style={{ fontSize: 13, color: "#555", margin: "0 0 18px", lineHeight: 1.4 }}>
          Insignia a solicitar: <strong style={{ color: ENJ_MAGENTA, fontWeight: 800 }}>{insignia.nombre}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: ENJ_NAVY, display: "block", marginBottom: 6 }}>
              ¿Cómo completaste este reto o taller? *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explica detalladamente la actividad o reto realizado..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: ENJ_NAVY, display: "block", marginBottom: 6 }}>
              Adjuntar Foto / Evidencia (Opcional)
            </label>
            <label htmlFor="evidencia-file" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, border: `1.5px dashed ${ENJ_NAVY}`, background: "#FAFBFF", cursor: "pointer", transition: "all 0.2s" }}>
              <Upload size={18} color={ENJ_NAVY} />
              <span style={{ fontSize: 13, color: ENJ_NAVY, fontWeight: 700 }}>
                {file ? file.name : "Seleccionar foto del logro"}
              </span>
            </label>
            <input id="evidencia-file" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </div>

          {preview && (
            <img src={preview} alt="Vista previa" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, border: "2px solid #EAEFFF" }} />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, #FF2A85 100%)`,
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 6px 16px rgba(215,0,126,0.3)"
            }}
          >
            <Send size={16} />
            {loading ? "Enviando Solicitud..." : "Enviar a Validación del Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL DE PERFIL
// ==========================================
export function Perfil() {
  const navigate = useNavigate();
  const { id: urlUserId } = useParams();

  const currentUser = JSON.parse(localStorage.getItem("enj_user") || "null");
  const targetUserId = urlUserId || currentUser?.id;
  const isOwnProfile = Boolean(currentUser && currentUser.id === targetUserId);

  const [isEditing, setIsEditing] = useState(false);

  // 1. Datos Personales
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [rolEvento, setRolEvento] = useState("Protagonista (Joven participante)");

  // 2. Estructura Scout
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [grupoScout, setGrupoScout] = useState("");
  const [ramaScout, setRamaScout] = useState("");

  // 3. Redes y Perfil Público
  const [descripcion, setDescripcion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [gustos, setGustos] = useState<string[]>([]);
  const [foto, setFoto] = useState("");
  const [apretonesCount, setApretonesCount] = useState(0);
  const [hasHandshaked, setHasHandshaked] = useState(false);

  const [loading, setLoading] = useState(false);

  // Muro Social & Pagos Privados
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [misPagos, setMisPagos] = useState<any[]>([]);

  // Insignias y Modal
  const [catalogoInsignias, setCatalogoInsignias] = useState<InsigniaCatalogo[]>([]);
  const [misInsigniasIds, setMisInsigniasIds] = useState<string[]>([]);
  const [insigniaParaSolicitar, setInsigniaParaSolicitar] = useState<InsigniaCatalogo | null>(null);

  useEffect(() => {
    if (!targetUserId) return;

    const loadProfileAndData = async () => {
      // 1. Cargar datos del perfil
      const { data } = await supabase.from("profiles").select("*").eq("id", targetUserId).single();
      if (data) {
        setNombre(data.nombre || "");
        setApellido(data.apellido || "");
        setBirthDate(data.birth_date || "");
        setRolEvento(data.rol_evento || "Protagonista (Joven participante)");
        setSelectedRegion(data.selected_region || "");
        setSelectedDistrict(data.selected_district || "");
        setGrupoScout(data.grupo_scout || "");
        setRamaScout(data.rama_scout || "");
        setDescripcion(data.descripcion || "");
        setInstagram(data.instagram || "");
        setGustos(data.gustos_evento || []);
        setFoto(data.foto || "");
        setApretonesCount(data.apretones_count || 0);
      } else if (isOwnProfile) {
        setIsEditing(true);
      }

      // 2. Cargar pagos si es perfil propio
      if (isOwnProfile) {
        const { data: pagosData } = await supabase
          .from("pagos")
          .select("*")
          .eq("usuario_id", targetUserId)
          .order("fecha_pago", { ascending: false });
        if (pagosData) setMisPagos(pagosData);
      }

      // 3. Cargar Muro Social
      const { data: muroData } = await supabase
        .from("muro_social")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(50);
      if (muroData) setComentarios(muroData);

      // 4. Cargar Catálogo e Insignias del Usuario
      const { data: catData } = await supabase.from("insignias").select("*");
      if (catData) setCatalogoInsignias(catData);

      const { data: userInsigData } = await supabase
        .from("participante_insignias")
        .select("insignia_id")
        .eq("user_id", targetUserId);
      if (userInsigData) setMisInsigniasIds(userInsigData.map((i: any) => i.insignia_id));
    };

    loadProfileAndData();

    // Suscripción Realtime Muro Social
    const channel = supabase
      .channel(`muro_realtime_${targetUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "muro_social" },
        (payload) => {
          setComentarios((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId, isOwnProfile]);

  const toggleGusto = (item: string) => {
    setGustos(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleHandshake = async () => {
    if (hasHandshaked) return;
    const newCount = apretonesCount + 1;
    setApretonesCount(newCount);
    setHasHandshaked(true);

    await supabase
      .from("profiles")
      .update({ apretones_count: newCount })
      .eq("id", targetUserId);
  };

  const handleSaveProfile = async () => {
    if (!nombre || !apellido || !selectedRegion || !selectedDistrict || !grupoScout || !ramaScout) {
      return alert("Por favor completa los campos obligatorios (*) del formulario.");
    }

    setLoading(true);
    try {
      const profilePayload = {
        id: currentUser?.id,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        birth_date: birthDate,
        rol_evento: rolEvento,
        selected_region: selectedRegion,
        selected_district: selectedDistrict,
        grupo_scout: grupoScout,
        rama_scout: ramaScout,
        descripcion: descripcion.trim(),
        instagram: instagram.trim().replace("@", ""),
        gustos_evento: gustos,
        foto,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(profilePayload);
      if (error) throw error;

      alert("¡Perfil Scout guardado exitosamente!");
      setIsEditing(false);
    } catch (error: any) {
      alert("Error al guardar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensajeMuro = async () => {
    if (!nuevoMensaje.trim()) return;
    const autorNombre = currentUser
      ? `${nombre || currentUser.email.split("@")[0]}`
      : "Scout Visitante";

    const { error } = await supabase.from("muro_social").insert([
      {
        autor: autorNombre,
        autor_id: currentUser?.id || null,
        mensaje: nuevoMensaje.trim(),
        fecha: new Date().toISOString()
      }
    ]);

    if (error) {
      alert("Error al publicar mensaje: " + error.message);
    } else {
      setNuevoMensaje("");
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/scout/${targetUserId}`;
    navigator.clipboard.writeText(link);
    alert("¡Enlace de tu perfil copiado al portapapeles!");
  };

  const qrPublicUrl = `${window.location.origin}/scout/${targetUserId}`;

  return (
    <div style={{ background: "#F0F3F9", minHeight: "100vh", padding: "32px 16px 80px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        
        {/* BOTÓN VOLVER */}
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8, 
            background: "#FFFFFF", 
            border: "1px solid rgba(0,11,111,0.1)", 
            borderRadius: 30,
            padding: "8px 16px",
            cursor: "pointer", 
            color: ENJ_NAVY, 
            fontSize: 13, 
            fontWeight: 700, 
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(0,11,111,0.04)"
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>

        {/* MODO EDICIÓN FORMULARIO */}
        {isEditing ? (
          <div style={{ background: "#fff", borderRadius: 28, padding: "clamp(24px, 5vw, 40px)", boxShadow: "0 15px 40px rgba(0,11,111,0.07)", border: "1px solid rgba(0,11,111,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <span style={{ background: `linear-gradient(135deg, ${ENJ_MAGENTA}, #FF2A85)`, color: "#fff", fontSize: 10, fontWeight: 900, padding: "5px 14px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>Edición de Perfil</span>
                <h2 style={{ margin: "8px 0 0", fontSize: 24, color: ENJ_NAVY, fontWeight: 900 }}>Actualiza tus Datos Scout</h2>
              </div>
              {nombre && (
                <button type="button" onClick={() => setIsEditing(false)} style={{ background: "#F4F5FA", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, cursor: "pointer" }}>
                  Cancelar
                </button>
              )}
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* FOTO DE EDICIÓN (MÁS GRANDE) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <label htmlFor="foto-upload" style={{ cursor: "pointer", position: "relative" }}>
                  <div style={{ 
                    padding: 4, 
                    borderRadius: "50%", 
                    background: `linear-gradient(135deg, ${ENJ_MAGENTA}, ${ENJ_NAVY})`,
                    boxShadow: "0 8px 20px rgba(0,11,111,0.15)"
                  }}>
                    <div style={{ width: 128, height: 128, borderRadius: "50%", border: "4px solid #fff", background: "#F4F5FA", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {foto ? <img src={foto} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={56} color="rgba(0,11,111,0.3)" />}
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: 4, right: 4, width: 36, height: 36, borderRadius: "50%", background: ENJ_MAGENTA, border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,0.2)" }}>
                    <Camera size={18} />
                  </div>
                </label>
                <input id="foto-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                <span style={{ fontSize: 12, color: "rgba(0,11,111,0.6)", fontWeight: 700 }}>Cambiar foto de perfil</span>
              </div>

              {/* SECCIÓN 1: DATOS PERSONALES */}
              <SectionDivider title="1. Datos Personales" icon={<User size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="Nombre(s)" placeholder="María" value={nombre} onChange={setNombre} />
                <InputField label="Apellido(s)" placeholder="González" value={apellido} onChange={setApellido} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="Fecha de Nacimiento" type="date" value={birthDate} onChange={setBirthDate} required={false} />
                <SelectField label="Rol en el Evento" options={tiposRol} value={rolEvento} onChange={setRolEvento} />
              </div>

              {/* SECCIÓN 2: ESTRUCTURA SCOUT */}
              <SectionDivider title="2. Estructura Scout" icon={<MapPin size={16} color={ENJ_NAVY} />} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <SelectField
                  label="Región Scout"
                  options={scoutRegions.map((r) => r.region)}
                  value={selectedRegion}
                  onChange={(v: string) => { setSelectedRegion(v); setSelectedDistrict(""); }}
                />
                <SelectField
                  label="Distrito Scout"
                  options={scoutRegions.find((r) => r.region === selectedRegion)?.districts || []}
                  value={selectedDistrict}
                  disabled={!selectedRegion}
                  onChange={setSelectedDistrict}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField
                  label="Grupo Scout / Instancia"
                  placeholder="Ej. Grupo San Jorge 12"
                  value={grupoScout}
                  onChange={setGrupoScout}
                  required={true}
                />
                <SelectField label="Unidad / Rama" options={ramas} value={ramaScout} onChange={setRamaScout} />
              </div>

              {/* SECCIÓN 3: REDES E INTERESES */}
              <SectionDivider title="3. Social & Redes ENJ" icon={<Heart size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>Biografía / Lema Scout</label>
                <textarea placeholder="Cuéntanos tus expectativas para el ENJ 2026..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1.5px solid rgba(0,11,111,0.15)", outline: "none", boxSizing: "border-box", fontSize: 13, fontFamily: "Inter, sans-serif" }} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY, display: "block", marginBottom: 10 }}>Tus intereses en el ENJ 2026:</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {opcionesGustos.map((item) => {
                    const selected = gustos.includes(item);
                    return (
                      <button key={item} type="button" onClick={() => toggleGusto(item)} style={{ padding: "6px 14px", borderRadius: 100, border: selected ? `1.5px solid ${ENJ_MAGENTA}` : "1.5px solid rgba(0,11,111,0.12)", background: selected ? "rgba(215,0,126,0.08)" : "#FAFBFF", color: selected ? ENJ_MAGENTA : ENJ_NAVY, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                        {selected ? "✓ " : "+ "}{item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <InputField label="Instagram" placeholder="usuario" icon={<Instagram size={16} />} value={instagram} onChange={setInstagram} required={false} />

              <button type="button" onClick={handleSaveProfile} disabled={loading} style={{ marginTop: 12, padding: "16px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, #FF2A85 100%)`, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 20px rgba(215,0,126,0.3)" }}>
                <Sparkles size={18} /> {loading ? "Guardando Perfil..." : "Guardar Perfil Scout"}
              </button>
            </form>
          </div>
        ) : (

          /* VISTA PÚBLICA / TARJETA SOCIAL COOL Y MEJORADA */
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* TARJETA PRINCIPAL */}
            <div style={{ background: "#fff", borderRadius: 28, overflow: "hidden", boxShadow: "0 15px 45px rgba(0,11,111,0.08)", border: "1px solid rgba(0,11,111,0.05)", position: "relative" }}>
              
              {/* BANNER REFORZADO Y MÁS ALTO CON OVERLAY GRADIENTE */}
              <div 
                style={{ 
                  height: 190, 
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 11, 111, 0.25), rgba(0, 11, 111, 0.65)), url(${bannerImg})`, 
                  backgroundSize: "cover", 
                  backgroundPosition: "center", 
                  backgroundRepeat: "no-repeat", 
                  position: "relative" 
                }}
              >
                {/* BOTONES ACCIÓN SUPERIOR CON GLASSMORPHISM */}
                <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 10, zIndex: 2 }}>
                  <button 
                    type="button" 
                    onClick={copyProfileLink} 
                    title="Compartir Perfil" 
                    style={{ 
                      background: "rgba(255, 255, 255, 0.25)", 
                      backdropFilter: "blur(8px)", 
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.4)", 
                      borderRadius: "50%", 
                      width: 40, 
                      height: 40, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      color: "#fff", 
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}
                  >
                    <Share2 size={18} />
                  </button>
                  {isOwnProfile && (
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(true)} 
                      style={{ 
                        background: "#FFFFFF", 
                        border: "none", 
                        borderRadius: 24, 
                        padding: "0 18px", 
                        height: 40, 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 8, 
                        color: ENJ_NAVY, 
                        fontWeight: 800, 
                        fontSize: 13, 
                        cursor: "pointer", 
                        boxShadow: "0 4px 14px rgba(0,0,0,0.18)" 
                      }}
                    >
                      <Edit3 size={15} color={ENJ_MAGENTA} /> Editar
                    </button>
                  )}
                </div>
              </div>

              {/* CONTENIDO DEL PERFIL & FOTO AGRANDADA */}
              <div style={{ padding: "0 28px 32px", marginTop: -64, textAlign: "center", position: "relative", zIndex: 1 }}>
                
                {/* FOTO DE PERFIL CON ANILLO DE GRADIENTE Y MÁS GRANDE (128px) */}
                <div 
                  style={{ 
                    width: 128, 
                    height: 128, 
                    margin: "0 auto",
                    borderRadius: "50%", 
                    padding: 4, 
                    background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, ${ENJ_NAVY} 100%)`, 
                    boxShadow: "0 10px 28px rgba(0, 11, 111, 0.25)"
                  }}
                >
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #FFFFFF", background: "#EAEFFF", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {foto ? <img src={foto} alt={nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={58} color={ENJ_NAVY} />}
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 25, fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
                    {nombre || "Scout"} {apellido}
                  </h2>
                </div>

                {/* INSIGNIAS DE ROL Y RAMA */}
                <div style={{ margin: "10px 0 16px", display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(0,11,111,0.06)", color: ENJ_NAVY, fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 100, border: "1px solid rgba(0,11,111,0.08)" }}>
                    {rolEvento}
                  </span>
                  {ramaScout && (
                    <span style={{ background: "rgba(215,0,126,0.1)", color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 100, border: "1px solid rgba(215,0,126,0.18)" }}>
                      {ramaScout}
                    </span>
                  )}
                </div>

                {/* BOTÓN INTERACTIVO APRETÓN DE MANOS ESTILIZADO */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={handleHandshake}
                    style={{
                      background: hasHandshaked ? "rgba(215,0,126,0.08)" : `linear-gradient(135deg, ${ENJ_NAVY} 0%, #1A269B 100%)`,
                      color: hasHandshaked ? ENJ_MAGENTA : "#FFFFFF",
                      border: hasHandshaked ? `2px solid ${ENJ_MAGENTA}` : "none",
                      borderRadius: 30,
                      padding: "10px 22px",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      boxShadow: hasHandshaked ? "none" : "0 6px 18px rgba(0,11,111,0.22)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ fontSize: 16 }}>🤝</span> {apretonesCount} Apretones de mano
                  </button>
                </div>

                {instagram && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
                    <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(215,0,126,0.05)", padding: "6px 14px", borderRadius: 20, color: ENJ_MAGENTA, textDecoration: "none", fontSize: 13, fontWeight: 700, border: "1px solid rgba(215,0,126,0.15)" }}>
                      <Instagram size={16} /> @{instagram}
                    </a>
                  </div>
                )}

                {/* INFO ESTRUCTURA SCOUT EN CONTENEDOR TIPO TARJETA */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#FAFBFF", padding: 16, borderRadius: 20, border: "1.5px solid rgba(0,11,111,0.06)", marginBottom: 20, textAlign: "left" }}>
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,11,111,0.5)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em", display: "block", marginBottom: 3 }}>Grupo / Instancia</span>
                    <strong style={{ fontSize: 14, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
                      <Award size={16} color={ENJ_MAGENTA} /> {grupoScout || "Sin registrar"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,11,111,0.5)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em", display: "block", marginBottom: 3 }}>Región / Distrito</span>
                    <strong style={{ fontSize: 14, color: ENJ_NAVY, fontWeight: 800 }}>{selectedRegion || "ASV"} - {selectedDistrict}</strong>
                  </div>
                </div>

                {descripcion && (
                  <div style={{ background: "rgba(0,11,111,0.02)", borderRadius: 16, padding: "14px 18px", marginBottom: 20, borderLeft: `4px solid ${ENJ_MAGENTA}` }}>
                    <p style={{ fontStyle: "italic", color: "#334155", fontSize: 13.5, lineHeight: 1.6, margin: 0, textAlign: "left" }}>
                      "{descripcion}"
                    </p>
                  </div>
                )}

                {gustos.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {gustos.map((g) => (
                      <span key={g} style={{ background: "#FFFFFF", color: ENJ_MAGENTA, fontSize: 11.5, fontWeight: 800, padding: "5px 14px", borderRadius: 100, border: "1.5px solid rgba(215,0,126,0.25)", boxShadow: "0 2px 6px rgba(215,0,126,0.06)" }}>
                        #{g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN GAMIFICACIÓN: INSIGNIAS Y LOGROS */}
            <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid rgba(0,11,111,0.05)", boxShadow: "0 10px 30px rgba(0,11,111,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ background: "rgba(215,0,126,0.1)", padding: 8, borderRadius: 12 }}>
                  <Trophy size={20} color={ENJ_MAGENTA} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: ENJ_NAVY, fontWeight: 900 }}>Logros del Campamento</h3>
                  <span style={{ fontSize: 11, color: "rgba(0,11,111,0.5)", fontWeight: 600 }}>Toca una insignia para postular tu evidencia</span>
                </div>
              </div>
              
              {catalogoInsignias.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: "rgba(0,11,111,0.6)", fontStyle: "italic" }}>
                  Cargando insignias disponibles...
                </p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 18 }}>
                  {catalogoInsignias.map((insignia) => {
                    const isUnlocked = misInsigniasIds.includes(insignia.id);
                    return (
                      <div 
                        key={insignia.id} 
                        onClick={() => {
                          if (!isUnlocked && isOwnProfile) {
                            setInsigniaParaSolicitar(insignia);
                          }
                        }}
                        style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center",
                          opacity: isUnlocked ? 1 : 0.55,
                          filter: isUnlocked ? "none" : "grayscale(90%)",
                          cursor: (!isUnlocked && isOwnProfile) ? "pointer" : "default",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        title={!isUnlocked && isOwnProfile ? "Haz clic para postular tu evidencia" : insignia.nombre}
                      >
                        <div style={{ 
                          width: 68, 
                          height: 68, 
                          borderRadius: "50%", 
                          background: isUnlocked ? "linear-gradient(135deg, rgba(215,0,126,0.12), rgba(0,11,111,0.08))" : "#F4F5FA", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          border: isUnlocked ? `2.5px solid ${ENJ_MAGENTA}` : "2px dashed rgba(0,11,111,0.2)",
                          boxShadow: isUnlocked ? "0 6px 16px rgba(215,0,126,0.2)" : "none"
                        }}>
                           <Award size={32} color={isUnlocked ? ENJ_MAGENTA : "rgba(0,11,111,0.4)"} />
                        </div>
                        <span style={{ 
                          fontSize: 11, 
                          textAlign: "center", 
                          marginTop: 8, 
                          fontWeight: isUnlocked ? 800 : 600,
                          color: isUnlocked ? ENJ_NAVY : "rgba(0,11,111,0.6)",
                          lineHeight: 1.2
                        }}>
                          {insignia.nombre}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN PRIVADA: ESTADO DE CUOTAS */}
            {isOwnProfile && (
              <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid rgba(0,11,111,0.05)", boxShadow: "0 10px 30px rgba(0,11,111,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ background: "rgba(0,11,111,0.08)", padding: 8, borderRadius: 12 }}>
                    <ShieldCheck size={20} color={ENJ_NAVY} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, color: ENJ_NAVY, fontWeight: 900 }}>Estado Privado de Cuotas ENJ 2026</h3>
                </div>
                {misPagos.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(0,11,111,0.6)", fontStyle: "italic" }}>
                    No has reportado cuotas todavía.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {misPagos.map((pago) => {
                      const isValidado = pago.estado === "validado" || pago.estatus_validacion === "Validado";
                      const isRechazado = pago.estado === "rechazado" || pago.estatus_validacion === "Rechazado";
                      return (
                        <div key={pago.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFBFF", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(0,11,111,0.08)" }}>
                          <div>
                            <strong style={{ fontSize: 13, color: ENJ_NAVY, display: "block", fontWeight: 800 }}>{pago.concepto || "Cuota ENJ 2026"}</strong>
                            <span style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>
                              {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-VE") : "Sin fecha"}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: isValidado ? "#16A34A" : isRechazado ? "#DC2626" : "#D97706", background: isValidado ? "rgba(22,163,74,0.1)" : isRechazado ? "rgba(220,38,38,0.1)" : "rgba(217,119,6,0.1)", padding: "4px 12px", borderRadius: 100 }}>
                            {isValidado && <CheckCircle size={15} />}
                            {isRechazado && <AlertCircle size={15} />}
                            {!isValidado && !isRechazado && <Clock size={15} />}
                            {isValidado ? "Validado" : isRechazado ? "Rechazado" : "Pendiente"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CREDENCIAL QR PÚBLICA ESTILO PASE SCOUT */}
            <div style={{ background: `linear-gradient(135deg, ${ENJ_NAVY} 0%, #0F172A 100%)`, borderRadius: 24, padding: 24, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, boxShadow: "0 12px 32px rgba(0,11,111,0.2)" }}>
              <div>
                <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 10, fontWeight: 900, padding: "3px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>Credencial Digital</span>
                <h4 style={{ margin: "6px 0 4px", fontSize: 17, fontWeight: 900, color: "#fff" }}>Pase QR Scout</h4>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", maxWidth: 260 }}>Escanéame en el evento para acceder a mi perfil público.</p>
              </div>
              <div style={{ background: "#fff", padding: 10, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                <QRCodeSVG value={qrPublicUrl} size={82} fgColor={ENJ_NAVY} />
              </div>
            </div>

            {/* MURO SOCIAL DE INTERACCIÓN */}
            <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid rgba(0,11,111,0.05)", boxShadow: "0 10px 30px rgba(0,11,111,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ background: "rgba(0,11,111,0.08)", padding: 8, borderRadius: 12 }}>
                  <Users size={20} color={ENJ_NAVY} />
                </div>
                <h3 style={{ margin: 0, fontSize: 16, color: ENJ_NAVY, fontWeight: 900 }}>Muro del Elenco ENJ</h3>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Saluda o deja un mensaje para los Scouts..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleEnviarMensajeMuro())}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 14, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, outline: "none", fontFamily: "Inter, sans-serif" }}
                />
                <button type="button" onClick={handleEnviarMensajeMuro} style={{ background: `linear-gradient(135deg, ${ENJ_NAVY} 0%, #1A269B 100%)`, color: "#fff", border: "none", borderRadius: 14, padding: "0 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,11,111,0.2)" }}>
                  <Send size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 240, overflowY: "auto" }}>
                {comentarios.length === 0 ? (
                  <span style={{ fontSize: 12, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>Aún no hay mensajes en el muro.</span>
                ) : (
                  comentarios.map((c, idx) => (
                    <div key={c.id || idx} style={{ background: "#FAFBFF", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(0,11,111,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <strong style={{ fontSize: 12.5, color: ENJ_NAVY, fontWeight: 800 }}>{c.autor}</strong>
                        <span style={{ fontSize: 10, color: "rgba(0,11,111,0.4)" }}>
                          {c.fecha ? new Date(c.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#334155", lineHeight: 1.4 }}>{c.mensaje}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* MODAL DE POSTULACIÓN DE INSIGNIAS */}
        {insigniaParaSolicitar && currentUser && (
          <SolicitudInsigniaModal
            insignia={insigniaParaSolicitar}
            userId={currentUser.id}
            onClose={() => setInsigniaParaSolicitar(null)}
            onSuccess={() => {
              // Notificación o refresco opcional tras enviar
            }}
          />
        )}

      </div>
    </div>
  );
}

export default Perfil;