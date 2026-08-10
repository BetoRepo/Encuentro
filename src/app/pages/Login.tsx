import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "../../supabaseClient"; // Importación de Supabase

// 1. IMPORTACIÓN DE IMÁGENES (Rutas relativas corregidas)
import bgImage from "../../assets/background.png";
import logoImage from "../../assets/logonacional.svg";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

export function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- FLUJO DE INICIO DE SESIÓN DIRECTO CON SUPABASE ---
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        // Redirección exitosa directa a Home (Sin reload)
        navigate("/");
      } else {
        // --- FLUJO DE REGISTRO DIRECTO CON SUPABASE ---
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim(), // Lo lee el Trigger de SQL para la tabla profiles
            },
          },
        });

        if (error) throw error;

        // Separar el nombre en Nombre y Apellido para pre-guardar en LocalStorage
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const initialProfile = {
          nombre: firstName,
          apellido: lastName,
          correo: email.trim(),
        };
        localStorage.setItem("enj_profile", JSON.stringify(initialProfile));

        // Redirigir al formulario de perfil
        navigate("/perfil");
      }
    } catch (err: any) {
      console.error("Error de autenticación:", err);
      alert(err.message || "Error al procesar la solicitud.");
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Fondo con degradado e imagen corregida
        backgroundImage: `linear-gradient(rgba(233,240,255,0.65), rgba(248,245,255,0.65)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
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
        }}
      >
        <div style={{ marginBottom: 18, minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Logo cargado mediante variable importada */}
          <img
            src={logoImage}
            alt="ENJ 2026"
            style={{
              width: 130,
              height: "auto",
              maxHeight: 80,
              objectFit: "contain",
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>

        <p style={{ color: "rgba(0,11,111,0.65)", marginBottom: 32, lineHeight: 1.6, fontSize: 15 }}>
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
            {loading ? "Procesando..." : isLogin ? "Entrar" : "Registrarme y completar perfil"}
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