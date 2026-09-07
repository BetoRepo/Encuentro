import { useState, useEffect } from "react";
import { FileText, Upload, CheckCircle, Users, Scroll, AlertCircle, Check } from "lucide-react";
import { scoutRegions } from "./Inscripcion";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#50039D";

// Extraer lista única de todos los distritos scouts a nivel nacional
const distritos = Array.from(
  new Set(scoutRegions.flatMap((region) => region.districts.map(({ district }) => district)))
).sort();

// Función auxiliar para obtener la Región correspondiente a un Distrito
const getRegionByDistrict = (districtName: string): string => {
  const foundRegion = scoutRegions.find((r) =>
    r.districts.some((d) => d.district === districtName)
  );
  return foundRegion ? foundRegion.region : "Desconocida";
};

const areasPrograma = [
  {
    id: "waigunga",
    title: "Acuerdos de Waingunga",
    desc: "Sube las resoluciones, acuerdos metodológicos y documentos oficiales emanados de Waigunga.",
    icon: <Scroll size={22} color={ENJ_NAVY} />,
    color: "#2D9CDB",
  },
  {
    id: "comunidad",
    title: "Congresos de Comunidad Caminantes",
    desc: "Resultados, propuestas y relatorías de las asambleas y congresos de la sección Caminantes.",
    icon: <Users size={22} color={ENJ_NAVY} />,
    color: "#BB6BD9",
  },
  {
    id: "clan",
    title: "Congresos de Comunidad Rover",
    desc: "Documentos, acuerdos de gestión y actas de los Congresos Nacionales o Regionales de Rovers.",
    icon: <FileText size={22} color={ENJ_NAVY} />,
    color: ENJ_MAGENTA,
  },
  {
    id: "jar",
    title: "Juego Amplio Regional (JAR)",
    desc: "Informes de participación, propuestas y minutas de las Jornadas de Actualización o Reencuentro.",
    icon: <CheckCircle size={22} color={ENJ_NAVY} />,
    color: "#F2994A",
  },
];

export function Consultas() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [districtAlreadySubmitted, setDistrictAlreadySubmitted] = useState<boolean>(false);
  const [checkingDistrict, setCheckingDistrict] = useState<boolean>(false);
  const [user, setUser] = useState<{ id?: string; name?: string; email?: string } | null>(null);

  const [formData, setFormData] = useState<Record<string, { summary: string; file: File | null }>>({
    waigunga: { summary: "", file: null },
    comunidad: { summary: "", file: null },
    clan: { summary: "", file: null },
    jar: { summary: "", file: null },
  });

  const [savingArea, setSavingArea] = useState<string | null>(null);
  const [completedAreas, setCompletedAreas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("enj_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      setDistrictAlreadySubmitted(false);
      return;
    }

    const checkDistrictStatus = async () => {
      setCheckingDistrict(true);
      const { data, error } = await supabase
        .from("consultas_distritales")
        .select("id, respuestas")
        .eq("distrito", selectedDistrict)
        .maybeSingle();

      if (!error && data) {
        setDistrictAlreadySubmitted(true);
        if (data.respuestas) {
          const completed: Record<string, boolean> = {};
          Object.keys(data.respuestas).forEach((key) => {
            completed[key] = true;
          });
          setCompletedAreas(completed);
        }
      } else {
        setDistrictAlreadySubmitted(false);
        setCompletedAreas({});
      }
      setCheckingDistrict(false);
    };

    checkDistrictStatus();
  }, [selectedDistrict]);

  const handleTextChange = (id: string, text: string) => {
    setFormData((prev) => ({ ...prev, [id]: { ...prev[id], summary: text } }));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [id]: { ...prev[id], file } }));
  };

  const titleForArea = (id: string) => areasPrograma.find((area) => area.id === id)?.title || id;

  const handleSubmit = async (id: string) => {
    if (!selectedDistrict) return alert("Selecciona tu Distrito Scout antes de continuar.");
    
    const data = formData[id];
    if (!data.file) return alert("Selecciona un archivo PDF o Word antes de guardar el reporte.");
    if (data.file.size > 15 * 1024 * 1024) return alert("El archivo no puede superar los 15 MB.");

    setSavingArea(id);
    try {
      // 1. Limpiar el nombre del archivo y preparar la ruta para el bucket
      const fileExt = data.file.name.split('.').pop();
      const sanitizedDistrict = selectedDistrict.replace(/\s+/g, '_').toLowerCase();
      const fileName = `${sanitizedDistrict}_${id}_${Date.now()}.${fileExt}`;
      const filePath = `distritos/${fileName}`; // Guardamos dentro de una subcarpeta "distritos"

      // 2. Subir archivo a Supabase Storage (Bucket: documentos-enj)
      const { error: uploadError, data: uploadData } = await supabase
        .storage
        .from('documentos-enj')
        .upload(filePath, data.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Obtener la URL Pública del archivo
      const { data: publicUrlData } = supabase
        .storage
        .from('documentos-enj')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // 4. Guardar los metadatos en la base de datos (consultas_distritales)
      const regionName = getRegionByDistrict(selectedDistrict);
      const responsableNombre = user?.name || user?.email || "Responsable Distrital";

      const { data: existingData } = await supabase
        .from("consultas_distritales")
        .select("respuestas")
        .eq("distrito", selectedDistrict)
        .maybeSingle();

      const currentAnswers = existingData?.respuestas || {};
      const updatedAnswers = {
        ...currentAnswers,
        [id]: {
          summary: data.summary,
          file_name: data.file.name,
          file_path: filePath,
          file_url: fileUrl, // <--- Este es el enlace que usará PanelPrograma
          uploaded_at: new Date().toISOString(),
        },
      };

      const { error: dbError } = await supabase
        .from("consultas_distritales")
        .upsert(
          {
            region: regionName,
            distrito: selectedDistrict,
            responsable_nombre: responsableNombre,
            respuestas: updatedAnswers,
            estatus: "enviado",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "distrito" }
        );

      if (dbError) throw dbError;

      setFormData((prev) => ({ ...prev, [id]: { summary: "", file: null } }));
      setCompletedAreas((prev) => ({ ...prev, [id]: true }));
      setDistrictAlreadySubmitted(true);

      alert(`¡Éxito! El reporte de "${titleForArea(id)}" ha sido guardado correctamente.`);
    } catch (error: any) {
      console.error("Error en la sumisión:", error);
      alert("No se pudo cargar el reporte. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSavingArea(null);
    }
  };

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        
        {/* CABECERA */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-block", marginBottom: 12 }}>
            <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 18px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Espacio de Consultas Juveniles
            </span>
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
            Rating Nacional: La Voz de la Juventud
          </h1>
          <p style={{ margin: "0 auto", color: "rgba(0,11,111,0.65)", fontSize: 15, maxWidth: 640, lineHeight: 1.7 }}>
            Toda gran producción necesita un guión sólido antes de salir al aire. Este espacio es la central de datos donde recopilamos la voz, las ideas y las propuestas de la juventud de todo el país.
          </p>
        </div>

        {/* SELECCIÓN DE DISTRITO */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 32, boxShadow: "0 4px 16px rgba(0,11,111,0.06)", border: "1.5px solid rgba(0,11,111,0.08)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: "1 1 280px" }}>
              <label htmlFor="global-district-select" style={{ fontSize: 13, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                1. Selecciona tu Distrito Scout *
              </label>
              <select id="global-district-select" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.2)", background: "#fff", color: ENJ_NAVY, fontSize: 14, fontWeight: 600, outline: "none" }}>
                <option value="">-- Haz clic para elegir tu Distrito --</option>
                {distritos.map((district) => (
                  <option key={district} value={district}>Distrito {district}</option>
                ))}
              </select>
            </div>
            {selectedDistrict && (
              <div style={{ background: "rgba(0,11,111,0.04)", padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(0,11,111,0.08)", fontSize: 13, color: ENJ_NAVY }}>
                <span style={{ fontWeight: 600 }}>Región:</span> {getRegionByDistrict(selectedDistrict)}
              </div>
            )}
          </div>
          
          {checkingDistrict && <p style={{ margin: 0, fontSize: 13, color: ENJ_NAVY }}>Verificando entregas previas del distrito...</p>}
          {districtAlreadySubmitted && !checkingDistrict && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(242,153,74,0.12)", border: "1px solid rgba(242,153,74,0.4)", padding: "10px 14px", borderRadius: 10, color: "#B76200", fontSize: 13, fontWeight: 600 }}>
              <AlertCircle size={18} color="#B76200" />
              <span>El Distrito <strong>{selectedDistrict}</strong> ya cuenta con respuestas en el sistema. Puedes agregar o actualizar las áreas restantes.</span>
            </div>
          )}
        </div>

        {/* GRILLA DE ÁREAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {areasPrograma.map(({ id, title, desc, icon, color }) => {
            const isCompleted = completedAreas[id];

            return (
              <div key={id} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,11,111,0.06)", border: isCompleted ? "2px solid #27AE60" : "1px solid rgba(0,11,111,0.08)", display: "flex", flexDirection: "column" }}>
                <div style={{ background: color, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>{title}</h3>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isCompleted ? <Check size={22} color="#fff" /> : icon}
                  </div>
                </div>

                <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(0,11,111,0.65)", lineHeight: 1.6 }}>{desc}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>Resumen o Notas Clave</label>
                    <textarea
                      placeholder="Escribe los puntos más importantes tratados o acordados..."
                      value={formData[id].summary}
                      onChange={(e) => handleTextChange(id, e.target.value)}
                      style={{ width: "100%", minHeight: "80px", borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>Documento Oficial (PDF / Word) *</label>
                    <label style={{ border: "2px dashed rgba(0,11,111,0.18)", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", background: "rgba(240,242,250,0.4)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <Upload size={20} color="rgba(0,11,111,0.4)" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: formData[id].file ? ENJ_NAVY : "rgba(0,11,111,0.6)", wordBreak: "break-all" }}>
                        {formData[id].file ? formData[id].file?.name : "Haz clic para seleccionar el archivo"}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(0,11,111,0.4)" }}>Formatos: .pdf, .doc, .docx (Máx. 15MB)</span>
                      <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => handleFileChange(id, e.target.files?.[0] || null)} />
                    </label>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 8 }}>
                    <button
                      onClick={() => handleSubmit(id)}
                      disabled={savingArea === id || !selectedDistrict}
                      style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: !selectedDistrict ? "#BDC3C7" : isCompleted ? "#27AE60" : color, color: "#fff", fontSize: 14, fontWeight: 700, cursor: !selectedDistrict ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "transform 0.15s" }}
                    >
                      {savingArea === id ? "Subiendo..." : isCompleted ? "Actualizar Reporte" : "Guardar Reporte"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}