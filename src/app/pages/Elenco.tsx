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
}

const PROFILES_PER_PAGE = 24;

export function Elenco() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id, nombre, apellido, grupo_scout, selected_region, rama_scout")
        .order("id", { ascending: true })
        .range(0, PROFILES_PER_PAGE - 1);

      if (queryError) {
        console.error("Error cargando el elenco:", queryError);
        setError("No se pudo cargar el elenco. Inténtalo de nuevo más tarde.");
      } else {
        setProfiles((data || []).filter((profile) => Boolean(profile.nombre?.trim())));
        setOffset(data?.length || 0);
        setHasMore((data?.length || 0) === PROFILES_PER_PAGE);
      }
      setLoading(false);
    };

    loadProfiles();
  }, []);

  const loadMoreProfiles = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const { data, error: queryError } = await supabase
      .from("profiles")
      .select("id, nombre, apellido, grupo_scout, selected_region, rama_scout")
      .order("id", { ascending: true })
      .range(offset, offset + PROFILES_PER_PAGE - 1);

    if (queryError) {
      console.error("Error cargando más participantes:", queryError);
      setError("No se pudieron cargar más participantes. Inténtalo de nuevo.");
    } else {
      setProfiles((current) => [
        ...current,
        ...(data || []).filter((profile) => Boolean(profile.nombre?.trim())),
      ]);
      setOffset((current) => current + (data?.length || 0));
      setHasMore((data?.length || 0) === PROFILES_PER_PAGE);
      setError("");
    }
    setLoadingMore(false);
  };

  return (
    <section aria-labelledby="elenco-heading" style={{ padding: 24, color: ENJ_NAVY, background: "#fff", borderRadius: 24, border: "1px solid rgba(0,11,111,0.05)", boxShadow: "0 10px 30px rgba(0,11,111,0.04)" }}>
      <header style={{ marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: ENJ_MAGENTA, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Users size={18} /> Elenco ENJ 2026
          </div>
          <h2 id="elenco-heading" style={{ margin: "8px 0 6px", fontSize: 22, fontWeight: 900 }}>Conoce a los participantes</h2>
          <p style={{ margin: 0, color: "rgba(0,11,111,0.68)", fontSize: 14 }}>
            Explora sus perfiles y envíales un apretón de manos.
          </p>
      </header>

        {loading ? (
          <p role="status" style={{ textAlign: "center", padding: 32 }}>Cargando participantes...</p>
        ) : error && profiles.length === 0 ? (
          <p role="alert" style={{ textAlign: "center", padding: 32, color: "#B91C1C" }}>{error}</p>
        ) : profiles.length === 0 ? (
          <p style={{ textAlign: "center", padding: 32 }}>Todavía no hay perfiles públicos disponibles.</p>
        ) : (
          <Carousel opts={{ align: "start", containScroll: "trimSnaps" }} style={{ margin: "0 20px" }}>
            <CarouselPrevious
              aria-label="Participante anterior"
              style={{ left: -24, zIndex: 1, background: ENJ_MAGENTA, color: "#fff", border: "none" }}
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
                        <div style={{ width: 76, height: 76, margin: "0 auto 16px", borderRadius: "50%", background: "rgba(0,11,111,0.08)", color: ENJ_NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900 }}>
                          {fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                        </div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textAlign: "center" }}>{fullName}</h2>
                        <p style={{ minHeight: 38, margin: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "rgba(0,11,111,0.68)", fontSize: 13 }}>
                          <MapPin size={16} color={ENJ_MAGENTA} />
                          {[profile.grupo_scout, profile.selected_region].filter(Boolean).join(" · ") || "Participante ENJ"}
                        </p>
                        {profile.rama_scout && (
                          <span style={{ display: "block", width: "fit-content", margin: "0 auto 12px", padding: "5px 10px", borderRadius: 99, background: "rgba(215,0,126,0.08)", color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800 }}>
                            {profile.rama_scout}
                          </span>
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
              style={{ right: -24, zIndex: 1, background: ENJ_MAGENTA, color: "#fff", border: "none" }}
            />
          </Carousel>
        )}
        {error && profiles.length > 0 && (
          <p role="alert" style={{ margin: "16px 0 0", color: "#B91C1C", textAlign: "center", fontSize: 13 }}>{error}</p>
        )}
        {!loading && hasMore && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button
              type="button"
              onClick={loadMoreProfiles}
              disabled={loadingMore}
              style={{ padding: "11px 20px", border: "none", borderRadius: 12, background: ENJ_NAVY, color: "#fff", fontWeight: 800, cursor: loadingMore ? "wait" : "pointer" }}
            >
              {loadingMore ? "Cargando..." : "Cargar más participantes"}
            </button>
          </div>
        )}
    </section>
  );
}
