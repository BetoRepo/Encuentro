import { Outlet, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Bell, LogOut } from "lucide-react";
import logoImage from "../../assets/logonacional.svg";
import scoutLogoImage from "../../assets/logo-scout.png";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

function ScoutsLogo() {
  return <img src={scoutLogoImage} alt="Scouts de Venezuela" width={36} height={36} style={{ objectFit: "contain" }} />;
}

export function Root() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("enj_user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setLoading(false);
  }, []);

  const subscribeToNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const resKey = await fetch('/api/notifications/key');
      const { publicKey } = await resKey.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert("¡Notificaciones activadas!");
    } catch (err) {
      console.error("Error al suscribir:", err);
    }
  };

  // Nueva función para cerrar sesión
  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("enj_user");
      setUser(null);
      setMobileOpen(false); // Cierra el menú móvil si estaba abierto
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#F0F2FA" }}>
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: ENJ_NAVY,
          boxShadow: "0 2px 16px rgba(0,11,111,0.25)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* brand */}
          <NavLink
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <ScoutsLogo />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: ENJ_YELLOW, letterSpacing: "0.04em" }}>
                ENJ 2026
              </p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em" }}>
                Scouts de Venezuela
              </p>
            </div>
          </NavLink>

          {/* Botón Notificaciones */}
          <button 
            onClick={subscribeToNotifications}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '50%', 
              padding: '8px', 
              cursor: 'pointer',
              marginLeft: 'auto',
              marginRight: '12px',
              color: ENJ_YELLOW 
            }}
            title="Activar Notificaciones"
          >
            <Bell size={18} />
          </button>

          {/* desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="hidden-mobile">
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                padding: "7px 16px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? ENJ_NAVY : "rgba(255,255,255,0.8)",
                background: isActive ? ENJ_YELLOW : "transparent",
                transition: "all 0.15s",
              })}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/consultas"
              style={({ isActive }) => ({
                padding: "7px 16px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                background: isActive ? "rgba(247,191,22,0.18)" : "transparent",
                transition: "all 0.15s",
              })}
            >
              Consultas
            </NavLink>
            <NavLink
              to="/inscripcion"
              style={({ isActive }) => ({
                padding: "7px 16px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                background: isActive ? ENJ_MAGENTA : "transparent",
                transition: "all 0.15s",
              })}
            >
              Inscripción
            </NavLink>
            <NavLink
              to="/perfil"
              style={({ isActive }) => ({
                padding: "7px 16px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                background: isActive ? "rgba(215,0,126,0.2)" : "transparent",
                transition: "all 0.15s",
              })}
            >
              Perfil
            </NavLink>
            {user?.role === "admin" && <NavLink to="/dashboard" style={({ isActive }) => ({ padding: "7px 16px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600, color: "#fff", background: isActive ? ENJ_YELLOW : "transparent" })}>Dashboard</NavLink>}
            
            {/* Botón de Cerrar Sesión Desktop (solo si hay usuario) */}
            {user && (
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 16px",
                  marginLeft: "8px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={16} />
                Salir
              </button>
            )}
          </div>

          {/* mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              padding: 4,
              display: "none",
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* mobile menu */}
        {mobileOpen && (
          <div
            style={{
              background: "#00095A",
              padding: "12px 24px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: isActive ? ENJ_NAVY : "rgba(255,255,255,0.9)",
                background: isActive ? ENJ_YELLOW : "transparent",
              })}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/consultas"
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: isActive ? "rgba(247,191,22,0.18)" : "transparent",
              })}
            >
              Consultas
            </NavLink>
            <NavLink
              to="/inscripcion"
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: isActive ? ENJ_MAGENTA : "rgba(215,0,126,0.3)",
              })}
            >
              Inscripción
            </NavLink>
            <NavLink
              to="/perfil"
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: isActive ? "rgba(215,0,126,0.2)" : "rgba(215,0,126,0.3)",
              })}
            >
              Perfil
            </NavLink>
            {user?.role === "admin" && <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontSize: 15, fontWeight: 600, color: "#fff" }}>Dashboard</NavLink>}
            
            {/* Botón de Cerrar Sesión Mobile (solo si hay usuario) */}
            {user && (
              <>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      <Outlet />

      {/* FOOTER */}
      <footer style={{ background: ENJ_NAVY, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "center", justifyContent: "center", marginBottom: 14 }}>
          <ScoutsLogo />
        </div>
        <img src={logoImage} alt="Encuentro Nacional de Jóvenes · ENJ 2026" style={{ width: 150, height: "auto", maxHeight: 72, objectFit: "contain", margin: "0 auto 12px", display: "block" }} />
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          30 Oct - 1 Nov · Aguirre, Venezuela
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Scouts de Venezuela · Siempre Listos
        </p>
      </footer>

      <style>{`
        @media (max-width: 600px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 601px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}