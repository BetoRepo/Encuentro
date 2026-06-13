import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Countdown } from "../components/Countdown";
import { MapPin, Calendar, Users, ChevronRight, Clock, Tent, Flame, Star } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#50039D";

interface EventItem {
  time: string;
  title: string;
}

interface AgendaDay {
  day: string;
  date: string;
  color: string;
  events: EventItem[];
}

interface BloquePrograma {
  title: string;
  tagline: string;
  desc: string;
}

// Componente SVG Nativo para el logo de la barra de navegación superior (Navbar)
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

  // Fecha del evento para la cuenta regresiva (11 de Septiembre de 2026)
  const targetDate = new Date("2026-09-11T08:00:00").getTime();

  // Función para hacer scroll suave hasta la sección informativa
  const scrollToInfo = () => {
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Datos de los Ejes Temáticos
  const bloques: BloquePrograma[] = [
    {
      title: "Desafío Generación Z",
      tagline: "Aldea Global",
      desc: "El mercado laboral evoluciona rápidamente y queremos que estés preparado para liderarlo. En este espacio te conectamos de forma directa con empresas líderes y ferias de empleo estratégicas. A través de nuestros talleres prácticos, desarrollarás las hard skills (habilidades técnicas) más demandadas hoy en día, asegurando que tu transición al mundo profesional sea un éxito rotundo."
    },
    {
      title: "La Red en Vivo",
      tagline: "Ciudadanía Activa",
      desc: "Tu voz y tus ideas tienen el poder de transformar el Movimiento Scout. Desde la Red de Jóvenes (RDJ) se impulsan espacios formales de participación ciudadana donde podrás formar parte de procesos electorales, liderar mesas de trabajo y debatir propuestas para la elaboración del manifiesto de San Juan de los Morros. El lugar ideal para construir redes de contacto (networking) y ejercer un liderazgo."
    },
    {
      title: "Puebleando por Guárico",
      tagline: "Ruta Viva",
      desc: "Descubre el potencial del Estado Guárico a través de una experiencia de campo única. Coordinamos una ruta turística integral, diseñada bajo un modelo de aprendizaje vivencial y de servicio comunitario. Nos encargamos de toda la planificación y logística de traslado para que vivas una aventura segura, conectes con la identidad local y sumes experiencias valiosas a tu crecimiento personal."
    },
    {
      title: "Vitamina",
      tagline: "Bienestar y Autocuidado",
      desc: "El éxito profesional y académico comienza con tu bienestar personal. Vitamina es un espacio formativo guiado por expertos de la salud para abordar de manera objetiva temas fundamentales en tu etapa de vida: nutrición balanceada, gestión de la salud mental y derechos sexuales y reproductivos. Te brindamos herramientas científicas y prácticas para tomar decisiones informadas y responsables."
    },
    {
      title: "La Churuata del Encuentro",
      tagline: "Espacios de Encuentro",
      desc: "Todo ecosistema de alto rendimiento necesita un espacio para la desconexión y el balance. En La Churuata diseñamos dinámicas de integración, actividades recreativas de tiempo libre y el uso óptimo de instalaciones pensadas para el esparcimiento saludable. Un punto de encuentro ideal para despejar la mente, compartir ideas y fortalecer los lazos de comunidad en un ambiente distendido."
    }
  ];

  // Programa de Actividades Virtuales
  const agendaVirtual: AgendaDay[] = [
    {
      day: "Martes",
      date: "01 Sep",
      color: "#3498db",
      events: [
        { time: "20:00 - 20:15", title: "Inicio de Oro (Bienvenida)" },
        { time: "20:15 - 20:45", title: "Normas y Protocolos" },
        { time: "20:45 - 21:15", title: "Plan Comunicacional" },
        { time: "21:15 - 21:40", title: "Ambientación y Cronograma" }
      ]
    },
    {
      day: "Jueves",
      date: "03 Sep",
      color: "#f1c40f",
      events: [
        { time: "19:30 - 21:20", title: "Motor RDJ (Red de Jóvenes)" }
      ]
    },
    {
      day: "Lunes",
      date: "07 Sep",
      color: "#9b59b6",
      events: [
        { time: "20:00 - 20:45", title: "Consejos de Abuelos (Buenas Prácticas)" },
        { time: "20:45 - 21:45", title: "La Red en Vivo (Mesa de Trabajo 1)" }
      ]
    },
    {
      day: "Miércoles",
      date: "09 Sep",
      color: "#e67e22",
      events: [
        { time: "20:00 - 20:45", title: "Vitamina (Bienestar y sus Dimensiones)" },
        { time: "20:45 - 21:45", title: "Acetaminofén (Comunidad y Bienestar Social)" }
      ]
    }
  ];

  // Cronograma Presencial
  const agendaPresencial: AgendaDay[] = [
    {
      day: "Viernes",
      date: "11 Sep",
      color: ENJ_NAVY,
      events: [
        { time: "08:00 - 12:00", title: "Llegada, Acreditación e Instalación de Campamento" },
        { time: "14:00 - 17:00", title: "Apertura de Feria de Oportunidades y Stands" },
        { time: "18:30 - 21:00", title: "Ceremonia Inaugural: El Despertar de la Red" },
        { time: "21:30 - 23:00", title: "Fogata de Hermandad y Dinámicas de Integración" }
      ]
    },
    {
      day: "Sábado",
      date: "12 Sep",
      color: ENJ_YELLOW,
      events: [
        { time: "07:00 - 08:00", title: "Despertar Scout y Desayuno" },
        { time: "08:30 - 12:30", title: "Bloque de Módulos Simultáneos (Hard Skills & Bienestar)" },
        { time: "12:30 - 14:00", title: "Almuerzo de Confraternidad" },
        { time: "14:30 - 17:30", title: "Foro Nacional de Jóvenes / Mesas de Debate Ciudadano" },
        { time: "19:30 - 23:30", title: "Festival Cultural y Fiesta de las Regiones" }
      ]
    },
    {
      day: "Domingo",
      date: "13 Sep",
      color: ENJ_MAGENTA,
      events: [
        { time: "07:30 - 08:30", title: "Levantamiento y Desayuno" },
        { time: "09:00 - 11:30", title: "Plenaria Final y Lectura del Manifiesto de la Juventud" },
        { time: "11:45 - 13:00", title: "Ceremonia de Clausura y Entrega de Reconocimientos" },
        { time: "13:30", title: "Almuerzo de Despedida y Retorno a las Provincias" }
      ]
    }
  ];

  return (
    <div style={{ background: "#F5F7FB", minHeight: "100vh" }}>
      {/* SECCIÓN HERO PRINCIPAL */}
      <header 
        style={{ 
          background: `linear-gradient(135deg, ${ENJ_NAVY} 0%, #00063D 100%)`, 
          color: "white", 
          padding: "90px 24px 70px", 
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <p style={{ color: ENJ_YELLOW, fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
            Scouts de Venezuela · Movimiento Scout Mundial
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>
              INSCRIPCIONES ABIERTAS 2026
            </span>
          </div>

          {/* DISEÑO TIPOGRÁFICO BASADO EN TEXTO (Inspirado en la imagen 2) */}
          <div style={{ margin: "0 auto 28px", padding: "0 10px" }}>
            <h1 
              style={{ 
                fontFamily: "'Inter', 'Montserrat', sans-serif",
                fontSize: "clamp(34px, 5.5vw, 52px)", 
                fontWeight: 800, 
                lineHeight: 1.1, 
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                margin: 0
              }}
            >
              Encuentro Nacional
            </h1>
            <h1 
              style={{ 
                fontFamily: "'Inter', 'Montserrat', sans-serif",
                fontSize: "clamp(36px, 6vw, 56px)", 
                fontWeight: 800, 
                lineHeight: 1.1, 
                letterSpacing: "-0.02em",
                color: ENJ_YELLOW,
                margin: "6px 0 0 0"
              }}
            >
              de Jóvenes
            </h1>
          </div>

          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.6 }}>
            El evento más importante del escultismo venezolano. Tres días de aventura, liderazgo y hermandad scout.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", padding: "10px 18px", borderRadius: 12, fontSize: 14 }}>
              <Calendar size={16} color={ENJ_YELLOW} />
              <span>11 Sep - 13 Sep</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", padding: "10px 18px", borderRadius: 12, fontSize: 14 }}>
              <MapPin size={16} color={ENJ_YELLOW} />
              <span>Guárico, Venezuela</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", padding: "10px 18px", borderRadius: 12, fontSize: 14 }}>
              <Users size={16} color={ENJ_YELLOW} />
              <span>+100 Jóvenes</span>
            </div>
          </div>

          {/* Cuenta Regresiva */}
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              Cuenta regresiva al evento
            </p>
            <Countdown targetDate={targetDate} />
          </div>

          {/* TRES BOTONES DE ACCIÓN (Con Scroll suave en "Ver información") */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            <button 
              onClick={() => navigate("/inscripcion")}
              style={{ background: ENJ_MAGENTA, color: "white", border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(80,3,157,0.4)" }}
            >
              Inscribirme ahora <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => navigate("/consultas")}
              style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Ver consultas
            </button>
            <button 
              onClick={scrollToInfo}
              style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
            >
              Ver información
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        
       <div ref={infoRef} style={{ textAlign: "center", marginBottom: 70, paddingTop: "20px" }}>
  <h2 
    style={{ 
      color: "#000B6F", 
      fontSize: "clamp(28px, 4.5vw, 36px)", 
      fontWeight: 800, 
      margin: "0 0 16px" 
    }}
  >
    ¿Qué es el ENJ?
  </h2>
  <p 
    style={{ 
      color: "#556080", 
      fontSize: "22px", 
      maxWidth: "750px", 
      margin: "0 auto", 
      lineHeight: "1.7" 
    }}
  >
    El Encuentro Nacional de Jóvenes 2026 es el espacio oficial de participación, empoderamiento y bienestar integral diseñado por y para la juventud de la Asociación de Scouts de Venezuela.

Este evento no es solo un campamento o una reunión más; es una plataforma estratégica donde los jóvenes de todo el país se conectan para alzar su voz, compartir su cultura y desarrollar propuestas reales que impacten directamente en el rumbo de nuestra institución.
  </p>
</div>

        {/* Ejes Temáticos */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ color: ENJ_NAVY, fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Los 5 grandes Bloques de programa</h2>
          <p style={{ color: "#666", fontSize: 15 }}>Descubre los grandes bloques de actividades preparados para ti</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 80 }}>
          {bloques.map((b, idx) => (
            <div key={idx} style={{ background: "white", padding: 28, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #EAEFF8" }}>
              <span style={{ color: ENJ_MAGENTA, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{b.tagline}</span>
              <h3 style={{ color: ENJ_NAVY, fontSize: 20, fontWeight: 700, margin: "6px 0 12px" }}>{b.title}</h3>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>

        {/* PROGRAMA DE ACTIVIDADES VIRTUALES */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ color: ENJ_NAVY, fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Programa de Actividades Virtuales</h2>
            <p style={{ color: "#666", fontSize: 15 }}>Sesiones previas de alineación y formación digital antes de vernos en Guárico</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {agendaVirtual.map((day, dIdx) => (
              <div key={dIdx} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #EAEFF8", display: "flex", flexWrap: "wrap" }}>
                <div style={{ background: day.color, color: day.color === "#f1c40f" ? ENJ_NAVY : "white", padding: "32px", width: "100%", maxWidth: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{day.day}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.9, fontWeight: 600 }}>{day.date}</p>
                </div>
                <div style={{ padding: "32px", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                  {day.events.map((ev, eIdx) => (
                    <div key={eIdx} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#666", fontSize: 13, fontWeight: 600, minWidth: "110px", paddingTop: "2px" }}>
                        <Clock size={14} style={{ color: day.color }} />
                        <span>{ev.time}</span>
                      </div>
                      <p style={{ margin: 0, color: ENJ_NAVY, fontSize: 15, fontWeight: 600 }}>{ev.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cronograma Presencial */}
        <div>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ color: ENJ_NAVY, fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Cronograma General</h2>
            <p style={{ color: "#666", fontSize: 15 }}>La distribución oficial de bloques para los tres días de vivencia presencial</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {agendaPresencial.map((day, dIdx) => (
              <div key={dIdx} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #EAEFF8", display: "flex", flexWrap: "wrap" }}>
                <div style={{ background: day.color, color: day.color === ENJ_YELLOW ? ENJ_NAVY : "white", padding: "32px", width: "100%", maxWidth: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{day.day}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.8, fontWeight: 600 }}>{day.date}</p>
                </div>
                <div style={{ padding: "32px", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                  {day.events.map((ev, eIdx) => (
                    <div key={eIdx} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#666", fontSize: 13, fontWeight: 600, minWidth: "110px", paddingTop: "2px" }}>
                        <Clock size={14} style={{ color: ENJ_MAGENTA }} />
                        <span>{ev.time}</span>
                      </div>
                      <p style={{ margin: 0, color: ENJ_NAVY, fontSize: 15, fontWeight: 600 }}>{ev.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}