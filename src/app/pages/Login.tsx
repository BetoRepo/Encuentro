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

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "#F0F2FA",
      padding: "24px"
    }}>
      <div style={{ 
        background: "#fff", 
        borderRadius: 24, 
        padding: "48px 32px", 
        maxWidth: 400, 
        width: "100%", 
        textAlign: "center", 
        boxShadow: "0 20px 50px rgba(0,11,111,0.1)" 
      }}>
        <h1 style={{ color: ENJ_NAVY, fontSize: 28, fontWeight: 900, marginBottom: 12 }}>ENJ 2026</h1>
        <p style={{ color: "rgba(0,11,111,0.6)", marginBottom: 32, lineHeight: 1.6 }}>
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
              background: ENJ_NAVY, color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: "8px",
              opacity: loading ? 0.7 : 1
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