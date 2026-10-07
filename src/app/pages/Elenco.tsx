import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Users } from "lucide-react";
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

function getSearchTokens(searchTerm: string) {
  return searchTerm
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ProfilePhoto({ profileId, name }: { profileId: string; name: string }) {
  const imageContainer = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    const element = imageContainer.current;
    if (!element) return;

    let cancelled = false;
    const loadPhoto = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("foto")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error(`Error cargando la foto del perfil ${profileId}:`, error);
        if (!cancelled) setFailed(true);
        return;
      }
      if (!cancelled && data?.foto) setPhoto(data.foto);
      else if (!cancelled) setFailed(true);
    };

    if (!("IntersectionObserver" in window)) {
      loadPhoto();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadPhoto();
        }
      },
      { rootMargin: "160px" },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [profileId]);

  return (
    <div
      ref={imageContainer}
      style={{
        position: "relative",
        height: 220,
        overflow: "hidden",
        background: "linear-gradient(145deg, #E7EAFE, #F9E8F3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {photo && !failed ? (
        <img
          src={photo}
          alt={`Foto de ${name}`}
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <div
          aria-label={failed ? `No hay foto disponible para ${name}` : undefined}
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.86)",
            color: ENJ_NAVY,
            fontSize: 30,
            fontWeight: 900,
            boxShadow: "0 8px 24px rgba(0,11,111,0.1)",
          }}
        >
          {initials}
        </div>
      )}
      <div style={{ position: "absolute", inset: "auto 0 0", height: 72, background: "linear-gradient(transparent, rgba(0,11,111,0.2))" }} />
    </div>
  );
}

export function Elenco() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRequestId = useRef(0);

  useEffect(() => {
    const requestId = ++searchRequestId.current;
    setProfiles([]);
    setOffset(0);
    setHasMore(false);
    setError("");
    setLoading(true);
    setLoadingMore(false);

    const timeout = window.setTimeout(async () => {
      let query = supabase
        .from("profiles")
        .select("id, nombre, apellido, grupo_scout, selected_region, rama_scout")
        .order("id", { ascending: true });

      getSearchTokens(searchTerm).forEach((token) => {
        query = query.or(`nombre.ilike.%${token}%,apellido.ilike.%${token}%`);
      });

      const { data, error: queryError } = await query.range(0, PROFILES_PER_PAGE - 1);
      if (requestId !== searchRequestId.current) return;

      if (queryError) {
        console.error("Error cargando el elenco:", queryError);
        setError("No se pudo cargar el elenco. Inténtalo de nuevo más tarde.");
      } else {
        setProfiles((data || []).filter((profile) => Boolean(profile.nombre?.trim())));
        setOffset(data?.length || 0);
        setHasMore((data?.length || 0) === PROFILES_PER_PAGE);
      }
      setLoading(false);
    }, searchTerm.trim() ? 250 : 0);

    return () => {
      window.clearTimeout(timeout);
      searchRequestId.current += 1;
    };
  }, [searchTerm]);

  const loadMoreProfiles = async () => {
    if (loadingMore || !hasMore) return;

    const requestId = searchRequestId.current;
    setLoadingMore(true);
    let query = supabase
      .from("profiles")
      .select("id, nombre, apellido, grupo_scout, selected_region, rama_scout")
      .order("id", { ascending: true });

    getSearchTokens(searchTerm).forEach((token) => {
      query = query.or(`nombre.ilike.%${token}%,apellido.ilike.%${token}%`);
    });

    const { data, error: queryError } = await query.range(offset, offset + PROFILES_PER_PAGE - 1);
    if (requestId !== searchRequestId.current) {
      setLoadingMore(false);
      return;
    }

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
          <label style={{ position: "relative", display: "block", maxWidth: 440, marginTop: 18 }}>
            <Search size={18} aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.48)" }} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              placeholder="Buscar por nombre o apellido"
              aria-label="Buscar participantes por nombre o apellido"
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 42px", border: "1px solid rgba(0,11,111,0.14)", borderRadius: 14, outlineColor: ENJ_MAGENTA, color: ENJ_NAVY, fontSize: 14 }}
            />
          </label>
      </header>

        {loading ? (
          <p role="status" style={{ textAlign: "center", padding: 32 }}>Cargando participantes...</p>
        ) : error && profiles.length === 0 ? (
          <p role="alert" style={{ textAlign: "center", padding: 32, color: "#B91C1C" }}>{error}</p>
        ) : profiles.length === 0 ? (
          <p style={{ textAlign: "center", padding: 32 }}>{searchTerm.trim() ? "No se encontraron participantes con ese nombre." : "Todavía no hay perfiles públicos disponibles."}</p>
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
                      <ProfilePhoto profileId={profile.id} name={fullName} />
                      <div style={{ padding: 20 }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, textAlign: "center", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{fullName}</h2>
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
