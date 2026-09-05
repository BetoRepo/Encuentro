import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Phone, ChevronDown, Camera, QrCode, MapPin, Heart, Instagram, ShieldCheck, Send, Users, CheckCircle, Clock, AlertCircle
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

const scoutRegions = [
  { region: "ARAGUA", districts: ["Guarico", "HENRI PITTIER", "JOSE FELIX RIBAS", "MANUEL ATANASIO GIRARDOT", "SANTIAGO MARIÑO", "SUCRE ZAMORA"] },
  { region: "ATENDIDOS POR LA OSN", districts: ["BOLIVAR", "COJEDES", "FALCON", "GUARAPICHE", "PORTUGUESA", "PUERTO LA CRUZ", "TRUJILLO", "YARACUY"] },
  { region: "CARABOBO", districts: ["GUACARA", "SAN ESTEBAN", "VALENCIA NORTE", "VALENCIA SUR"] },
  { region: "DISTRITO CAPITAL", districts: ["AVILA", "CARICUAO", "JOSE ANTONIO PAEZ", "LOS PROCERES", "MARISCAL SUCRE", "SANTIAGO DE LEON"] },
  { region: "LARA", districts: ["ANDRES ELOY BLANCO", "CATEDRAL", "CREPUSCULAR", "PALAVECINO"] },
  { region: "MERIDA", districts: ["CARI", "LIBERTADOR", "NO APLICA"] },
  { region: "METROPOLITANA", districts: ["BARUTA", "CHACAO", "SUCRE NORTE", "SUCRE SUR"] },
  { region: "MIRANDA", districts: ["ALTOS MIRANDINOS", "GUARENAS GUATIRE", "VALLES DEL TUY"] },
  { region: "TACHIRA", districts: ["RIO TORBES", "SAN CRISTOBAL ESTE", "SAN CRISTOBAL OESTE"] },
  { region: "ZULIA", districts: ["COQUIVACOA", "FRANCISCO POLANCO - PERIJA", "PEDRO HENRIQUEZ AMADO", "SAMUEL MARTINEZ", "SAN FRANCISCO", "ZULIA ORIENTAL"] },
];

const tiposRol = [
  "Protagonista (Joven participante)",
  "Equipo de Produccion (Adultos de Soporte)",
  "Directores (Staff)"
];

const ramas = ["Comunidad (Caminante)", "Clan (Rover)", "Dirigencia / Adulto de Soporte"];
const opcionesGustos = ["Fogata", "Intercambio de Pañoletas", "Talleres", "Feria de Ramas", "Juegos Nocturnos", "Música / Canto", "Deportes", "Hacer Amigos", "Logística", "Primeros Auxilios"];

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
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 4px" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,11,111,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.09em" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,11,111,0.1)" }} />
    </div>
  );
}

export function Perfil() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [rolEvento, setRolEvento] = useState("Joven Participante");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [grupoScout, setGrupoScout] = useState("");
  const [ramaScout, setRamaScout] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [gustos, setGustos] = useState<string[]>([]);
  const [foto, setFoto] = useState("");
  const [loading, setLoading] = useState(false);

  // Muro Social & Pagos Privados
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [misPagos, setMisPagos] = useState<any[]>([]);

  // Comprobar si el usuario conectado es el dueño del perfil
  const currentUser = JSON.parse(localStorage.getItem("enj_user") || "null");
  const isOwnProfile = currentUser && currentUser.id === userId;

  useEffect(() => {
    const loadProfileAndData = async () => {
      const user = JSON.parse(localStorage.getItem("enj_user") || "null");
      if (user) {
        setUserId(user.id);
        setCorreo(user.email || "");

        // 1. Cargar datos del perfil
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setNombre(data.nombre || "");
          setApellido(data.apellido || "");
          setBirthDate(data.birth_date || "");
          setRolEvento(data.rol_evento || "Joven Participante");
          setSelectedRegion(data.selected_region || "");
          setSelectedDistrict(data.selected_district || "");
          setGrupoScout(data.grupo_scout || "");
          setRamaScout(data.rama_scout || "");
          setTelefono(data.telefono || "");
          setDescripcion(data.descripcion || "");
          setInstagram(data.instagram || "");
          setGustos(data.gustos_evento || []);
          setFoto(data.foto || "");
        }

        // 2. Cargar pagos privados del usuario conectado
        const { data: pagosData } = await supabase
          .from("pagos")
          .select("*")
          .eq("usuario_id", user.id)
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

    // 4. Suscripción en Tiempo Real al Muro Social
    const channel = supabase
      .channel("muro_realtime")
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
  }, []);

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

  const handleSaveProfile = async () => {
    if (!nombre || !apellido || !selectedRegion || !selectedDistrict || !grupoScout) {
      return alert("Por favor completa los campos obligatorios (*)");
    }

    setLoading(true);
    try {
      const profilePayload = {
        id: userId,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        birth_date: birthDate,
        rol_evento: rolEvento,
        selected_region: selectedRegion,
        selected_district: selectedDistrict,
        grupo_scout: grupoScout,
        rama_scout: ramaScout,
        telefono: telefono.trim(),
        correo: correo.trim(),
        descripcion: descripcion.trim(),
        instagram: instagram.trim().replace("@", ""),
        gustos_evento: gustos,
        foto,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(profilePayload);
      if (error) throw error;

      alert("¡Perfil guardado con éxito!");
      navigate("/inscripcion");
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensajeMuro = async () => {
    if (!nuevoMensaje.trim()) return;
    const autorNombre = nombre ? `${nombre} ${apellido}` : "Scout Elenco";

    const { error } = await supabase.from("muro_social").insert([
      {
        autor: autorNombre,
        autor_id: userId,
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

  const qrPublicUrl = `${window.location.origin}/scout/${userId}`;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button type="button" onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.6)", fontSize: 14, fontWeight: 600, marginBottom: 22 }}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 100, textTransform: "uppercase" }}>Perfil Social & Casting</span>
          <h1 style={{ margin: "16px 0 10px", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: ENJ_NAVY }}>Tu Credencial de Elenco</h1>
          <p style={{ margin: 0, color: "rgba(0,11,111,0.68)", fontSize: 15, lineHeight: 1.7 }}>
            Completa tus datos para confirmar tu casting y genera tu QR de acceso. Comparte tus intereses, habilidades y vibra con el resto del elenco en un solo escaneo.
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
          <form style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* FOTO DE PERFIL */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <label htmlFor="foto-upload" style={{ cursor: "pointer", position: "relative" }}>
                <div style={{ width: 105, height: 105, borderRadius: "50%", border: `3px solid ${ENJ_NAVY}`, background: "#F4F5FA", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {foto ? <img src={foto} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={48} color="rgba(0,11,111,0.3)" />}
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: "50%", background: ENJ_MAGENTA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Camera size={16} />
                </div>
              </label>
              <input id="foto-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              <span style={{ fontSize: 12, color: "rgba(0,11,111,0.6)", fontWeight: 600 }}>Toca para subir tu foto de elenco</span>
            </div>

            <SectionDivider title="Datos Básicos" icon={<User size={16} color={ENJ_NAVY} />} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Nombre(s)" placeholder="Ej. María" value={nombre} onChange={setNombre} />
              <InputField label="Apellido(s)" placeholder="Ej. González" value={apellido} onChange={setApellido} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Fecha de nacimiento" type="date" value={birthDate} onChange={setBirthDate} />
              <SelectField label="Rol en el Evento" options={tiposRol} value={rolEvento} onChange={setRolEvento} />
            </div>

            <SectionDivider title="Ubicación y Estructura Scout" icon={<MapPin size={16} color={ENJ_NAVY} />} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SelectField label="Región Scout" options={scoutRegions.map((r) => r.region)} value={selectedRegion} onChange={(v: string) => { setSelectedRegion(v); setSelectedDistrict(""); }} />
              <SelectField label="Distrito Scout" options={scoutRegions.find((r) => r.region === selectedRegion)?.districts || []} value={selectedDistrict} onChange={setSelectedDistrict} disabled={!selectedRegion} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Grupo Scout" placeholder="Ej. Grupo 29" value={grupoScout} onChange={setGrupoScout} />
              <SelectField label="Unidad / Rama o Cargo" options={ramas} value={ramaScout} onChange={setRamaScout} />
            </div>

            <SectionDivider title="Tu Perfil Social y Habilidades" icon={<Heart size={16} color={ENJ_NAVY} />} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>Breve Biografía / Lema Scout</label>
              <textarea placeholder="Cuéntanos sobre ti, tus talentos o lo que aportas al elenco..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* SELECCIÓN DE GUSTOS Y HABILIDADES */}
            <div>
              <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, display: "block", marginBottom: 8 }}>Tus intereses, habilidades y vibra Scout:</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {opcionesGustos.map((item) => {
                  const selected = gustos.includes(item);
                  return (
                    <button key={item} type="button" onClick={() => toggleGusto(item)} style={{ padding: "6px 14px", borderRadius: 100, border: selected ? `1.5px solid ${ENJ_MAGENTA}` : "1.5px solid rgba(0,11,111,0.15)", background: selected ? "rgba(215,0,126,0.08)" : "#FAFBFF", color: selected ? ENJ_MAGENTA : ENJ_NAVY, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {selected ? "✓ " : "+ "}{item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Instagram (Opcional)" placeholder="ej. usuario" icon={<Instagram size={16} />} value={instagram} onChange={setInstagram} required={false} />
              <InputField label="Teléfono / WhatsApp" type="tel" icon={<Phone size={16} />} value={telefono} onChange={setTelefono} required={false} />
            </div>

            {/* ESTADO PRIVADO DE CUOTAS (SOLO VISIBLE PARA EL PROPIO SCOUT) */}
            {isOwnProfile && (
              <>
                <SectionDivider title="Estado de Cuotas ENJ 2026 (Privado)" icon={<ShieldCheck size={16} color={ENJ_NAVY} />} />
                <div style={{ background: "#EFF6FF", border: "1.5px solid #60A5FA", borderRadius: 16, padding: 18 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: ENJ_NAVY, fontWeight: 600 }}>
                    🔒 Esta información es privada y solo la puedes ver tú:
                  </p>
                  {misPagos.length === 0 ? (
                    <div style={{ fontSize: 13, color: "rgba(0,11,111,0.6)", fontStyle: "italic" }}>
                      No se registraron cuotas reportadas aún.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {misPagos.map((pago) => {
                        const isValidado = pago.estatus_validacion === "Validado";
                        const isRechazado = pago.estatus_validacion === "Rechazado";
                        return (
                          <div key={pago.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,11,111,0.1)" }}>
                            <div>
                              <strong style={{ fontSize: 13, color: ENJ_NAVY, display: "block" }}>{pago.concepto || "Cuota ENJ 2026"}</strong>
                              <span style={{ fontSize: 11, color: "rgba(0,11,111,0.5)" }}>
                                {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-VE") : "Sin fecha"}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: isValidado ? "#16A34A" : isRechazado ? "#DC2626" : "#D97706" }}>
                              {isValidado && <CheckCircle size={15} />}
                              {isRechazado && <AlertCircle size={15} />}
                              {!isValidado && !isRechazado && <Clock size={15} />}
                              {pago.estatus_validacion || "Pendiente"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* VISTA PREVIA Y QR PÚBLICO */}
            {userId && (
              <>
                <SectionDivider title="Tu Credencial QR de Elenco" icon={<QrCode size={16} color={ENJ_NAVY} />} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFF", border: "1.5px dashed rgba(0,11,111,0.2)", borderRadius: 16, padding: 20, flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 16, color: ENJ_NAVY, fontWeight: 800 }}>Muestra este QR al staff y elenco</h4>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(0,11,111,0.6)" }}>Permite que escaneen tus habilidades, datos de contacto y confirmación de casting.</p>
                  </div>
                  <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid rgba(0,11,111,0.1)" }}>
                    <QRCodeSVG value={qrPublicUrl} size={100} fgColor={ENJ_NAVY} />
                  </div>
                </div>

                {/* ESPACIO DE INTERACCIÓN DEL ELENCO (MURO SOCIAL) */}
                <SectionDivider title="Muro de Interacción del Elenco" icon={<Users size={16} color={ENJ_NAVY} />} />
                <div style={{ background: "#F4F5FA", border: "1px solid rgba(0,11,111,0.12)", borderRadius: 16, padding: 18 }}>
                  <p style={{ fontSize: 13, color: ENJ_NAVY, margin: "0 0 12px", fontWeight: 600 }}>
                    Espacio exclusivo para interactuar con otros miembros inscritos del ENJ 2026:
                  </p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input
                      type="text"
                      placeholder="Escribe un saludo o mensaje para el elenco..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleEnviarMensajeMuro())}
                      style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.2)", fontSize: 13, outline: "none" }}
                    />
                    <button type="button" onClick={handleEnviarMensajeMuro} style={{ background: ENJ_NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Send size={16} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 220, overflowY: "auto" }}>
                    {comentarios.length === 0 ? (
                      <span style={{ fontSize: 12, color: "rgba(0,11,111,0.5)", fontStyle: "italic" }}>Aún no hay mensajes en el muro. ¡Sé el primero en saludar!</span>
                    ) : (
                      comentarios.map((c, idx) => (
                        <div key={c.id || idx} style={{ background: "#fff", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,11,111,0.08)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <strong style={{ fontSize: 12, color: ENJ_NAVY }}>{c.autor}</strong>
                            <span style={{ fontSize: 10, color: "rgba(0,11,111,0.4)" }}>
                              {c.fecha ? new Date(c.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "#333" }}>{c.mensaje}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <button type="button" onClick={handleSaveProfile} disabled={loading} style={{ alignSelf: "flex-start", padding: "14px 28px", borderRadius: 10, border: "none", background: ENJ_MAGENTA, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {loading ? "Guardando..." : "Guardar Credencial de Elenco"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}