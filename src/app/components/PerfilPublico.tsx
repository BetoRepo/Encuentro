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
    <div style={{ background: "#F0F2FA", minHeight: "100vh", padding: "20px 14px 40px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(0,11,111,0.7)",
            marginBottom: 18,
            padding: "8px 0",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          <ArrowLeft size={18} /> Ir al Inicio
        </button>

        <div
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "30px 24px 28px",
            boxShadow: "0 18px 40px rgba(0,11,111,0.12)",
            textAlign: "center",
            position: "relative",
          }}
        >
          {profile.rama_scout && (
            <span
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "rgba(0,11,111,0.08)",
                color: ENJ_NAVY,
                fontSize: 12,
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: 100,
              }}
            >
              {profile.rama_scout}
            </span>
          )}

          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              margin: "0 auto 18px",
              border: `4px solid ${ENJ_MAGENTA}`,
              overflow: "hidden",
              background: "#F0F2FA",
              boxShadow: "0 10px 24px rgba(215,0,126,0.18)",
            }}
          >
            {profile.foto ? (
              <img src={profile.foto} alt="Foto Scout" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={76} color="rgba(0,11,111,0.3)" style={{ marginTop: 28 }} />
            )}
          </div>

          <h2 style={{ margin: "0 0 8px", fontSize: 34, fontWeight: 900, color: ENJ_NAVY, lineHeight: 1.15 }}>
            {profile.nombre} {profile.apellido}
          </h2>

          <p
            style={{
              margin: "0 0 22px",
              fontSize: 17,
              color: "rgba(0,11,111,0.74)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
              fontWeight: 600,
            }}
          >
            <MapPin size={18} color={ENJ_MAGENTA} /> {profile.grupo_scout} • Región {profile.selected_region}
          </p>

          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(215,0,126,0.08)",
                color: ENJ_MAGENTA,
                textDecoration: "none",
                padding: "10px 18px",
                borderRadius: 100,
                fontSize: 15,
                fontWeight: 800,
                marginBottom: 24,
              }}
            >
              <Instagram size={17} /> @{profile.instagram}
            </a>
          )}

          {profile.descripcion && (
            <div
              style={{
                background: "#FAFBFF",
                padding: 20,
                borderRadius: 18,
                border: "1px solid rgba(0,11,111,0.08)",
                fontSize: 17,
                color: "#333",
                fontStyle: "italic",
                marginBottom: 28,
                lineHeight: 1.6,
                textAlign: "left",
              }}
            >
              "{profile.descripcion}"
            </div>
          )}

          <div style={{ textAlign: "left" }}>
            <h4
              style={{
                margin: "0 0 14px",
                fontSize: 15,
                fontWeight: 900,
                color: ENJ_NAVY,
                display: "flex",
                alignItems: "center",
                gap: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <Heart size={17} color={ENJ_MAGENTA} /> Favoritos en el Evento
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {profile.gustos_evento?.length > 0 ? (
                profile.gustos_evento.map((g: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      background: "#F0F2FA",
                      color: ENJ_NAVY,
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "8px 12px",
                      borderRadius: 10,
                    }}
                  >
                    #{g}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 14, color: "#888" }}>No ha agregado favoritos aún.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}