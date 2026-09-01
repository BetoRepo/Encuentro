import { useState } from "react";
import { FileText, Upload, CheckCircle, Users, Scroll, HelpCircle } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#50039D";
const SUPABASE_FUNCTION_URL = "https://ikiqphxigtwkjhiachqg.supabase.co/functions/v1/manage-drive";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const distritos = ["Aragua", "Carabobo", "Distrito Capital", "Lara", "Mérida", "Metropolitana", "Miranda", "Táchira", "Zulia", "Otro"];

// Definimos los 4 pilares de información que solicitas
const areasPrograma = [
  {
    id: "waigunga",
    title: "Acuerdos de Waingunga",
    desc: "Sube las resoluciones, acuerdos metodológicos y documentos oficiales emanados de Waigunga.",
    icon: <Scroll size={22} color={ENJ_NAVY} />,
    color: "#2D9CDB", // Azul informativo
  },
  {
    id: "comunidad",
    title: "Congresos de Comunidad Caminantes",
    desc: "Resultados, propuestas y relatorías de las asambleas y congresos de la sección Caminantes.",
    icon: <Users size={22} color={ENJ_NAVY} />,
    color: "#BB6BD9", // Morado comunidad
  },
  {
    id: "clan",
    title: "Congresos de Comunidad Rover",
    desc: "Documentos, acuerdos de gestión y actas de los Congresos Nacionales o Regionales de Rovers.",
    icon: <FileText size={22} color={ENJ_NAVY} />,
    color: ENJ_MAGENTA, // Magenta institucional
  },
  {
    id: "jar",
    title: "Juego Amplio Regional (JAR)",
    desc: "Informes de participación, propuestas y minutas de las Jornadas de Actualización o Reencuentro.",
    icon: <CheckCircle size={22} color={ENJ_NAVY} />,
    color: "#F2994A", // Naranja JAR
  },
];

export function Consultas() {
  // Estado para manejar el texto libre y el archivo cargado de cada área
  const [formData, setFormData] = useState<Record<string, { summary: string; file: File | null; district: string }>>({
    waigunga: { summary: "", file: null, district: "" },
    comunidad: { summary: "", file: null, district: "" },
    clan: { summary: "", file: null, district: "" },
    jar: { summary: "", file: null, district: "" },
  });
  const [savingArea, setSavingArea] = useState<string | null>(null);

  const handleTextChange = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: { ...prev[id], summary: text },
    }));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [id]: { ...prev[id], file: file },
    }));
  };

  const handleDistrictChange = (id: string, district: string) => {
    setFormData((prev) => ({ ...prev, [id]: { ...prev[id], district } }));
  };

  const handleSubmit = async (id: string) => {
    const data = formData[id];
    if (!data.district) return alert("Selecciona tu distrito antes de cargar el archivo.");
    if (!data.file) return alert("Selecciona un archivo antes de guardar el reporte.");
    if (data.file.size > 15 * 1024 * 1024) return alert("El archivo no puede superar los 15 MB.");

    setSavingArea(id);
    try {
      const folderForm = new FormData();
      folderForm.append("action", "create_folder");
      folderForm.append("destination", "consultas");
      folderForm.append("folder_name", `${data.district} - ${titleForArea(id)}`);
      const folderResponse = await fetch(SUPABASE_FUNCTION_URL, { method: "POST", headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, body: folderForm });
      const folderResult = await readDriveResponse(folderResponse);

      const fileForm = new FormData();
      fileForm.append("action", "upload_file");
      fileForm.append("folder_id", folderResult.folderId);
      fileForm.append("file", data.file, data.file.name);
      fileForm.append("custom_name", `${data.district}_${id}`);
      const uploadResponse = await fetch(SUPABASE_FUNCTION_URL, { method: "POST", headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, body: fileForm });
      await readDriveResponse(uploadResponse);
      setFormData((prev) => ({ ...prev, [id]: { summary: "", file: null, district: "" } }));
      alert("Reporte cargado correctamente.");
    } catch (error: any) {
      alert(error.message || "No se pudo cargar el reporte.");
    } finally {
      setSavingArea(null);
    }
  };

  const readDriveResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json() : { error: await response.text() };
    if (!response.ok) throw new Error(body.error || "Google Drive rechazó la carga.");
    return body;
  };

  const titleForArea = (id: string) => areasPrograma.find((area) => area.id === id)?.title || id;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        
        {/* ── CABECERA DE LA PESTAÑA ── */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ display: "inline-block", marginBottom: 12 }}>
            <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 18px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Espacio de Consultas
            </span>
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
            Reporte de consultas juveniles
          </h1>
          <p style={{ margin: "0 auto", color: "rgba(0,11,111,0.55)", fontSize: 16, maxWidth: 580, lineHeight: 1.7 }}>
            ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
          </p>
        </div>

        {/* ── GRILLA DE FORMULARIOS (ESTILO HOME) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {areasPrograma.map(({ id, title, desc, icon, color }) => (
            <div
              key={id}
              style={{
                background: "#fff",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,11,111,0.06)",
                border: "1px solid rgba(0,11,111,0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Encabezado de la Tarjeta con el Color del Área */}
              <div
                style={{
                  background: color,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{title}</h3>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </div>
              </div>

              {/* Cuerpo del Formulario */}
              <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(0,11,111,0.6)", lineHeight: 1.6 }}>
                  {desc}
                </p>

                {/* Campo: Conclusiones/Resumen Breve */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Resumen o Notas Clave
                  </label>
                  <textarea
                    placeholder="Escribe los puntos más importantes tratados o acordados..."
                    value={formData[id].summary}
                    onChange={(e) => handleTextChange(id, e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      borderRadius: 10,
                      border: "1.5px solid rgba(0,11,111,0.15)",
                      padding: "10px 12px",
                      fontSize: 13,
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = color)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,11,111,0.15)")}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor={`district-${id}`} style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>Distrito</label>
                  <select id={`district-${id}`} value={formData[id].district} onChange={(e) => handleDistrictChange(id, e.target.value)} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", background: "#fff", color: ENJ_NAVY }}>
                    <option value="">Selecciona tu distrito</option>
                    {distritos.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                </div>

                {/* Campo: Subida de Documento (Input File Escondido con label estilizado) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Documento Oficial (PDF / Word)
                  </label>
                  <label
                    style={{
                      border: "2px dashed rgba(0,11,111,0.15)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "rgba(240,242,250,0.4)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(240,242,250,0.8)";
                      e.currentTarget.style.borderColor = color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(240,242,250,0.4)";
                      e.currentTarget.style.borderColor = "rgba(0,11,111,0.15)";
                    }}
                  >
                    <Upload size={20} color="rgba(0,11,111,0.4)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: ENJ_NAVY }}>
                      {formData[id].file ? formData[id].file?.name : "Seleccionar archivo"}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(0,11,111,0.4)" }}>
                      Máx. 15MB
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(id, e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  <button
                    onClick={() => handleSubmit(id)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 10,
                      border: "none",
                      background: color,
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      transition: "transform 0.15s, filter 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.filter = "brightness(0.95)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.filter = "none";
                    }}
                  >
                    {savingArea === id ? "Cargando..." : "Guardar Reporte"}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}