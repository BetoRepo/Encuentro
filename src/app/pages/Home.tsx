import { useNavigate } from "react-router";
import { Countdown } from "../components/Countdown";
import { MapPin, Calendar, Users, Tent, Flame, Star, ChevronRight, Clock } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

function ScoutsLogo({ size = 44 }: { size?: number }) {
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

const agenda = [
  {
    day: "Viernes 11",
    date: "11 Sep",
    color: ENJ_NAVY,
    events: [
      { time: "08:00 – 12:00", title: "Llegada y registro de participantes" },
      { time: "12:00 – 14:00", title: "Almuerzo de bienvenida" },
      { time: "15:00 – 18:00", title: "Apertura oficial y acto inaugural" },
      { time: "19:00 – 21:00", title: "Fogón de inicio · Noche de campamento" },
    ],
  },
  {
    day: "Sábado 12",
    date: "12 Sep",
    color: ENJ_MAGENTA,
    events: [
      { time: "07:00 – 08:30", title: "Formación matutina y desayuno" },
      { time: "09:00 – 12:00", title: "Talleres y actividades por ramas" },
      { time: "14:00 – 17:00", title: "Gran Hike ENJ · Reto de orientación" },
      { time: "20:00 – 23:00", title: "Noche cultural y presentaciones artísticas" },
    ],
  },
  {
    day: "Domingo 13",
    date: "13 Sep",
    color: "#1A8F3C",
    events: [
      { time: "07:30 – 09:00", title: "Desayuno y servicio comunitario" },
      { time: "10:00 – 11:30", title: "Asamblea nacional de jóvenes scouts" },
      { time: "12:00 – 13:30", title: "Ceremonia de clausura y premiación" },
      { time: "14:00", title: "Retorno a grupos de origen" },
    ],
  },
];

const highlights = [
  { icon: <Tent size={22} color={ENJ_NAVY} />, title: "Campamento Oficial", desc: "3 días de aventura en plena naturaleza llanera de Guárico" },
  { icon: <Users size={22} color={ENJ_NAVY} />, title: "+2.000 Jóvenes", desc: "Scouts de todos los estados de Venezuela reunidos" },
  { icon: <Flame size={22} color={ENJ_NAVY} />, title: "Fogón Nacional", desc: "La tradición más esperada del escultismo venezolano" },
  { icon: <Star size={22} color={ENJ_NAVY} />, title: "Talleres y Retos", desc: "Actividades de liderazgo, orientación y trabajo en equipo" },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── HERO ── */}
      <section
        style={{
          background: `linear-gradient(140deg, ${ENJ_NAVY} 0%, #001299 55%, #0018C0 100%)`,
          position: "relative",
          overflow: "hidden",
          padding: "72px 24px 96px",
        }}
      >
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(247,191,22,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(215,0,126,0.08)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <ScoutsLogo size={60} />
          </div>

          {/* org label */}
          <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, color: ENJ_YELLOW, textTransform: "uppercase", letterSpacing: "0.18em" }}>
            Scouts de Venezuela · Movimiento Scout Mundial
          </p>

          {/* badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 18px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Inscripciones Abiertas · 2026
            </span>
          </div>

          {/* title */}
          <h1
            style={{
              margin: "0 0 14px",
              color: "#fff",
              fontSize: "clamp(38px, 7vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Encuentro Nacional
            <br />
            <span style={{ color: ENJ_YELLOW }}>de Jóvenes</span>
          </h1>

          <p style={{ margin: "0 auto 28px", color: "rgba(255,255,255,0.72)", fontSize: 17, maxWidth: 520, lineHeight: 1.65 }}>
            El evento más importante del escultismo venezolano. Tres días de aventura, liderazgo y hermandad scout.
          </p>

          {/* meta pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 52 }}>
            {[
              { icon: <Calendar size={14} />, text: "11 · 12 · 13 Septiembre 2026" },
              { icon: <MapPin size={14} />, text: "Guárico, Venezuela" },
              { icon: <Users size={14} />, text: "+2.000 Participantes" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 100,
                  padding: "7px 16px",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  fontWeight: 500,
                  backdropFilter: "blur(6px)",
                }}
              >
                {icon}
                {text}
              </div>
            ))}
          </div>

          {/* COUNTDOWN */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 20 }}>
              Cuenta regresiva al evento
            </p>
            <Countdown />
          </div>

          {/* CTA */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/inscripcion")}
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, #B5006A 100%)`,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(215,0,126,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(215,0,126,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(215,0,126,0.4)"; }}
            >
              Inscribirme ahora
              <ChevronRight size={18} />
            </button>
            <a
              href="#info"
              style={{
                padding: "14px 28px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                backdropFilter: "blur(6px)",
                background: "rgba(255,255,255,0.07)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            >
              Ver información
            </a>
          </div>
        </div>
      </section>

      {/* wave */}
      <div style={{ background: `linear-gradient(140deg, ${ENJ_NAVY} 0%, #0018C0 100%)`, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", height: 60 }}>
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#F0F2FA" />
        </svg>
      </div>

      {/* ── HIGHLIGHTS ── */}
      <section id="info" style={{ padding: "64px 24px 0", background: "#F0F2FA" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
              ¿Qué es el ENJ?
            </h2>
            <p style={{ margin: "0 auto", color: "rgba(0,11,111,0.55)", fontSize: 16, maxWidth: 560, lineHeight: 1.7 }}>
              El Encuentro Nacional de Jóvenes reúne a scouts de todo Venezuela en una experiencia única de aventura, fraternidad y crecimiento personal.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20 }}>
            {highlights.map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "28px 24px",
                  boxShadow: "0 2px 16px rgba(0,11,111,0.07)",
                  border: "1px solid rgba(0,11,111,0.06)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(0,11,111,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {icon}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: ENJ_NAVY }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(0,11,111,0.55)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATES BANNER ── */}
      <section style={{ padding: "60px 24px 0", background: "#F0F2FA" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${ENJ_NAVY} 0%, #001AB5 100%)`,
              borderRadius: 20,
              padding: "40px 32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 28,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(247,191,22,0.07)", pointerEvents: "none" }} />

            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: ENJ_YELLOW, textTransform: "uppercase", letterSpacing: "0.14em" }}>Fecha y lugar</p>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
                11, 12 y 13 de Septiembre
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.75)", fontSize: 15 }}>
                <MapPin size={16} color={ENJ_YELLOW} />
                <span>Guárico, Venezuela</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Vie 11", "Sáb 12", "Dom 13"].map((d, i) => (
                <div
                  key={d}
                  style={{
                    background: i === 1 ? ENJ_MAGENTA : "rgba(255,255,255,0.1)",
                    border: i === 1 ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    padding: "14px 20px",
                    textAlign: "center",
                    minWidth: 70,
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: i === 1 ? "#fff" : ENJ_YELLOW }}>{10 + i + 1}</p>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: i === 1 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sep</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENDA ── */}
      <section style={{ padding: "60px 24px", background: "#F0F2FA" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
              Programa del Evento
            </h2>
            <p style={{ margin: "0 auto", color: "rgba(0,11,111,0.55)", fontSize: 15, maxWidth: 480, lineHeight: 1.7 }}>
              Tres días llenos de actividades, aventura y momentos inolvidables.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20 }}>
            {agenda.map(({ day, date, color, events }) => (
              <div
                key={day}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 2px 16px rgba(0,11,111,0.07)",
                  border: "1px solid rgba(0,11,111,0.06)",
                }}
              >
                {/* day header */}
                <div
                  style={{
                    background: color,
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>{day}</h3>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 100,
                    }}
                  >
                    {date}
                  </span>
                </div>

                {/* events */}
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {events.map(({ time, title }) => (
                    <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginTop: 1 }}>
                        <Clock size={12} color={color} />
                        <span style={{ fontSize: 11, fontWeight: 700, color, whiteSpace: "nowrap" }}>{time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "#2D2D5A", lineHeight: 1.5, fontWeight: 500 }}>{title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: "0 24px 80px", background: "#F0F2FA" }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, #960055 100%)`,
            borderRadius: 20,
            padding: "44px 36px",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(215,0,126,0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
            ¡No te quedes fuera!
          </h2>
          <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,0.82)", fontSize: 15, lineHeight: 1.65 }}>
            Los cupos son limitados. Asegura tu lugar en el ENJ 2026 completando tu inscripción ahora.
          </p>
          <button
            onClick={() => navigate("/inscripcion")}
            style={{
              padding: "14px 36px",
              borderRadius: 12,
              border: "none",
              background: ENJ_YELLOW,
              color: ENJ_NAVY,
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Inscribirme ahora
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
