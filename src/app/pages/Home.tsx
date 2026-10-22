import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Countdown } from "../components/Countdown";
import { Calendar, Users, ChevronRight, Video } from "lucide-react";
import { Cronograma, faseOnline, fasePresencial } from "../components/Cronograma";
import logoImage from "../../assets/logonacional.svg";
import desafioGeneracionZ from "../../assets/DesafíoGeneraciónZ.svg";
import redEnVivo from "../../assets/LaRedEnVivo.svg";
import vitamina from "../../assets/Vitamina.svg";
import churuata from "../../assets/LaChuruatadelEncuentro.svg";
import heroBanner from "../../assets/herobanner.png";

// Importación del video local desde assets
import trailerVideo from "../../assets/trailer.mp4";
import churuataVideo from "../../assets/churuata.mp4";
import vitaminaVideo from "../../assets/vitamina.mp4";
import demoVideo from "../../assets/demo.mp4";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#50039D";

interface BloquePrograma {
  title: string;
  tagline: string;
  desc: string;
  logo?: string;
  logoAlt?: string;
}

export function ScoutsLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="22" fill={ENJ_YELLOW} />
      <path d="M22 8C22 8 14 15 14 22C14 26.4 17.6 30 22 30C26.4 30 30 26.4 30 22C30 15 22 8 22 8Z" fill={ENJ_NAVY} />
      <circle cx="22" cy="22" r="4" fill={ENJ_YELLOW} />
      <path d="M22 30V36" stroke={ENJ_NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 34H26" stroke={ENJ_NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 22H10" stroke={ENJ_NAVY} strokeWidth="2" strokeLinecap="round" />
      <path d="M34 22H30" stroke={ENJ_NAVY} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Home() {
  const navigate = useNavigate();
  const infoRef = useRef<HTMLDivElement>(null);

  const targetDate = new Date("2026-10-30T08:00:00").getTime();

  const scrollToInfo = () => {
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const bloques: BloquePrograma[] = [
    {
      title: "Desafío Generación Z",
      tagline: "Aldea Global",
      desc: "El mercado laboral evoluciona rápidamente y queremos que estés preparado para liderarlo. A través de nuestros talleres prácticos, desarrollarás las hard skills (habilidades técnicas) más demandadas hoy en día, asegurando que tu transición al mundo profesional sea un éxito rotundo.",
      logo: desafioGeneracionZ,
      logoAlt: "Logo Desafío Generación Z"
    },
    {
      title: "La Red en Vivo",
      tagline: "Ciudadanía Activa",
      desc: "Tu voz y tus ideas tienen el poder de transformar el Movimiento Scout. Desde la Red de Jóvenes (RDJ) se impulsan espacios formales de participación ciudadana donde podrás formar parte de procesos electorales, liderar mesas de trabajo y debatir propuestas.",
      logo: redEnVivo,
      logoAlt: "Logo La Red en Vivo"
    },
    {
      title: "Vitamina",
      tagline: "Bienestar y Autocuidado",
      desc: "El éxito profesional y académico comienza con tu bienestar personal. Vitamina es un espacio formativo guiado por expertos de la salud para abordar de manera objetiva temas fundamentales en tu etapa de vida: nutrición balanceada, gestión de la salud mental y derechos sexuales y reproductivos. Te brindamos herramientas científicas y prácticas para tomar decisiones informadas y responsables.",
      logo: vitamina,
      logoAlt: "Logo Vitamina"
    },
    {
      title: "La Churuata del Encuentro",
      tagline: "Espacios de Encuentro",
      desc: "Todo ecosistema de alto rendimiento necesita un espacio para la desconexión y el balance. En La Churuata diseñamos dinámicas de integración, actividades recreativas de tiempo libre y el uso óptimo de instalaciones pensadas para el esparcimiento saludable. Un punto de encuentro ideal para despejar la mente, compartir ideas y fortalecer los lazos de comunidad en un ambiente distendido.",
      logo: churuata,
      logoAlt: "Logo La Churuata del Encuentro"
    }
  ];

  // AQUÍ ESTÁN LOS TEXTOS DE LA PARTE INFERIOR DEL VIDEO
  const trailers = [
    {
      title: "Spoiler - Desafio Generacion Z",
      description: "¿List@ para encarar la vida adulta sin pánico? Descubre la Aldea Global en el Encuentro Nacional de Jóvenes y súmate al Desafío Generación Z. Aprende, crea y pásala bien mientras te preparas para el futuro.¡Únete y acepta el desafío!",
      videoUrl: trailerVideo
    },
    {
      title: "Spoiler - Churuata del Encuentro",
      description: "¿List@ para desconectarte, recargar energía y compartir con tu gente? Descubre La Churuata del Encuentro en el Encuentro Nacional de Jóvenes: dinámicas de integración, juegos y tiempo libre para despejar la mente y fortalecer los lazos de hermandad scout. ¡Ven, únete y vive el encuentro!",
      videoUrl: churuataVideo
    },
    {
      title: "Spoiler - Vitamina",
      description: "¿List@ para cuidarte por dentro y por fuera? Descubre Vitamina en el Encuentro Nacional de Jóvenes: un espacio con expertos de la salud para hablar sin tabúes de nutrición, salud mental y derechos sexuales y reproductivos. Llévate herramientas para tomar decisiones informadas. ¡Únete y dale vitamina a tu bienestar!",
      videoUrl: vitaminaVideo
    },
    {
      title: "Spoiler - Demo Days",
      description: "¿List@ para calentar motores antes del gran rodaje? Los Demo Days son la fase online del Encuentro Nacional de Jóvenes: tres días de conexión, mesas de trabajo y contenidos para que llegues a Aguirre con todo preparado. ¡Conéctate y vive el primer episodio de la temporada!",
      videoUrl: demoVideo
    }
  ];

  return (
    <div style={{ background: "#F5F7FB", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", boxSizing: "border-box" }}>
      {/* SECCIÓN HERO PRINCIPAL CON HEROBANNER DE FONDO */}
      <header
        style={{
          background: `linear-gradient(135deg, rgba(80, 3, 157, 0.55) 0%, rgba(0, 6, 61, 0.70) 100%), url(${heroBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          padding: "90px 16px 70px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box"
        }}
      >
        <div className="hero-shell" style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <p className="hero-kicker" style={{ color: ENJ_YELLOW, fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
            Scouts de Venezuela · Movimiento Scout Mundial
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <span className="hero-badge" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "white", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>
              INSCRIPCIONES ABIERTAS 2026
            </span>
          </div>

          <div style={{ margin: "0 auto 28px", padding: "0 10px" }}>
            <div style={{ position: "relative", width: "min(100%, 360px)", aspectRatio: "364 / 218", margin: "0 auto", display: "grid", placeItems: "center", overflow: "hidden", borderRadius: 18 }}>
              <img
                src={logoImage}
                alt="Encuentro Nacional de Jóvenes"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            </div>
          </div>

          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.9)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.6 }}>
            El show más grande del escultismo venezolano. Tres días donde tú eres el protagonista de la aventura, el liderazgo y la hermandad scout.
          </p>

          <div className="hero-meta" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 44 }}>
            <div className="hero-meta-item" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "10px 18px", borderRadius: 12, fontSize: 14 }}>
              <Calendar size={16} color={ENJ_YELLOW} />
              <span>30 Oct - 1 Nov · Aguirre</span>
            </div>
            <div className="hero-meta-item" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "10px 18px", borderRadius: 12, fontSize: 14 }}>
              <Users size={16} color={ENJ_YELLOW} />
              <span>+70 Jóvenes</span>
            </div>
          </div>

          <div className="countdown-wrapper" style={{ marginBottom: 44 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
              Cuenta regresiva al evento
            </p>
            <Countdown targetDate={targetDate} />
          </div>

          <div className="hero-cta-group" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            <button
              className="hero-primary-btn"
              onClick={() => navigate("/inscripcion")}
              style={{ background: ENJ_MAGENTA, color: "white", border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(80,3,157,0.4)" }}
            >
              Inscribirme ahora <ChevronRight size={16} />
            </button>
            <button
              className="hero-secondary-btn"
              onClick={() => navigate("/consultas")}
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "white", border: "1px solid rgba(255,255,255,0.25)", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Ver consultas
            </button>
            <button
              className="hero-secondary-btn"
              onClick={scrollToInfo}
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "white", border: "1px solid rgba(255,255,255,0.25)", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Ver información
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px", boxSizing: "border-box" }}>
        <div ref={infoRef} style={{ textAlign: "center", marginBottom: 70, paddingTop: "20px", boxSizing: "border-box" }}>
          <h2 style={{ color: "#000B6F", fontSize: "clamp(28px, 4.5vw, 36px)", fontWeight: 800, margin: "0 0 16px" }}>
            ¡Bienvenidos al Set Principal!
          </h2>
          <p style={{ color: "#556080", fontSize: "18px", maxWidth: "750px", margin: "0 auto", lineHeight: "1.7" }}>
            En esta temporada, la alfombra violeta se despliega para recibir a un elenco estelar que viene listo para enfrentar desafíos, ajustar su enfoque y potenciar su crecimiento. Aquí, cada participante deja de ser un espectador para convertirse en el protagonista de su propia historia.
            <br /><br />
            A través de este Guión de Temporada, vivirás una experiencia inmersiva. El éxito de esta producción depende de la conexión y de la capacidad de cada integrante para sintonizar con los objetivos estratégicos. En este escenario, las ideas fluyen en tiempo real, las decisiones se toman y la retroalimentación se vive en vivo.
          </p>
        </div>

        <div style={{ textAlign: "center", marginBottom: 70, paddingTop: "20px", boxSizing: "border-box" }}>
          <h2 style={{ color: "#4f006f", fontSize: "clamp(28px, 4.5vw, 36px)", fontWeight: 800, margin: "0 0 16px" }}>
            El Clímax de la Temporada
          </h2>
          <p style={{ color: "#061e64", fontSize: "18px", maxWidth: "750px", margin: "0 auto", lineHeight: "1.7" }}>
            Toda gran superproducción guarda su momento más esperado para el final. El clímax llegará cuando los reflectores se centren en la elección más importante: entre nuestro elenco, se elegirán a los dos nuevos Coordinadores Nacionales de la Red de Jóvenes, quienes asumirán el mando de la próxima temporada.
            <br /><br />
            Preparen sus posiciones, ajusten sus micrófonos y den su mejor actuación. El escenario está listo y el futuro está en sus manos.
            <br /><br />
            ¡Luces, cámara, particip-acción!
          </p>
        </div>

        {/* EJES TEMÁTICOS */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ color: ENJ_NAVY, fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>4 Realities, Una Sola Aventura</h2>
          <p style={{ color: "#666", fontSize: 15 }}>Sintoniza las grandes experiencias que tenemos preparadas para ti</p>
        </div>

        <div
          className="program-stack"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            marginBottom: 80,
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            className="program-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: 28,
              justifyContent: "center",
              alignItems: "stretch",
              maxWidth: 820,
              margin: "0 auto",
              width: "100%",
            }}
          >
            {bloques.slice(0, 2).map((b, idx) => (
              <div
                key={idx}
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #f8f5ff 100%)",
                  padding: "30px 28px 26px",
                  borderRadius: 24,
                  boxShadow: "0 10px 30px rgba(80, 3, 157, 0.08)",
                  border: "1px solid rgba(80, 3, 157, 0.08)",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  minHeight: 430,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 30,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 20,
                    overflow: "hidden",
                    background: "transparent"
                  }}
                >
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.logoAlt ?? b.title}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        background: ENJ_MAGENTA,
                        color: "white",
                        fontWeight: 800,
                        fontSize: 20,
                        display: "grid",
                        placeItems: "center"
                      }}
                    >
                      {b.title.charAt(0)}
                    </div>
                  )}
                </div>

                <span style={{ color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{b.tagline}</span>
                <h3 style={{ color: ENJ_NAVY, fontSize: 20, fontWeight: 800, margin: "12px 0 14px", lineHeight: 1.2 }}>{b.title}</h3>
                <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>

          <div
            className="program-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: 28,
              justifyContent: "center",
              alignItems: "stretch",
              maxWidth: 820,
              margin: "0 auto",
              width: "100%",
            }}
          >
            {bloques.slice(2).map((b, idx) => (
              <div
                key={idx + 2}
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #f8f5ff 100%)",
                  padding: "30px 28px 26px",
                  borderRadius: 24,
                  boxShadow: "0 10px 30px rgba(80, 3, 157, 0.08)",
                  border: "1px solid rgba(80, 3, 157, 0.08)",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  minHeight: 430,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 30,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 20,
                    overflow: "hidden",
                    background: "transparent"
                  }}
                >
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.logoAlt ?? b.title}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        background: ENJ_MAGENTA,
                        color: "white",
                        fontWeight: 800,
                        fontSize: 20,
                        display: "grid",
                        placeItems: "center"
                      }}
                    >
                      {b.title.charAt(0)}
                    </div>
                  )}
                </div>

                <span style={{ color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{b.tagline}</span>
                <h3 style={{ color: ENJ_NAVY, fontSize: 20, fontWeight: 800, margin: "12px 0 14px", lineHeight: 1.2 }}>{b.title}</h3>
                <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN SPOILERS (VIDEO ÚNICO LOCAL) */}
        <section style={{ marginBottom: 80 }}>
          {/* AQUÍ ESTÁN LOS TEXTOS DEL ENCABEZADO SUPERIOR */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(80,3,157,0.08)", padding: "6px 16px", borderRadius: 100, color: ENJ_MAGENTA, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              <Video size={16} color={ENJ_MAGENTA} />
            </div>
            <h2 style={{ color: ENJ_NAVY, fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Spoilers</h2>
            <p style={{ color: "#666", fontSize: 15 }}>Un vistazo furtivo a la gran aventura que nos espera en Aguirre</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {trailers.map((trailer) => (
              <div
                key={trailer.title}
                style={{
                  width: "100%",
                  maxWidth: 760,
                  margin: "0 auto",
                  background: "#ffffff",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(80, 3, 157, 0.08)",
                  border: "1px solid rgba(80, 3, 157, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Contenedor flexible del video para evitar cortes */}
                <div style={{ width: "100%", background: "#000", display: "flex", justifyContent: "center", maxHeight: "600px" }}>
                  <video
                    src={trailer.videoUrl}
                    controls
                    preload="metadata"
                    style={{
                      width: "100%",
                      maxHeight: "600px",
                      objectFit: "contain",
                      display: "block"
                    }}
                  />
                </div>
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <h3 style={{ color: ENJ_NAVY, fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
                    {trailer.title}
                  </h3>
                  <p style={{ color: "#555", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                    {trailer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CRONOGRAMA Y ESCALETA DE RODAJE */}
        <section>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ color: ENJ_NAVY, fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Cronograma de Rodaje</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <Cronograma fase={faseOnline} />
            <Cronograma fase={fasePresencial} />
          </div>
        </section>
      </main>

      {/* ESTILOS RESPONSIVOS */}
      <style>{`
        @media (min-width: 768px) {
          header {
            padding: 90px 24px 70px !important;
          }
          main {
            padding: 60px 24px !important;
          }
        }

        @media (max-width: 767px) {
          header {
            padding-top: 48px !important;
            padding-bottom: 42px !important;
          }

          main {
            padding: 32px 14px !important;
          }

          .hero-shell {
            max-width: 100% !important;
          }

          .hero-kicker {
            font-size: 10px !important;
            letter-spacing: 0.14em !important;
            line-height: 1.5 !important;
          }

          .hero-badge {
            font-size: 10px !important;
            padding: 8px 12px !important;
          }

          .hero-meta {
            gap: 8px !important;
          }

          .hero-meta-item {
            width: 100% !important;
            justify-content: center !important;
            font-size: 12px !important;
          }

          .countdown-wrapper {
            margin-bottom: 28px !important;
          }

          .hero-cta-group {
            gap: 10px !important;
          }

          .hero-primary-btn,
          .hero-secondary-btn {
            width: 100% !important;
            justify-content: center !important;
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .program-grid {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
          }

          .program-grid > div {
            width: 100% !important;
            max-width: 100% !important;
          }

          .program-stack > div {
            max-width: 100% !important;
          }

          .program-grid > div {
            min-height: unset !important;
            padding: 22px 18px !important;
          }

          .program-grid img {
            max-width: 110px !important;
            max-height: 110px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;