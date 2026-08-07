import { useState } from "react";
import { LogIn, Mail, Lock, User as UserIcon } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE as string) || '';
      const url = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      // SOLUCIÓN: Leemos el texto plano una única vez de forma segura
      const text = await res.text();
      let data: any = null;

      try {
        // Si el texto es una estructura JSON válida, la parseamos
        data = JSON.parse(text);
      } catch (err) {
        // Si no es JSON (es un error de red o HTML plano), tiramos el texto crudo
        throw new Error(text || `HTTP ${res.status}`);
      }

      if (res.ok && data && data.ok) {
        localStorage.setItem('token', data.token);
        window.location.reload();
      } else {
        // Aquí atrapamos correctamente los mensajes de Supabase ("Usuario ya existe", etc.)
        alert(data?.error || `Error: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 40px",
    borderRadius: "12px",
    border: "1.5px solid rgba(0,11,111,0.1)",
    background: "#F8FAFF",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const
  };

  const collageImages = [
    "/assets/staff/william-bruno.jpg",
    "/assets/staff/sandra-peraza.jpg",
    "/assets/staff/michelle-lozada.jpg",
    "/assets/staff/mariana-alvarado.jpg",
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #E9F0FF 0%, #F8F5FF 100%)",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute",
          width: 240,
          height: 260,
          top: "10%",
          left: "5%",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
          transform: "rotate(-14deg)",
        }}>
          <img src={collageImages[0]} alt="Collage ENJ 2026" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{
          position: "absolute",
          width: 200,
          height: 220,
          top: "15%",
          right: "7%",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
          transform: "rotate(10deg)",
        }}>
          <img src={collageImages[1]} alt="Collage ENJ 2026" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{
          position: "absolute",
          width: 220,
          height: 240,
          bottom: "8%",
          left: "12%",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
          transform: "rotate(8deg)",
        }}>
          <img src={collageImages[2]} alt="Collage ENJ 2026" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{
          position: "absolute",
          width: 180,
          height: 200,
          bottom: "6%",
          right: "10%",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
          transform: "rotate(-6deg)",
        }}>
          <img src={collageImages[3]} alt="Collage ENJ 2026" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      <div style={{
        position: "relative",
        background: "rgba(255,255,255,0.96)",
        borderRadius: 24,
        padding: "48px 32px",
        maxWidth: 400,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0,11,111,0.12)",
        backdropFilter: "blur(16px)",
        zIndex: 1,
      }}>
        <div style={{ marginBottom: 18 }}>
          <img
            src="/assets/logo-scout.png"
            alt="ENJ 2026"
            style={{
              width: 120,
              height: "auto",
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>
        <p style={{ color: "rgba(0,11,111,0.65)", marginBottom: 32, lineHeight: 1.6, fontSize: 16 }}>
          {isLogin ? "Inicia sesión para continuar" : "Crea tu cuenta de participante"}
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!isLogin && (
            <div style={{ position: "relative" }}>
              <UserIcon size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.3)" }} />
              <input style={inputStyle} type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div style={{ position: "relative" }}>
            <Mail size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.3)" }} />
            <input style={inputStyle} type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.3)" }} />
            <input style={inputStyle} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button
            disabled={loading}
            style={{
              background: ENJ_NAVY,
              color: "#fff",
              border: "none",
              padding: "14px",
              borderRadius: "12px",
              fontWeight: 700,
              cursor: "pointer",
              marginTop: "8px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Procesando..." : isLogin ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{ background: "none", border: "none", color: ENJ_MAGENTA, marginTop: "24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          {isLogin ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}
export default Login;