import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, MapPin, Heart, ArrowLeft, Instagram, Award } from "lucide-react";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

export function PerfilPublico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
        if (data) setProfile(data);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [id]);

  if (loading) return <div style={{ textAlign: "center", padding: 80, fontFamily: "sans-serif", color: ENJ_NAVY }}>Cargando perfil Scout...</div>;
  if (!profile) return <div style={{ textAlign: "center", padding: 80, fontFamily: "sans-serif", color: ENJ_NAVY }}>Perfil no encontrado o no disponible.</div>;

  return (
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 450, margin: "0 auto" }}>
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(0,11,111,0.6)", marginBottom: 16, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Ir al Inicio
        </button>

        <div style={{ background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 10px 30px rgba(0,11,111,0.08)", textAlign: "center", position: "relative" }}>
          {/* Badge de Rama */}
          {profile.rama_scout && (
            <span style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,11,111,0.08)", color: ENJ_NAVY, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>
              {profile.rama_scout}
            </span>
          )}

          {/* Avatar */}
          <div style={{ width: 110, height: 110, borderRadius: "50%", margin: "0 auto 16px", border: `3px solid ${ENJ_MAGENTA}`, overflow: "hidden", background: "#F0F2FA" }}>
            {profile.foto ? (
              <img src={profile.foto} alt="Foto Scout" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={60} color="rgba(0,11,111,0.3)" style={{ marginTop: 20 }} />
            )}
          </div>

          {/* Nombre */}
          <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: ENJ_NAVY }}>
            {profile.nombre} {profile.apellido}
          </h2>

          {/* Grupo y Región */}
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(0,11,111,0.68)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <MapPin size={14} color={ENJ_MAGENTA} /> {profile.grupo_scout} • Región {profile.selected_region}
          </p>

          {/* Instagram */}
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(215,0,126,0.08)", color: ENJ_MAGENTA, textDecoration: "none", padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
              <Instagram size={14} /> @{profile.instagram}
            </a>
          )}

          {/* Biografía */}
          {profile.descripcion && (
            <div style={{ background: "#FAFBFF", padding: 16, borderRadius: 14, border: "1px solid rgba(0,11,111,0.08)", fontSize: 13, color: "#333", fontStyle: "italic", marginBottom: 24, lineHeight: 1.6 }}>
              "{profile.descripcion}"
            </div>
          )}

          {/* Intereses en el Evento */}
          <div style={{ textAlign: "left" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Heart size={14} color={ENJ_MAGENTA} /> Favoritos en el Evento
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.gustos_evento?.length > 0 ? (
                profile.gustos_evento.map((g: string, idx: number) => (
                  <span key={idx} style={{ background: "#F0F2FA", color: ENJ_NAVY, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8 }}>
                    #{g}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12, color: "#888" }}>No ha agregado favoritos aún.</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}