import React, { useState } from "react";
import { X, Upload, Sparkles, Send } from "lucide-react";
import { supabase } from "../../supabaseClient";

interface Props {
  insignia: { id: string; nombre: string };
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SolicitudInsigniaModal({ insignia, userId, onClose, onSuccess }: Props) {
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
    if (!descripcion.trim()) return alert("Por favor describe cómo completaste este reto.");

    setLoading(true);
    try {
      let fotoUrl = "";

      // Subir evidencia fotográfica si el joven adjuntó archivo
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

      // Registrar la solicitud para revisión del Staff
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

      alert("¡Solicitud enviada con éxito al Equipo de Evaluación ENJ!");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error enviando la prueba: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative" }}>
        
        <button type="button" onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#000B6F" }}>
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Sparkles color="#D7007E" size={20} />
          <h3 style={{ margin: 0, fontSize: 18, color: "#000B6F", fontWeight: 800 }}>Demuestra tu Logro</h3>
        </div>

        <p style={{ fontSize: 13, color: "#555", margin: "0 0 16px" }}>
          Insignia: <strong style={{ color: "#D7007E" }}>{insignia.nombre}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#000B6F", display: "block", marginBottom: 6 }}>
              ¿Cómo completaste esta prueba o reto? *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Escribe detalles del taller, acción comunitaria o reto realizado..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#000B6F", display: "block", marginBottom: 6 }}>
              Foto / Evidencia (Opcional)
            </label>
            <label htmlFor="evidencia-file" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 10, border: "1.5px dashed #000B6F", background: "#FAFBFF", cursor: "pointer" }}>
              <Upload size={16} color="#000B6F" />
              <span style={{ fontSize: 12, color: "#000B6F", fontWeight: 600 }}>
                {file ? file.name : "Subir foto del reto"}
              </span>
            </label>
            <input id="evidencia-file" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </div>

          {preview && (
            <img src={preview} alt="Vista previa" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }} />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "#D7007E",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <Send size={16} />
            {loading ? "Enviando revisión..." : "Enviar a Validación del Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}