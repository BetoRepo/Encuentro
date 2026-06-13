import { useNavigate } from "react-router-dom";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#50039D"; // Usando el mismo tono magenta del Home para consistencia
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
    <div style={{ background: "#F5F7FB", padding: "24px 16px 60px", boxSizing: "border-box", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        
        {/* Botón de regreso estilizado */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            border: "1px solid rgba(0,11,111,0.08)",
            borderRadius: "12px",
            cursor: "pointer",
            color: ENJ_NAVY,
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 16px",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}
        >
          ← Volver al inicio
        </button>

        {/* CONTENEDOR BLANCO PRINCIPAL */}
        <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(20px, 4vw, 40px)", boxShadow: "0 12px 40px rgba(0,11,111,0.04)", boxSizing: "border-box" }}>
          
          {/* Encabezado */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: ENJ_MAGENTA }}>
              Conócenos · Staff Central
            </p>
            <h1 style={{ margin: "12px 0 16px", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: ENJ_NAVY, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              El equipo detrás del Encuentro Nacional de Jóvenes.
            </h1>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#556080" }}>
              Descubre cómo se organiza el staff central y las diferentes coordinaciones para ofrecer una experiencia segura, estructurada y transformadora en Guárico 2026.
            </p>
          </div>

          {/* 1. SECCIÓN: ORGANIGRAMA CENTRAL */}
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: ENJ_NAVY }}>Organigrama del Equipo</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#666" }}>Estructura del staff central y dependencias de la Asesoría Nacional.</p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", boxSizing: "border-box" }}>
              
              {/* Líder (Asesor Nacional) */}
              <div style={{ width: "100%", maxWidth: 280, borderRadius: 24, background: "#F8FAFF", border: "1px solid rgba(0,11,111,0.08)", padding: 24, textAlign: "center", boxSizing: "border-box" }}>
                <div style={{ width: 120, height: 120, margin: "0 auto 16px", borderRadius: "50%", overflow: "hidden", background: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(247,191,22,0.2)" }}>
                  {orgChart.leader.photo ? (
                    <img
                      src={orgChart.leader.photo}
                      alt={orgChart.leader.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.src = ""; }}
                    />
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 800, color: ENJ_NAVY }}>{initialsFor(orgChart.leader.name)}</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.1em" }}>{orgChart.leader.role}</p>
                <h3 style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 800, color: ENJ_NAVY }}>{orgChart.leader.name}</h3>
              </div>

              {/* Conector */}
              <div style={{ width: 2, height: 24, background: "rgba(0,11,111,0.1)" }} />

              {/* Grid Responsivo de las Ramas */}
              <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, width: "100%", boxSizing: "border-box" }}>
                {orgChart.branches.map((branch) => (
                  <div key={branch.manager.name} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", flex: "1 1 280px", maxWidth: 320, boxSizing: "border-box" }}>
                    
                    {/* Tarjeta Coordinador */}
                    <div style={{ background: "white", borderRadius: 20, border: "1px solid rgba(0,11,111,0.08)", padding: 20, boxShadow: "0 6px 16px rgba(0,11,111,0.02)", display: "flex", gap: 16, alignItems: "center", boxSizing: "border-box", minHeight: 110 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 14, overflow: "hidden", background: "#F5F7FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {branch.manager.photo ? (
                          <img src={branch.manager.photo} alt={branch.manager.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 20, fontWeight: 800, color: ENJ_NAVY }}>{initialsFor(branch.manager.name)}</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: ENJ_MAGENTA, lineHeight: 1.3 }}>{branch.manager.role}</p>
                        <h4 style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 800, color: ENJ_NAVY }}>{branch.manager.name}</h4>
                      </div>
                    </div>

                    {/* Tarjeta Staff Juvenil Vinculada */}
                    <div style={{ background: "#F8FAFF", borderRadius: 14, border: "1px solid rgba(0,11,111,0.04)", padding: "10px 16px", boxSizing: "border-box", display: "flex", justifyContent: "between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,11,111,0.5)", textTransform: "uppercase" }}>{branch.assistant.role}:</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY, marginLeft: "auto" }}>{branch.assistant.name}</span>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* 2. SECCIÓN: COORDINADORES DE ÁREA */}
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: ENJ_NAVY }}>Coordinadores de Área</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#666" }}>Líderes temáticos encargados de desplegar los módulos de actividad en el campo.</p>
            
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, width: "100%", boxSizing: "border-box" }}>
              {coordinators.map((coord) => (
                <div key={coord.area} style={{ background: "#F8FAFF", borderRadius: 20, border: "1px solid rgba(0,11,111,0.06)", padding: 20, width: "100%", flex: "1 1 280px", maxWidth: 320, display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box", minHeight: 180 }}>
                  <div>
                    <span style={{ background: "rgba(80,3,157,0.06)", color: ENJ_MAGENTA, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "inline-block", marginBottom: 12 }}>
                      {coord.area}
                    </span>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: ENJ_NAVY }}>{coord.name}</h4>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>{coord.title}</p>
                  </div>
                  <div style={{ marginTop: 14, borderTop: "1px dashed rgba(0,11,111,0.08)", paddingTop: 10 }}>
                    <p style={{ margin: 0, fontSize: 12, color: ENJ_NAVY, fontWeight: 600 }}>
                      Módulo: <span style={{ color: ENJ_MAGENTA, fontWeight: 700 }}>{coord.theme}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SECCIÓN REESTRUCTURADA: MONITORES DE EQUIPOS CON IMÁGENES */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: ENJ_NAVY }}>Monitores de Equipos</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#666" }}>Identifica a los encargados de guiar y acompañar a cada delegación durante el evento.</p>
            
            {/* Grid dinámico que se adapta nativamente a Android y PC */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
              gap: 16, 
              width: "100%", 
              boxSizing: "border-box" 
            }}>
              {monitors.map((monitor) => (
                <div 
                  key={monitor.team} 
                  style={{ 
                    background: "white", 
                    borderRadius: 16, 
                    border: "1px solid #EAEFF8", 
                    padding: 14, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    boxSizing: "border-box",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
                  }}
                >
                  {/* Contenedor de la Imagen del Equipo/Monitor */}
                  <div style={{ width: 50, height: 50, borderRadius: "50%", overflow: "hidden", background: "#F5F7FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${ENJ_YELLOW}` }}>
                    {monitor.photo ? (
                      <img 
                        src={monitor.photo} 
                        alt={monitor.name} 
                        style={{ width: "85%", height: "85%", objectFit: "contain" }} 
                        onError={(e) => {
                          // Si falla el SVG o la ruta, muestra iniciales estilizadas
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span style="font-size:14px; font-weight:800; color:${ENJ_NAVY}">${initialsFor(monitor.name)}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 14, fontSpread: 800, color: ENJ_NAVY }}>{initialsFor(monitor.name)}</span>
                    )}
                  </div>

                  {/* Textos del Monitor */}
                  <div style={{ overflow: "hidden" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {monitor.team}
                    </p>
                    <h4 style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: ENJ_NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {monitor.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción inferiores */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40, width: "100%", boxSizing: "border-box" }}>
            <button
              onClick={() => navigate("/inscripcion")}
              style={{ flex: "1 1 180px", background: ENJ_MAGENTA, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(80,3,157,0.2)" }}
            >
              Ir a Inscripción
            </button>
            <button
              onClick={() => navigate("/")}
              style={{ flex: "1 1 180px", background: "transparent", color: ENJ_NAVY, border: `1.5px solid ${ENJ_NAVY}`, borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Volver al Inicio
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}