import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, User, Phone, ChevronDown, Camera, MapPin, Heart, Instagram,
  ShieldCheck, Send, Users, CheckCircle, Clock, AlertCircle, Edit3, Share2,
  Sparkles, ShieldAlert, Award
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

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
const opcionesGustos = ["RDJ", "Herramientas digitales", "Marca personal",  "Comunicación y negociación", "Educación financiera", "Idiomas", "Inclusión y diversidad", "Gestión de Riesgo", "A Salvo del Peligro", "Gobernanza", "Ciudadanía activa", "Salud mental", "Nutrición", "Derechos sexuales y reproductivos", "Intercambio cultural", "Hacer amigos", "Intercambiar pañoletas", "Música/Canto", "Deportes", "Aldea Global"];

function InputField({ label, placeholder, type = "text", icon, required = true, value, onChange, disabled = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)", display: "flex", pointerEvents: "none" }}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          required={required}
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
            boxSizing: "border-box",
          }}
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
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          required={required}
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
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 10px" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,11,111,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.09em" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,11,111,0.1)" }} />
    </div>
  );
}

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
  const [isCargoNacional, setIsCargoNacional] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [grupoScout, setGrupoScout] = useState("");
  const [ramaScout, setRamaScout] = useState("");

  // 3. Contacto y Emergencia
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [telefonoEmergencia, setTelefonoEmergencia] = useState("");

  // 4. Redes y Perfil Público
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

  useEffect(() => {
    if (!targetUserId) return;

    const loadProfileAndData = async () => {
      // 1. Cargar datos del perfil del usuario objetivo
      const { data } = await supabase.from("profiles").select("*").eq("id", targetUserId).single();
      if (data) {
        setNombre(data.nombre || "");
        setApellido(data.apellido || "");
        setBirthDate(data.birth_date || "");
        setRolEvento(data.rol_evento || "Protagonista (Joven participante)");
        setIsCargoNacional(Boolean(data.es_cargo_nacional));
        setSelectedRegion(data.selected_region || "");
        setSelectedDistrict(data.selected_district || "");
        setGrupoScout(data.grupo_scout || "");
        setRamaScout(data.rama_scout || "");
        setTelefono(data.telefono || "");
        setCorreo(data.correo || "");
        setContactoEmergencia(data.contacto_emergencia || "");
        setTelefonoEmergencia(data.telefono_emergencia || "");
        setDescripcion(data.descripcion || "");
        setInstagram(data.instagram || "");
        setGustos(data.gustos_evento || []);
        setFoto(data.foto || "");
        setApretonesCount(data.apretones_count || 0);
      } else if (isOwnProfile) {
        setIsEditing(true);
      }

      // 2. Cargar pagos PRIVADOS únicamente si es el dueño del perfil
      if (isOwnProfile) {
        const { data: pagosData } = await supabase
          .from("pagos")
          .select("*")
          .eq("usuario_id", targetUserId)
          .order("fecha_pago", { ascending: false });
        if (pagosData) setMisPagos(pagosData);
      }

      // 3. Cargar publicaciones del Muro Social
      const { data: muroData } = await supabase
        .from("muro_social")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(50);
      if (muroData) setComentarios(muroData);
    };

    loadProfileAndData();

    // Suscripción Realtime Muro
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

  const handleCargoNacionalToggle = (checked: boolean) => {
    setIsCargoNacional(checked);
    if (checked) {
      setSelectedRegion("ESTRUCTURA NACIONAL / OSN");
      setSelectedDistrict("OFICINA SCOUT NACIONAL");
      setGrupoScout("Oficina Scout Nacional (OSN)");
    } else {
      setSelectedRegion("");
      setSelectedDistrict("");
      setGrupoScout("");
    }
  };

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
    if (!nombre || !apellido || !selectedRegion || !selectedDistrict || (!isCargoNacional && !grupoScout) || !ramaScout) {
      return alert("Por favor completa los campos obligatorios (*) marcados en el formulario.");
    }

    setLoading(true);
    try {
      const profilePayload = {
        id: currentUser?.id,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        birth_date: birthDate,
        rol_evento: rolEvento,
        es_cargo_nacional: isCargoNacional,
        selected_region: selectedRegion,
        selected_district: selectedDistrict,
        grupo_scout: grupoScout,
        rama_scout: ramaScout,
        telefono: telefono.trim(),
        correo: correo.trim() || currentUser?.email,
        contacto_emergencia: contactoEmergencia.trim(),
        telefono_emergencia: telefonoEmergencia.trim(),
        descripcion: descripcion.trim(),
        instagram: instagram.trim().replace("@", ""),
        gustos_evento: gustos,
        foto,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(profilePayload);
      if (error) throw error;

      alert("¡Perfil Scout del ENJ 2026 guardado con éxito!");
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
    alert("¡Enlace del perfil Scout copiado al portapapeles!");
  };

  const qrPublicUrl = `${window.location.origin}/scout/${targetUserId}`;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "40px 16px 80px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        
        {/* BOTÓN VOLVER */}
        <button type="button" onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.6)", fontSize: 14, fontWeight: 600, marginBottom: 18 }}>
          <ArrowLeft size={16} /> Volver
        </button>

        {/* MODO EDICIÓN FORMULARIO COMPLETO */}
        {isEditing ? (
          <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(20px, 4vw, 36px)", boxShadow: "0 4px 30px rgba(0,11,111,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 100, textTransform: "uppercase" }}>Edición de Perfil</span>
                <h2 style={{ margin: "6px 0 0", fontSize: 22, color: ENJ_NAVY, fontWeight: 900 }}>Actualiza tus Datos Scout</h2>
              </div>
              {nombre && (
                <button type="button" onClick={() => setIsEditing(false)} style={{ background: "none", border: "1px solid rgba(0,11,111,0.2)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: ENJ_NAVY, cursor: "pointer" }}>
                  Cancelar
                </button>
              )}
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* FOTO DE PERFIL */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <label htmlFor="foto-upload" style={{ cursor: "pointer", position: "relative" }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", border: `3px solid ${ENJ_NAVY}`, background: "#F4F5FA", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {foto ? <img src={foto} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={44} color="rgba(0,11,111,0.3)" />}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%", background: ENJ_MAGENTA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Camera size={15} />
                  </div>
                </label>
                <input id="foto-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                <span style={{ fontSize: 11, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>Cambiar foto de perfil</span>
              </div>

              {/* SECCIÓN 1: DATOS PERSONALES */}
              <SectionDivider title="1. Datos Personales" icon={<User size={15} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="Nombre(s)" placeholder="María" value={nombre} onChange={setNombre} />
                <InputField label="Apellido(s)" placeholder="González" value={apellido} onChange={setApellido} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="Fecha de Nacimiento" type="date" value={birthDate} onChange={setBirthDate} required={false} />
                <SelectField label="Rol en el Evento" options={tiposRol} value={rolEvento} onChange={setRolEvento} />
              </div>

              {/* SECCIÓN 2: ESTRUCTURA SCOUT */}
              <SectionDivider title="2. Estructura Scout" icon={<MapPin size={15} color={ENJ_NAVY} />} />

              <div style={{
                background: "rgba(0,11,111,0.03)",
                border: "1px solid rgba(0,11,111,0.12)",
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12
              }}>
                <input
                  type="checkbox"
                  id="cargoNacionalCheck"
                  checked={isCargoNacional}
                  onChange={(e) => handleCargoNacionalToggle(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: ENJ_MAGENTA, cursor: "pointer" }}
                />
                <label htmlFor="cargoNacionalCheck" style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY, cursor: "pointer" }}>
                  Tengo un Cargo Institucional / Estructura Nacional (OSN / Consejo / Directorio)
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <SelectField
                  label="Región Scout"
                  options={scoutRegions.map((r) => r.region)}
                  value={selectedRegion}
                  disabled={isCargoNacional}
                  onChange={(v: string) => { setSelectedRegion(v); setSelectedDistrict(""); }}
                />
                <SelectField
                  label="Distrito Scout"
                  options={isCargoNacional ? scoutRegions[0].districts : scoutRegions.find((r) => r.region === selectedRegion)?.districts || []}
                  value={selectedDistrict}
                  disabled={!selectedRegion || isCargoNacional}
                  onChange={setSelectedDistrict}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField
                  label="Grupo Scout / Instancia"
                  placeholder="Ej. Grupo San Jorge 12"
                  value={grupoScout}
                  disabled={isCargoNacional}
                  onChange={setGrupoScout}
                  required={!isCargoNacional}
                />
                <SelectField label="Unidad / Rama" options={ramas} value={ramaScout} onChange={setRamaScout} />
              </div>

              {/* SECCIÓN 3: CONTACTO Y EMERGENCIA */}
              <SectionDivider title="3. Contacto y Emergencia" icon={<ShieldAlert size={15} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="Teléfono / WhatsApp" type="tel" icon={<Phone size={15} />} value={telefono} onChange={setTelefono} required={false} />
                <InputField label="Correo Electrónico" type="email" value={correo} onChange={setCorreo} required={false} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="Contacto de Emergencia" placeholder="Nombre del Representante" value={contactoEmergencia} onChange={setContactoEmergencia} required={false} />
                <InputField label="Teléfono de Emergencia" type="tel" placeholder="0414-0000000" value={telefonoEmergencia} onChange={setTelefonoEmergencia} required={false} />
              </div>

              {/* SECCIÓN 4: REDES E INTERESES */}
              <SectionDivider title="4. Social & Redes ENJ" icon={<Heart size={15} color={ENJ_NAVY} />} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>Biografía / Lema Scout</label>
                <textarea placeholder="Cuéntanos tus expectativas para el ENJ 2026..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", outline: "none", boxSizing: "border-box", fontSize: 13 }} />
              </div>

              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, display: "block", marginBottom: 8 }}>Tus intereses en el ENJ 2026:</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {opcionesGustos.map((item) => {
                    const selected = gustos.includes(item);
                    return (
                      <button key={item} type="button" onClick={() => toggleGusto(item)} style={{ padding: "5px 12px", borderRadius: 100, border: selected ? `1.5px solid ${ENJ_MAGENTA}` : "1.5px solid rgba(0,11,111,0.15)", background: selected ? "rgba(215,0,126,0.08)" : "#FAFBFF", color: selected ? ENJ_MAGENTA : ENJ_NAVY, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {selected ? "✓ " : "+ "}{item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <InputField label="Instagram" placeholder="usuario" icon={<Instagram size={15} />} value={instagram} onChange={setInstagram} required={false} />

              <button type="button" onClick={handleSaveProfile} disabled={loading} style={{ marginTop: 10, padding: "14px", borderRadius: 12, border: "none", background: ENJ_MAGENTA, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(215,0,126,0.3)" }}>
                <Sparkles size={16} /> {loading ? "Guardando Perfil..." : "Guardar Perfil Scout"}
              </button>
            </form>
          </div>
        ) : (

          /* MODO VISTA TARJETA ESTILO INSTAGRAM / FEED PUBLICO */
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* TARJETA PRINCIPAL DEL PERFIL */}
            <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,11,111,0.08)", position: "relative" }}>
              
              {/* BANNER ENCABEZADO */}
              <div style={{ height: 120, background: `linear-gradient(135deg, ${ENJ_NAVY} 0%, #0018B0 100%)`, position: "relative" }}>
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
                  <button type="button" onClick={copyProfileLink} title="Compartir Perfil" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
                    <Share2 size={16} />
                  </button>
                  {isOwnProfile && (
                    <button type="button" onClick={() => setIsEditing(true)} style={{ background: "#fff", border: "none", borderRadius: 20, padding: "0 14px", height: 34, display: "flex", alignItems: "center", gap: 6, color: ENJ_NAVY, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      <Edit3 size={14} /> Editar
                    </button>
                  )}
                </div>
              </div>

              {/* CUERPO DEL PERFIL */}
              <div style={{ padding: "0 24px 28px", marginTop: -48, textAlign: "center", position: "relative", zIndex: 1 }}>
                {/* AVATAR */}
                <div style={{ width: 96, height: 96, borderRadius: "50%", border: "4px solid #fff", background: "#EAEFFF", margin: "0 auto", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {foto ? <img src={foto} alt={nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={46} color={ENJ_NAVY} />}
                </div>

                {/* NOMBRE Y CARGO */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>
                    {nombre || "Scout"} {apellido}
                  </h2>
                  {isCargoNacional && (
                    <span title="Cargo Institucional / OSN" style={{ display: "inline-flex" }}>
                      <ShieldCheck size={20} color={ENJ_MAGENTA} />
                    </span>
                  )}
                </div>

                <div style={{ margin: "6px 0 14px", display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(0,11,111,0.06)", color: ENJ_NAVY, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>
                    {rolEvento}
                  </span>
                  {ramaScout && (
                    <span style={{ background: "rgba(215,0,126,0.1)", color: ENJ_MAGENTA, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>
                      {ramaScout}
                    </span>
                  )}
                </div>

                {/* BOTÓN APRETÓN DE MANOS INSTAGRAM STYLE */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                  <button
                    type="button"
                    onClick={handleHandshake}
                    style={{
                      background: hasHandshaked ? "rgba(215,0,126,0.1)" : ENJ_NAVY,
                      color: hasHandshaked ? ENJ_MAGENTA : "#FFFFFF",
                      border: hasHandshaked ? `1.5px solid ${ENJ_MAGENTA}` : "none",
                      borderRadius: 20,
                      padding: "8px 18px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: hasHandshaked ? "none" : "0 4px 12px rgba(0,11,111,0.2)"
                    }}
                  >
                    🤝 {apretonesCount} Apretones de mano
                  </button>
                </div>

                {/* REDES SOCIALES & CONTACTO */}
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
                  {instagram && (
                    <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: ENJ_MAGENTA, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                      <Instagram size={15} /> @{instagram}
                    </a>
                  )}
                  {telefono && isOwnProfile && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(0,11,111,0.6)", fontSize: 13 }}>
                      <Phone size={15} /> {telefono}
                    </span>
                  )}
                </div>

                {/* DETALLES SCOUT (CHIPS GRID) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "#FAFBFF", padding: 14, borderRadius: 16, border: "1px solid rgba(0,11,111,0.08)", marginBottom: 18, textAlign: "left" }}>
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,11,111,0.5)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Grupo / Instancia</span>
                    <strong style={{ fontSize: 13, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 4 }}>
                      <Award size={14} color={ENJ_MAGENTA} /> {grupoScout || "Sin registrar"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,11,111,0.5)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Región / Distrito</span>
                    <strong style={{ fontSize: 13, color: ENJ_NAVY }}>{selectedRegion || "ASV"} - {selectedDistrict}</strong>
                  </div>
                </div>

                {/* BIO */}
                {descripcion && (
                  <p style={{ fontStyle: "italic", color: "#444", fontSize: 13, lineHeight: 1.6, margin: "0 0 18px", padding: "0 10px" }}>
                    "{descripcion}"
                  </p>
                )}

                {/* INTERESES / GUSTOS */}
                {gustos.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                    {gustos.map((g) => (
                      <span key={g} style={{ background: "rgba(215,0,126,0.08)", color: ENJ_MAGENTA, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, border: "1px solid rgba(215,0,126,0.2)" }}>
                        #{g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN ESTADO DE CUOTAS (ESTRICTAMENTE PRIVADA) */}
            {isOwnProfile && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1.5px solid #BFDBFE", boxShadow: "0 4px 20px rgba(0,11,111,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <ShieldCheck size={18} color={ENJ_NAVY} />
                  <h3 style={{ margin: 0, fontSize: 15, color: ENJ_NAVY, fontWeight: 800 }}>Estado Privado de Cuotas ENJ 2026</h3>
                </div>
                {misPagos.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(0,11,111,0.6)", fontStyle: "italic" }}>
                    No has reportado cuotas todavía.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {misPagos.map((pago) => {
                      const isValidado = pago.estado === "validado" || pago.estatus_validacion === "Validado";
                      const isRechazado = pago.estado === "rechazado" || pago.estatus_validacion === "Rechazado";
                      return (
                        <div key={pago.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFBFF", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,11,111,0.08)" }}>
                          <div>
                            <strong style={{ fontSize: 12, color: ENJ_NAVY, display: "block" }}>{pago.concepto || "Cuota ENJ 2026"}</strong>
                            <span style={{ fontSize: 10, color: "rgba(0,11,111,0.5)" }}>
                              {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-VE") : "Sin fecha"}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 800, color: isValidado ? "#16A34A" : isRechazado ? "#DC2626" : "#D97706" }}>
                            {isValidado && <CheckCircle size={14} />}
                            {isRechazado && <AlertCircle size={14} />}
                            {!isValidado && !isRechazado && <Clock size={14} />}
                            {isValidado ? "Validado" : isRechazado ? "Rechazado" : "Pendiente"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CREDENCIAL QR PÚBLICA */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <h4 style={{ margin: "0 0 2px", fontSize: 14, color: ENJ_NAVY, fontWeight: 800 }}>Credencial QR Scout</h4>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(0,11,111,0.6)" }}>Escanéame en el evento para ver mi perfil público.</p>
              </div>
              <div style={{ background: "#fff", padding: 8, borderRadius: 10, border: "1px solid rgba(0,11,111,0.12)" }}>
                <QRCodeSVG value={qrPublicUrl} size={70} fgColor={ENJ_NAVY} />
              </div>
            </div>

            {/* MURO SOCIAL DE INTERACCIÓN */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Users size={18} color={ENJ_NAVY} />
                <h3 style={{ margin: 0, fontSize: 15, color: ENJ_NAVY, fontWeight: 800 }}>Muro del Elenco ENJ</h3>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input
                  type="text"
                  placeholder="Saluda o deja un mensaje para los Scouts..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleEnviarMensajeMuro())}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,11,111,0.15)", fontSize: 12, outline: "none" }}
                />
                <button type="button" onClick={handleEnviarMensajeMuro} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={15} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {comentarios.length === 0 ? (
                  <span style={{ fontSize: 12, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>Aún no hay mensajes en el muro.</span>
                ) : (
                  comentarios.map((c, idx) => (
                    <div key={c.id || idx} style={{ background: "#FAFBFF", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,11,111,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <strong style={{ fontSize: 12, color: ENJ_NAVY }}>{c.autor}</strong>
                        <span style={{ fontSize: 10, color: "rgba(0,11,111,0.4)" }}>
                          {c.fecha ? new Date(c.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#333" }}>{c.mensaje}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}