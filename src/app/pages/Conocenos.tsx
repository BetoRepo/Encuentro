import { useNavigate } from "react-router-dom";
import MonitorsCarousel from "../components/MonitorsCarousel";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";
const ASSET_BASE = import.meta.env.BASE_URL;

const imagePhoto = (file: string) => `${ASSET_BASE}images/${file}`;
const staffPhoto = (file: string) => `${ASSET_BASE}assets/staff/${file}`;
const initialsFor = (text: string) =>
  text
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

type Monitor = {
  team: string;
  name: string;
  photo?: string;
};

const monitors: Monitor[] = [
  {
    team: "Equipo Bolibomba",
    name: "Eymer Cañizales",
    photo: imagePhoto("bolibomba.svg"),
  },
  {
    team: "Equipo Samba",
    name: "Sabrina Noguera",
    photo: imagePhoto("samba.svg"),
  },
  {
    team: "Equipo Chao",
    name: "Miguel Ciavato",
    photo: imagePhoto("chao.svg"),
  },
  {
    team: "Equipo Pirulín",
    name: "Julio Gómez",
    photo: imagePhoto("pirulin.svg"),
  },
  {
    team: "Equipo Cricrí",
    name: "Alejandro Jiménez",
    photo: imagePhoto("cricri.svg"),
  },
  {
    team: "Equipo Savoy",
    name: "Hungría Molina",
    photo: imagePhoto("savoy.svg"),
  },
  {
    team: "Equipo Reinita",
    name: "Laurys Rivero",
    photo: imagePhoto("reinita.svg"),
  },
  {
    team: "Equipo Cocosete",
    name: "Andrés Figuera",
    photo: imagePhoto("cocosete.svg"),
  },
  {
    team: "Equipo Tiptop",
    name: "Juan Molina",
    photo: imagePhoto("tiptop.svg"),
  },
  {
    team: "Equipo Toronto",
    name: "Stefani Bueno",
    photo: imagePhoto("toronto.svg"),
  },
];

type Coordinator = {
  area: string;
  title: string;
  name: string;
  theme: string;
};

const coordinators: Coordinator[] = [
  {
    area: "Aldea Global",
    title: "Coordinador de Aldea Global",
    name: "Sebastián Conde",
    theme: "Desafío Generación Z",
  },
  {
    area: "Ciudadanía Activa",
    title: "Coordinador de Ciudadanía Activa",
    name: "Emilys Barrios",
    theme: "La Red en Vivo",
  },
  {
    area: "Ruta Viva",
    title: "Coordinador de Ruta Viva",
    name: "César Quintero",
    theme: "Turisteando por Guárico",
  },
  {
    area: "Bienestar y Autocuidado",
    title: "Coordinador de Bienestar y Autocuidado",
    name: "Andrés Marín",
    theme: "Vitamina",
  },
  {
    area: "Espacios de Encuentro",
    title: "Coordinador de Espacios de Encuentro",
    name: "Irene Monsalve",
    theme: "La Churuata del Encuentro",
  },
];

const orgChart = {
  leader: {
    name: "William Bruno",
    role: "Asesor Nacional",
    photo: staffPhoto("william-bruno.jpg"),
  },
  branches: [
    {
      manager: {
        name: "Michelle Lozada",
        role: "Coordinadora de Programa de Jóvenes",
        photo: staffPhoto("michelle-lozada.jpg"),
      },
      assistant: {
        name: "Valentina Tenías",
        role: "Staff Juvenil",
      },
    },
    {
      manager: {
        name: "Mariana Alvarado",
        role: "Coordinadora de Gestión de Riesgo",
        photo: staffPhoto("mariana-alvarado.jpg"),
      },
      assistant: {
        name: "Giuseelly Rodríguez",
        role: "Staff Juvenil",
      },
    },
    {
      manager: {
        name: "Anna Colmenares",
        role: "Coordinadora de Administración",
        photo: staffPhoto("anna-colmenares.jpg"),
      },
      assistant: {
        name: "Freddy Pineda",
        role: "Staff Juvenil",
      },
    },
    {
      manager: {
        name: "Isabel Bazán",
        role: "Coordinadora de Comunicaciones",
        photo: staffPhoto("isabel-bazan.jpg"),
      },
      assistant: {
        name: "Victoria Sánchez",
        role: "Staff Juvenil",
      },
    },
    {
      manager: {
        name: "Sandra Peraza",
        role: "Coordinadora de Adultes en el Movimiento",
        photo: staffPhoto("sandra-peraza.jpg"),
      },
      assistant: {
        name: "Apoyo Operativo en Campo",
        role: "Equipo de Campo",
      },
    },
  ],
};

export function Conocenos() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#F0F2FA", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 2048, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(0,11,111,0.7)",
            fontSize: 14,
            fontWeight: 600,
            padding: 0,
            marginBottom: 28,
          }}
        >
          ← Volver al inicio
        </button>

        <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px, 4vw, 48px)", boxShadow: "0 24px 60px rgba(0,11,111,0.08)" }}>
          <div style={{ display: "grid", gap: 24 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ENJ_MAGENTA }}>
                Conócenos · Staff Central
              </p>
              <h1 style={{ margin: "16px 0 18px", fontSize: "clamp(34px, 4vw, 50px)", fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.03em" }}>
                El equipo que hace posible el Encuentro Nacional de Jóvenes.
              </h1>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.85, color: "rgba(0,11,111,0.75)" }}>
                Conoce al staff central y descubre cómo se organiza el trabajo tras bambalinas para ofrecer una experiencia segura, divertida y transformadora.
              </p>
            </div>

            <div style={{ marginTop: 12 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, color: ENJ_NAVY }}>Organigrama del equipo</h2>
              <p style={{ margin: "0 0 18px", fontSize: 15, color: "rgba(0,11,111,0.68)", lineHeight: 1.75 }}>
                Un organigrama en cascada que muestra la jerarquía del staff central y las áreas que dependen del asesor nacional.
              </p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, padding: "20px 0" }}>
                <div style={{ width: 240, borderRadius: 28, background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.12)", padding: "24px", display: "grid", gap: 16, textAlign: "center" }}>
                  <div style={{ width: 160, height: 160, margin: "0 auto", borderRadius: 32, overflow: "hidden", background: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {orgChart.leader.photo ? (
                      <img
                        src={orgChart.leader.photo}
                        alt={orgChart.leader.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          const original = img.getAttribute("data-original-src") || img.src;
                          img.setAttribute("data-original-src", original);
                          if (original.match(/\.(jpg|png|webp)$/i)) {
                            const svgPath = original.replace(/\.[^/.]+$/, ".svg");
                            if (img.src !== svgPath) {
                              img.src = svgPath;
                              return;
                            }
                          }
                          const svgFallback = original.replace(/\.(jpg|png|webp)$/i, ".svg");
                          if (img.src !== svgFallback) {
                            img.src = svgFallback;
                          }
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 40, fontWeight: 900, color: ENJ_NAVY }}>{initialsFor(orgChart.leader.name)}</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                    {orgChart.leader.role}
                  </p>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: ENJ_NAVY }}>{orgChart.leader.name}</h3>
                </div>
                <div style={{ width: "80%", maxWidth: 760, height: 2, background: "rgba(0,11,111,0.12)" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, width: "100%" }}>
                  {orgChart.branches.map((branch) => (
                    <div key={branch.manager.name} style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                      <div style={{ width: "100%", maxWidth: 260, borderRadius: 22, background: "#fff", border: "1px solid rgba(0,11,111,0.12)", padding: 18, boxShadow: "0 14px 30px rgba(0,11,111,0.06)" }}>
                        <div style={{ width: "100%", minHeight: 240, overflow: "hidden", background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 22, marginBottom: 16 }}>
                          {branch.manager.photo ? (
                            <img
                              src={branch.manager.photo}
                              alt={branch.manager.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                const original = img.getAttribute("data-original-src") || img.src;
                                img.setAttribute("data-original-src", original);
                                if (original.match(/\.(jpg|png|webp)$/i)) {
                                  const svgPath = original.replace(/\.[^/.]+$/, ".svg");
                                  if (img.src !== svgPath) {
                                    img.src = svgPath;
                                    return;
                                  }
                                }
                                const svgFallback = original.replace(/\.(jpg|png|webp)$/i, ".svg");
                                if (img.src !== svgFallback) img.src = svgFallback;
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 40, fontWeight: 900, color: ENJ_NAVY }}>{initialsFor(branch.manager.name)}</span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ENJ_MAGENTA }}>{branch.manager.role}</p>
                        <h4 style={{ margin: "10px 0 0", fontSize: 18, fontWeight: 900, color: ENJ_NAVY }}>{branch.manager.name}</h4>
                      </div>
                      <div style={{ width: "100%", maxWidth: 220, borderRadius: 20, background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", padding: 16, textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "rgba(0,11,111,0.72)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{branch.assistant.role}</p>
                        <p style={{ margin: "10px 0 0", fontSize: 15, fontWeight: 700, color: ENJ_NAVY }}>{branch.assistant.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, color: ENJ_NAVY }}>Coordinadores de área</h2>
              <p style={{ margin: "0 0 18px", fontSize: 15, color: "rgba(0,11,111,0.68)", lineHeight: 1.75 }}>
                Cada área cuenta con un coordinador y un tema principal que guía su trabajo durante el encuentro.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginTop: 12 }}>
                {coordinators.map((coordinator) => (
                  <div key={coordinator.area} style={{ background: "#F8FAFF", borderRadius: 28, border: "1px solid rgba(0,11,111,0.08)", padding: 22, minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ width: "100%", height: 220, borderRadius: 24, overflow: "hidden", background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", color: ENJ_NAVY, fontSize: 58, fontWeight: 900, marginBottom: 18 }}>
                        {initialsFor(coordinator.name)}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.12em" }}>{coordinator.title}</p>
                      <h4 style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 900, color: ENJ_NAVY }}>{coordinator.name}</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(0,11,111,0.72)" }}>{coordinator.theme}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, color: ENJ_NAVY }}>Monitores de equipos</h2>
              <p style={{ margin: "0 0 18px", fontSize: 15, color: "rgba(0,11,111,0.68)", lineHeight: 1.75 }}>
                Los monitores de cada equipo estarán presentes en el evento para apoyar la operación y coordinar con el staff.
              </p>

              <div style={{ marginTop: 12 }}>
                <MonitorsCarousel monitors={monitors} inline={true} />
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              <button
                onClick={() => navigate("/inscripcion")}
                style={{
                  background: ENJ_MAGENTA,
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Inscripción
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "transparent",
                  color: ENJ_NAVY,
                  border: `1.5px solid ${ENJ_NAVY}`,
                  borderRadius: 14,
                  padding: "14px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
