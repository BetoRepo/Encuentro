import { useNavigate } from "react-router";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

type Monitor = {
  team: string;
  name: string;
  photo?: string;
};

const monitors: Monitor[] = [
  {
    team: "Equipo Bolibomba",
    name: "Eymer Cañizales",
    // photo: "/assets/monitors/bolibomba.jpg",
  },
  {
    team: "Equipo Samba",
    name: "Sabrina Noguera",
    // photo: "/assets/monitors/samba.jpg",
  },
  {
    team: "Equipo Chao",
    name: "Miguel Ciavato",
    // photo: "/assets/monitors/chao.jpg",
  },
  {
    team: "Equipo Pirulín",
    name: "Julio Gómez",
    // photo: "/assets/monitors/pirulin.jpg",
  },
  {
    team: "Equipo Cricrí",
    name: "Alejandro Jiménez",
    // photo: "/assets/monitors/cricri.jpg",
  },
  {
    team: "Equipo Savoy",
    name: "Hungría Molina",
    // photo: "/assets/monitors/savoy.jpg",
  },
  {
    team: "Equipo Reinita",
    name: "Laurys Rivero",
    // photo: "/assets/monitors/reinita.jpg",
  },
  {
    team: "Equipo Cocosete",
    name: "Andrés Figuera",
    // photo: "/assets/monitors/cocosete.jpg",
  },
  {
    team: "Equipo Tiptop",
    name: "Juan Molina",
    // photo: "/assets/monitors/tiptop.jpg",
  },
  {
    team: "Equipo Toronto",
    name: "Stefani Bueno",
    // photo: "/assets/monitors/toronto.jpg",
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
    photo: "/assets/staff/william-bruno.jpg",
  },
  branches: [
    {
      manager: {
        name: "Michelle Lozada",
        role: "Coordinadora de Programa de Jóvenes",
        photo: "/assets/staff/michelle-lozada.jpg",
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
        photo: "/assets/staff/mariana-alvarado.jpg",
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
        photo: "/assets/staff/anna-colmenares.jpg",
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
        photo: "/assets/staff/isabel-bazan.jpg",
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
        photo: "/assets/staff/sandra-peraza.jpg",
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
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 220, borderRadius: 24, background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.12)", padding: "24px 24px 20px", display: "grid", gap: 10, textAlign: "center" }}>
                    <div style={{ width: 72, height: 72, margin: "0 auto", borderRadius: 18, overflow: "hidden", background: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", color: ENJ_NAVY, fontSize: 24, fontWeight: 800 }}>
                      Wb
                    </div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                      Asesor Nacional
                    </p>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: ENJ_NAVY }}>William Bruno</h3>
                  </div>
                  <div style={{ width: "80%", maxWidth: 760, height: 2, background: "rgba(0,11,111,0.12)" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20, width: "100%" }}>
                  {orgChart.branches.map((branch) => (
                    <div key={branch.manager.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 2, height: 24, background: "rgba(0,11,111,0.12)" }} />
                      <div style={{ width: "100%", maxWidth: 240, borderRadius: 22, background: "#fff", border: "1px solid rgba(0,11,111,0.12)", padding: 18, boxShadow: "0 14px 30px rgba(0,11,111,0.06)" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, overflow: "hidden", background: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", color: ENJ_NAVY, fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
                          {branch.manager.photo ? (
                            <img src={branch.manager.photo} alt={branch.manager.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            branch.manager.name.split(" ").map((part) => part[0]).slice(0, 2).join("")
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ENJ_MAGENTA }}>{branch.manager.role}</p>
                        <h4 style={{ margin: "10px 0 0", fontSize: 16, fontWeight: 800, color: ENJ_NAVY }}>{branch.manager.name}</h4>
                      </div>
                      <div style={{ width: 2, height: 20, background: "rgba(0,11,111,0.12)" }} />
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
                {coordinators.map((coordinator) => (
                  <div key={coordinator.area} style={{ background: "#F8FAFF", borderRadius: 22, border: "1px solid rgba(0,11,111,0.08)", padding: 20, minHeight: 170, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.12em" }}>{coordinator.title}</p>
                      <h4 style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 800, color: ENJ_NAVY }}>{coordinator.name}</h4>
                    </div>
                    <p style={{ margin: "0", fontSize: 14, lineHeight: 1.6, color: "rgba(0,11,111,0.72)" }}>{coordinator.theme}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, color: ENJ_NAVY }}>Monitores de equipos</h2>
              <p style={{ margin: "0 0 18px", fontSize: 15, color: "rgba(0,11,111,0.68)", lineHeight: 1.75 }}>
                Los monitores de cada equipo estarán presentes en el evento para apoyar la operación y coordinar con el staff.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
                {monitors.map((monitor) => (
                  <div key={monitor.team} style={{ background: "#F8FAFF", borderRadius: 22, border: "1px solid rgba(0,11,111,0.08)", padding: 20, minHeight: 170, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", background: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", color: ENJ_NAVY, fontWeight: 800, fontSize: 18 }}>
                      {monitor.photo ? (
                        <img src={monitor.photo} alt={monitor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        monitor.team
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.12em" }}>{monitor.team}</p>
                      <h4 style={{ margin: "8px 0 0", fontSize: 16, fontWeight: 800, color: ENJ_NAVY }}>{monitor.name}</h4>
                    </div>
                  </div>
                ))}
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
