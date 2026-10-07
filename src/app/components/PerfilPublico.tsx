import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Handshake,
  Heart,
  Instagram,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import bannerImg from "../../assets/Bannerperfil.jpeg";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

interface PublicProfile {
  id: string;
  nombre: string | null;
  apellido: string | null;
  grupo_scout: string | null;
  selected_region: string | null;
  selected_district: string | null;
  rama_scout: string | null;
  foto: string | null;
  instagram: string | null;
  descripcion: string | null;
  gustos_evento: string[] | null;
  apretones_count: number | null;
}

export function PerfilPublico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [handshakeLoading, setHandshakeLoading] = useState(false);
  const [handshakeError, setHandshakeError] = useState("");
  const [hasHandshaked, setHasHandshaked] = useState(false);
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("enj_user") || "null") as { id?: string } | null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!id || !currentUser?.id) return;
    setHasHandshaked(localStorage.getItem(`enj_handshake_${currentUser.id}_${id}`) === "true");
  }, [currentUser?.id, id]);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!id) {
        setProfileError("No se especificó el perfil que quieres consultar.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, apellido, grupo_scout, selected_region, selected_district, rama_scout, foto, instagram, descripcion, gustos_evento, apretones_count")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error cargando perfil:", error);
        setProfileError("No se pudo cargar este perfil. Inténtalo de nuevo más tarde.");
      }
      setProfile(data);
      setLoading(false);
    };
    fetchPublicProfile();
  }, [id]);

  const handleHandshake = async () => {
    if (!profile || !currentUser?.id || currentUser.id === profile.id || hasHandshaked || handshakeLoading) return;

    setHandshakeLoading(true);
    setHandshakeError("");
    const { error } = await supabase
      .from("profiles")
      .update({ apretones_count: (profile.apretones_count || 0) + 1 })
      .eq("id", profile.id);

    if (error) {
      console.error("Error enviando apretón de manos:", error);
      setHandshakeError("No se pudo enviar el apretón de manos. Inténtalo de nuevo.");
    } else {
      setProfile({ ...profile, apretones_count: (profile.apretones_count || 0) + 1 });
      setHasHandshaked(true);
      localStorage.setItem(`enj_handshake_${currentUser.id}_${profile.id}`, "true");
    }
    setHandshakeLoading(false);
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#F0F2FA", color: ENJ_NAVY }}>
        <p role="status">Preparando perfil...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#F0F2FA", color: ENJ_NAVY }}>
        <div style={{ maxWidth: 440, textAlign: "center", background: "#fff", padding: 32, borderRadius: 24, boxShadow: "0 16px 40px rgba(0,11,111,0.1)" }}>
          <h1 style={{ margin: "0 0 10px", fontSize: 22 }}>Perfil no disponible</h1>
          <p role="alert" style={{ margin: "0 0 20px", color: "#64748B" }}>{profileError || "No encontramos este perfil."}</p>
          <button type="button" onClick={() => navigate(currentUser ? "/perfil" : "/")} style={{ border: 0, borderRadius: 12, padding: "11px 18px", background: ENJ_NAVY, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
            Volver
          </button>
        </div>
      </main>
    );
  }

  const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim() || "Participante ENJ";
  const initial = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <main style={{ minHeight: "100vh", padding: "32px 18px 64px", background: "linear-gradient(180deg, #E7EAFE 0, #F5F6FC 360px, #F5F6FC 100%)", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate(currentUser ? "/perfil" : "/")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 15px", marginBottom: 20, border: "1px solid rgba(0,11,111,0.08)", borderRadius: 99, background: "rgba(255,255,255,0.88)", color: ENJ_NAVY, cursor: "pointer", fontWeight: 800, boxShadow: "0 4px 14px rgba(0,11,111,0.06)" }}
        >
          <ArrowLeft size={17} /> {currentUser ? "Volver a mi perfil" : "Ir al inicio"}
        </button>

        <article style={{ overflow: "hidden", borderRadius: 30, background: "#fff", boxShadow: "0 24px 60px rgba(0,11,111,0.14)", border: "1px solid rgba(0,11,111,0.06)" }}>
          <header style={{ height: 190, position: "relative", padding: "26px 30px", overflow: "hidden", backgroundImage: `linear-gradient(to bottom, rgba(0, 11, 111, 0.25), rgba(0, 11, 111, 0.65)), url(${bannerImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 9, color: "#fff", fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <Sparkles size={17} color="#F7BF16" /> Elenco ENJ 2026
            </div>
            {profile.rama_scout && (
              <span style={{ position: "absolute", zIndex: 1, top: 24, right: 24, maxWidth: "55%", padding: "8px 14px", borderRadius: 99, background: "rgba(255,255,255,0.94)", color: ENJ_NAVY, fontSize: 12, fontWeight: 900, textAlign: "center" }}>
                {profile.rama_scout}
              </span>
            )}
            <div style={{ position: "absolute", left: 30, bottom: 24, color: "rgba(255,255,255,0.88)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>Conoce a</div>
              <div style={{ marginTop: 5, fontSize: 25, fontWeight: 900 }}>Una historia Scout</div>
            </div>
          </header>

          <div style={{ padding: "0 clamp(20px, 5vw, 48px) 38px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: -78, position: "relative", zIndex: 2 }}>
              <div style={{ width: 164, height: 164, padding: 5, borderRadius: "50%", background: "linear-gradient(135deg, #D7007E, #F7BF16, #000B6F)", boxShadow: "0 12px 30px rgba(215,0,126,0.22)" }}>
                <div style={{ width: "100%", height: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "5px solid #fff", borderRadius: "50%", background: "linear-gradient(145deg, #EEF0FC, #FBEAF4)" }}>
                  {profile.foto ? (
                    <img src={profile.foto} alt={`Foto de ${fullName}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <span aria-label={`Iniciales de ${fullName}`} style={{ color: ENJ_NAVY, fontSize: 38, fontWeight: 900 }}>{initial}</span>
                  )}
                </div>
              </div>

              <h1 style={{ margin: "18px 0 8px", color: ENJ_NAVY, fontSize: "clamp(27px, 5vw, 38px)", lineHeight: 1.12, fontWeight: 900, letterSpacing: "-0.035em" }}>
                {fullName}
              </h1>
              <p style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 7, margin: 0, color: "#526080", fontSize: 15, fontWeight: 600 }}>
                <MapPin size={17} color={ENJ_MAGENTA} />
                {[profile.grupo_scout, profile.selected_district, profile.selected_region].filter(Boolean).join(" · ") || "Participante ENJ"}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 22 }}>
                <button
                  type="button"
                  onClick={handleHandshake}
                  disabled={!currentUser?.id || currentUser.id === profile.id || hasHandshaked || handshakeLoading}
                  aria-label="Enviar un apretón de manos"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                    padding: "13px 22px",
                    border: hasHandshaked ? `2px solid ${ENJ_MAGENTA}` : "2px solid transparent",
                    borderRadius: 99,
                    background: hasHandshaked ? "rgba(215,0,126,0.08)" : `linear-gradient(115deg, ${ENJ_NAVY}, #202EAA)`,
                    color: hasHandshaked ? ENJ_MAGENTA : "#fff",
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: !currentUser?.id || currentUser.id === profile.id || hasHandshaked || handshakeLoading ? "not-allowed" : "pointer",
                    opacity: !currentUser?.id || currentUser.id === profile.id ? 0.68 : 1,
                    boxShadow: hasHandshaked ? "none" : "0 8px 20px rgba(0,11,111,0.22)",
                  }}
                >
                  <Handshake size={18} />
                  {handshakeLoading ? "Enviando..." : hasHandshaked ? "Apretón enviado" : "Apretón de manos"}
                  <span style={{ minWidth: 25, padding: "3px 8px", borderRadius: 99, background: "rgba(255,255,255,0.18)" }}>
                    {profile.apretones_count || 0}
                  </span>
                </button>
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", borderRadius: 99, background: "#FFF0F8", color: ENJ_MAGENTA, textDecoration: "none", fontSize: 14, fontWeight: 900 }}>
                    <Instagram size={17} /> @{profile.instagram}
                  </a>
                )}
              </div>
              {!currentUser?.id && <span style={{ marginTop: 10, color: "#64748B", fontSize: 12 }}>Inicia sesión para enviar un apretón.</span>}
              {currentUser?.id === profile.id && <span style={{ marginTop: 10, color: "#64748B", fontSize: 12 }}>Este es tu perfil.</span>}
              {handshakeError && <span role="alert" style={{ marginTop: 10, color: "#B91C1C", fontSize: 12 }}>{handshakeError}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16, marginTop: 32 }}>
              <section style={{ padding: 22, border: "1px solid #E8EBF6", borderRadius: 22, background: "linear-gradient(145deg, #FCFCFF, #F8F9FE)" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 9, margin: "0 0 14px", color: ENJ_NAVY, fontSize: 14, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  <Award size={18} color={ENJ_MAGENTA} /> Mi lema Scout
                </h2>
                <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.75, fontStyle: profile.descripcion ? "italic" : "normal" }}>
                  {profile.descripcion ? `“${profile.descripcion}”` : "Este participante todavía no ha agregado una biografía."}
                </p>
              </section>

              <section style={{ padding: 22, border: "1px solid #E8EBF6", borderRadius: 22, background: "linear-gradient(145deg, #FCFCFF, #F8F9FE)" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 9, margin: "0 0 14px", color: ENJ_NAVY, fontSize: 14, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  <Heart size={18} color={ENJ_MAGENTA} /> Lo que le gusta del evento
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profile.gustos_evento?.length ? profile.gustos_evento.map((gusto) => (
                    <span key={gusto} style={{ padding: "8px 11px", borderRadius: 11, background: "#EEF0FC", color: ENJ_NAVY, fontSize: 12, fontWeight: 800 }}>
                      #{gusto}
                    </span>
                  )) : (
                    <span style={{ color: "#64748B", fontSize: 13 }}>Todavía no ha agregado intereses.</span>
                  )}
                </div>
              </section>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
