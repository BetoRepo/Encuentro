import { Outlet, NavLink, useLocation } from "react-router-dom"; // <-- Corregido aquí
import { useState, useEffect } from "react";
import { Menu, X, Bell } from "lucide-react";
import { Login } from "../pages/Login";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

function ScoutsLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function Root() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.ok) setUser(data.user);
        else localStorage.removeItem('token');
      } catch (e) {
        console.error("Auth check failed", e);
      }
      setLoading(false);
    };
    checkAuth();
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

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  }

  if (!user) {
    return <Login />;
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
              to="/conocenos"
              style={({ isActive }) => ({
                padding: "7px 16px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
                transition: "all 0.15s",
              })}
            >
              Conócenos
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
              to="/conocenos"
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
              })}
            >
              Conócenos
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
          </div>
        )}
      </nav>

      <Outlet />

      {/* FOOTER */}
      <footer style={{ background: ENJ_NAVY, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "center", justifyContent: "center", marginBottom: 14 }}>
          <ScoutsLogo />
        </div>
        <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 700, color: ENJ_YELLOW, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Encuentro Nacional de Jóvenes · ENJ 2026
        </p>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          11, 12 y 13 de Septiembre · Guárico, Venezuela
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