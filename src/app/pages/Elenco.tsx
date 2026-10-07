import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, User, Users } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { supabase } from "../../supabaseClient";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

interface PublicProfile {
  id: string;
  nombre: string | null;
  apellido: string | null;
  grupo_scout: string | null;
  selected_region: string | null;
  rama_scout: string | null;
  descripcion: string | null;
  foto: string | null;
}

export function Elenco() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id, nombre, apellido, grupo_scout, selected_region, rama_scout, descripcion, foto")
        .eq("rol", "participant")
        .not("nombre", "is", null)
        .order("nombre", { ascending: true });

      if (queryError) {
        console.error("Error cargando el elenco:", queryError);
        setError("No se pudo cargar el elenco. Inténtalo de nuevo más tarde.");
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    loadProfiles();
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: "36px 20px 72px", color: ENJ_NAVY }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: ENJ_MAGENTA, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Users size={18} /> Elenco ENJ 2026
          </div>
          <h1 style={{ margin: "10px 0 8px", fontSize: 32, fontWeight: 900 }}>Conoce a los participantes</h1>
          <p style={{ margin: 0, color: "rgba(0,11,111,0.68)" }}>
            Explora sus perfiles y envíales un apretón de manos.
          </p>
        </header>

        {loading ? (
          <p role="status" style={{ textAlign: "center", padding: 48 }}>Cargando participantes...</p>
        ) : error ? (
          <p role="alert" style={{ textAlign: "center", padding: 48, color: "#B91C1C" }}>{error}</p>
        ) : profiles.length === 0 ? (
          <p style={{ textAlign: "center", padding: 48 }}>Todavía no hay perfiles públicos disponibles.</p>
        ) : (
          <Carousel opts={{ align: "start", containScroll: "trimSnaps" }}>
            <CarouselPrevious
              aria-label="Participante anterior"
              style={{ left: -18, zIndex: 1, background: ENJ_MAGENTA, color: "#fff", border: "none" }}
            />
            <CarouselContent style={{ marginLeft: -12 }}>
              {profiles.map((profile) => {
                const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
                return (
                  <CarouselItem
                    key={profile.id}
                    className="basis-full sm:basis-1/2 lg:basis-1/3"
                    style={{ paddingLeft: 12 }}
                  >
                    <article style={{ height: "100%", overflow: "hidden", borderRadius: 24, background: "#fff", border: "1px solid rgba(0,11,111,0.08)", boxShadow: "0 14px 32px rgba(0,11,111,0.08)" }}>
                      <div style={{ height: 260, background: "#EAEFFF", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {profile.foto ? (
                          <img src={profile.foto} alt={`Foto de ${fullName}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <User size={76} color="rgba(0,11,111,0.3)" />
                        )}
                      </div>
                      <div style={{ padding: 20 }}>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{fullName}</h2>
                        <p style={{ minHeight: 38, margin: "10px 0", display: "flex", alignItems: "center", gap: 6, color: "rgba(0,11,111,0.68)", fontSize: 13 }}>
                          <MapPin size={16} color={ENJ_MAGENTA} />
                          {[profile.grupo_scout, profile.selected_region].filter(Boolean).join(" · ") || "Participante ENJ"}
                        </p>
                        {profile.rama_scout && (
                          <span style={{ display: "inline-block", marginBottom: 12, padding: "5px 10px", borderRadius: 99, background: "rgba(215,0,126,0.08)", color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800 }}>
                            {profile.rama_scout}
                          </span>
                        )}
                        {profile.descripcion && (
                          <p style={{ minHeight: 44, margin: "0 0 16px", color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
                            {profile.descripcion}
                          </p>
                        )}
                        <Link
                          to={`/scout/${profile.id}`}
                          style={{ display: "block", padding: "12px 16px", borderRadius: 14, background: ENJ_NAVY, color: "#fff", textAlign: "center", textDecoration: "none", fontWeight: 800 }}
                        >
                          Ver perfil y dar un apretón 🤝
                        </Link>
                      </div>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselNext
              aria-label="Participante siguiente"
              style={{ right: -18, zIndex: 1, background: ENJ_MAGENTA, color: "#fff", border: "none" }}
            />
          </Carousel>
        )}
      </div>
    </main>
  );
}
