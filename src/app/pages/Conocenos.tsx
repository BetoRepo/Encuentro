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
  { team: "Equipo Bolibomba", name: "Eymer Cañizales", photo: imagePhoto("bolibomba.svg") },
  { team: "Equipo Samba", name: "Sabrina Noguera", photo: imagePhoto("samba.svg") },
  { team: "Equipo Chao", name: "Miguel Ciavato", photo: imagePhoto("chao.svg") },
  { team: "Equipo Pirulín", name: "Julio Gómez", photo: imagePhoto("pirulin.svg") },
  { team: "Equipo Cricrí", name: "Alejandro Jiménez", photo: imagePhoto("cricri.svg") },
  { team: "Equipo Savoy", name: "Hungría Molina", photo: imagePhoto("savoy.svg") },
  { team: "Equipo Reinita", name: "Laurys Rivero", photo: imagePhoto("reinita.svg") },
  { team: "Equipo Cocosete", name: "Andrés Figuera", photo: imagePhoto("cocosete.svg") },
  { team: "Equipo Tiptop", name: "Juan Molina", photo: imagePhoto("tiptop.svg") },
  { team: "Equipo Toronto", name: "Stefani Bueno", photo: imagePhoto("toronto.svg") },
];

type Coordinator = {
  area: string;
  title: string;
  name: string;
  theme: string;
};

const coordinators: Coordinator[] = [
  { area: "Aldea Global", title: "Coordinador de Aldea Global", name: "Sebastián Conde", theme: "Desafío Generación Z" },
  { area: "Ciudadanía Activa", title: "Coordinador de Ciudadanía Activa", name: "Emilys Barrios", theme: "La Red en Vivo" },
  { area: "Ruta Viva", title: "Coordinador de Ruta Viva", name: "César Quintero", theme: "Turisteando por Guárico" },
  { area: "Bienestar y Autocuidado", title: "Coordinador de Bienestar y Autocuidado", name: "Andrés Marín", theme: "Vitamina" },
  { area: "Espacios de Encuentro", title: "Coordinador de Espacios de Encuentro", name: "Irene Monsalve", theme: "La Churuata del Encuentro" },
];

const orgChart = {
  leader: {
    name: "William Bruno",
    role: "Asesor Nacional",
    photo: staffPhoto("william-bruno.jpg"),
  },
  branches: [
    {
      manager: { name: "Michelle Lozada", role: "Coordinadora de Programa de Jóvenes", photo: staffPhoto("michelle-lozada.jpg") },
      assistant: { name: "Valentina Tenías", role: "Staff Juvenil" },
    },
    {
      manager: { name: "Mariana Alvarado", role: "Coordinadora de Gestión de Riesgo", photo: staffPhoto("mariana-alvarado.jpg") },
      assistant: { name: "Giuseelly Rodríguez", role: "Staff Juvenil" },
    },
    {
      manager: { name: "Anna Colmenares", role: "Coordinadora de Administración", photo: staffPhoto("anna-colmenares.jpg") },
      assistant: { name: "Freddy Pineda", role: "Staff Juvenil" },
    },
    {
      manager: { name: "Isabel Bazán", role: "Coordinadora de Comunicaciones", photo: staffPhoto("isabel-bazan.jpg") },
      assistant: { name: "Victoria Sánchez", role: "Staff Juvenil" },
    },
    {
      manager: { name: "Sandra Peraza", role: "Coordinadora de Adultes en el Movimiento", photo: staffPhoto("sandra-peraza.jpg") },
      assistant: { name: "Apoyo Operativo en Campo", role: "Equipo de Campo" },
    },
  ],
};

export function Conocenos() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#F0F2FA", padding: "24px 16px 60px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 2048, margin: "0 auto", boxSizing: "border-box" }}>
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
            marginBottom: 20,
          }}
        >
          ← Volver al inicio
        </button>

        <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(16px, 4vw, 48px)", boxShadow: "0 24px 60px rgba(0,11,111,0.08)", overflow: "hidden", boxSizing: "border-box" }}>
          <div style={{ display: "grid", gap: 24 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ENJ_MAGENTA }}>
                Conócenos · Staff Central
              </p>
              <h1 style={{ margin: "12px 0 16px", fontSize: "clamp(26px, 4vw, 50px)", fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                El equipo que hace posible el Encuentro Nacional de Jóvenes.
              </h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "rgba(0,11,111,0.75)" }}>
                Conoce al staff central y descubre cómo se organiza el trabajo tras bambalinas para ofrecer una experiencia segura, divertida y transformadora.
              </p>
            </div>

            <div style={{ marginTop: 12 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: ENJ_NAVY }}>Organigrama del equipo</h2>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(0,11,111,0.68)", lineHeight: 1.6 }}>
                Un organigrama interactivo que muestra la estructura del staff central y las áreas que dependen del asesor nacional.
              </p>

              {/* Contenedor del Organigrama */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "10px 0", width: "100%", boxSizing: "border-box" }}>
                
                {/* Líder (Asesor Nacional) */}
                <div style={{ width: "100%", maxWidth: 260, borderRadius: 28, background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.12)", padding: "24px", display: "grid", gap: 16, textAlign: "center", boxSizing: "border-box" }}>
                  <div style={{ width: 140, height: 140, margin: "0 auto", borderRadius: 32, overflow: "hidden", background: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                            if (img.src !== svgPath) { img.src = svgPath; return; }
                          }
                          const svgFallback = original.replace(/\.(jpg|png|webp)$/i, ".svg");
                          if (img.src !== svgFallback) img.src = svgFallback;
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 36, fontWeight: 900, color: ENJ_NAVY }}>{initialsFor(orgChart.leader.name)}</span>
                    )}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                      {orgChart.leader.role}
                    </p>
                    <h3 style={{ margin: "6px 0 0", fontSize: 19, fontWeight: 900, color: ENJ_NAVY }}>{orgChart.leader.name}</h3>
                  </div>
                </div>

                {/* Línea Conectora */}
                <div style={{ width: "60%", maxWidth: 760, height: 2, background: "rgba(0,11,111,0.12)" }} />

                {/* Ramas (Coordinaciones y Equipos) */}
                <div style={{ 
                  display: "flex", 
                  flexDirection: "row", 
                  flexWrap: "wrap", 
                  justifyContent: "center", 
                  gap: 24, 
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  {orgChart.branches.map((branch) => (
                    <div 
                      key={branch.manager.name} 
                      style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: 12, 
                        alignItems: "center", 
                        width: "100%", 
                        flex: "1 1 260px", 
                        maxWidth: 260, 
                        boxSizing: "border-box" 
                      }}
                    >
                      {/* Tarjeta Manager */}
                      <div style={{ width: "100%", borderRadius: 22, background: "#fff", border: "1px solid rgba(0,11,111,0.12)", padding: 16, boxShadow: "0 14px 30px rgba(0,11,111,0.06)", boxSizing: "border-box" }}>
                        <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18, marginBottom: 14 }}>
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
                                  if (img.src !== svgPath) { img.src = svgPath; return; }
                                }
                                const svgFallback = original.replace(/\.(jpg|png|webp)$/i, ".svg");
                                if (img.src !== svgFallback) img.src = svgFallback;
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 36, fontWeight: 900, color: ENJ_NAVY }}>{initialsFor(branch.manager.name)}</span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ENJ_MAGENTA, lineHeight: 1.3 }}>{branch.manager.role}</p>
                        <h4 style={{ margin: "8px 0 0", fontSize: 17, fontWeight: 900, color: ENJ_NAVY }}>{branch.manager.name}</h4>
                      </div>

                      {/* Tarjeta Assistant */}
                      <div style={{ width: "100%", borderRadius: 16, background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.1)", padding: 12, textAlign: "center", boxSizing: "border-box" }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(0,11,111,0.72)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{branch.assistant.role}</p>
                        <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 700, color: ENJ_NAVY }}>{branch.assistant.name}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Coordinadores de Área */}
            <div style={{ marginTop: 20 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: ENJ_NAVY }}>Coordinadores de área</h2>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(0,11,111,0.68)", lineHeight: 1.6 }}>
                Cada área cuenta con un coordinator y un tema principal que guía su trabajo durante el encuentro.
              </p>
              <div style={{ 
                display: "flex", 
                flexDirection: "row", 
                flexWrap: "wrap", 
                justifyContent: "center", 
                gap: 18,
                width: "100%",
                boxSizing: "border-box"
              }}>
                {coordinators.map((coordinator) => (
                  <div 
                    key={coordinator.area} 
                    style={{ 
                      background: "#F8FAFF", 
                      borderRadius: 24, 
                      border: "1px solid rgba(0,11,111,0.08)", 
                      padding: 20, 
                      width: "100%", 
                      flex: "1 1 260px",
                      maxWidth: 260, 
                      minHeight: 280, 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between", 
                      boxSizing: "border-box" 
                    }}
                  >
                    <div>
                      <div style={{ width: "100%", aspectRatio: "1.2 / 1", borderRadius: 18, background: "#EBF1FF", display: "flex", alignItems: "center", justifyContent: "center", color: ENJ_NAVY, fontSize: 46, fontWeight: 900, marginBottom: 14 }}>
                        {initialsFor(coordinator.name)}
                      </div>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.3 }}>{coordinator.title}</p>
                      <h4 style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 900, color: ENJ_NAVY }}>{coordinator.name}</h4>
                    </div>
                    <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.5, color: "rgba(0,11,111,0.72)", fontStyle: "italic" }}>{coordinator.theme}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitores de Equipos */}
            <div style={{ marginTop: 20 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: ENJ_NAVY }}>Monitores de equipos</h2>
              <p style={{ margin: "0 0 14px", fontSize: 14, color: "rgba(0,11,111,0.68)", lineHeight: 1.6 }}>
                Los monitores de cada equipo estarán presentes en el evento para apoyar la operación y coordinar con el staff.
              </p>
              <div style={{ marginTop: 12, width: "100%", overflow: "hidden" }}>
                <MonitorsCarousel monitors={monitors} inline={true} />
              </div>
            </div>

            {/* Acciones de Navegación */}
            <div style={{ display: "flex", gap: 12, marginTop: 10, width: "100%", boxSizing: "border-box" }}>
              <button
                onClick={() => navigate("/inscripcion")}
                style={{
                  flex: 1,
                  background: ENJ_MAGENTA,
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px",
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
                  flex: 1,
                  background: "transparent",
                  color: ENJ_NAVY,
                  border: `1.5px solid ${ENJ_NAVY}`,
                  borderRadius: 14,
                  padding: "14px",
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