import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon } from "lucide-react";

// Importación de assets del ENJ 2026
import bgImage from "../../assets/background.png";
import logoImage from "../../assets/logonacional.svg";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

export function Login() {
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Estados del Formulario Principal
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados del Modal de Cambio de Contraseña
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const readResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { error: (await response.text()).trim() };
    if (!response.ok) {
      throw new Error(body.error || "El servidor no pudo procesar la solicitud.");
    }
    return body;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        const result = await readResponse(response);
        localStorage.setItem("token", result.token);
        localStorage.setItem("enj_user", JSON.stringify(result.user));
        navigate("/");
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() }),
        });
        const result = await readResponse(response);
        localStorage.setItem("token", result.token);
        localStorage.setItem("enj_user", JSON.stringify(result.user));

        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const initialProfile = {
          nombre: firstName,
          apellido: lastName,
          correo: email.trim().toLowerCase(),
        };
        localStorage.setItem("enj_profile", JSON.stringify(initialProfile));

        navigate("/perfil");
      }
    } catch (err: any) {
      console.error("Error de autenticación:", err);
      alert(err.message || "Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetEmail.trim()) return alert("Por favor ingresa tu correo registrado.");
    if (newPassword !== confirmation) return alert("Las contraseñas no coinciden.");
    if (newPassword.length < 8) return alert("La contraseña debe tener al menos 8 caracteres.");

    setChangePasswordLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: resetEmail.trim().toLowerCase(), 
          newPassword 
        }),
        signal: controller.signal,
      });

      const result = await readResponse(response);
      alert(result.message || "¡Contraseña actualizada exitosamente!");
      setResetEmail("");
      setNewPassword("");
      setConfirmation("");
      setChangePasswordOpen(false);
    } catch (error: any) {
      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      alert(
        isAbortError
          ? "El servidor tardó demasiado en responder. Revisa la conexión con la base de datos."
          : error?.message || "No se pudo cambiar la contraseña."
      );
    } finally {
      window.clearTimeout(timeoutId);
      setChangePasswordLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 12px 12px 40px",
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
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "24px",
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: ENJ_NAVY, // Fondo base azul ASV
      }}
    >
      {/* Capa de fondo con la imagen ajustada al ancho completo (cover) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover", // Se cambió de "contain" a "cover" para llenar la pantalla
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />

      {/* Overlay con gradiente semitransparente ASV */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(0, 11, 111, 0.6) 0%, rgba(215, 0, 126, 0.45) 100%)",
          zIndex: 1,
        }}
      />

      {/* Tarjeta Glassmorphism de Inicio de Sesión */}
      <div
        style={{
          position: "relative",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: 24,
          padding: "40px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          zIndex: 2,
        }}
      >
        <div style={{ marginBottom: 18, minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src={logoImage}
            alt="ENJ 2026"
            style={{
              width: 140,
              height: "auto",
              maxHeight: 85,
              objectFit: "contain",
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>

        <p style={{ color: "rgba(0,11,111,0.75)", marginBottom: 28, lineHeight: 1.5, fontSize: 15, fontWeight: 500 }}>
          {isLogin ? "Inicia sesión para continuar" : "Crea tu cuenta de participante"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!isLogin && (
            <div style={{ position: "relative" }}>
              <UserIcon size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)" }} />
              <input style={inputStyle} type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <Mail size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)" }} />
            <input style={inputStyle} type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)" }} />
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
              fontSize: "15px",
              cursor: "pointer",
              marginTop: "8px",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 4px 12px rgba(0, 11, 111, 0.2)",
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

        <button
          type="button"
          onClick={() => {
            setResetEmail(email); // Copia automáticamente el correo si ya se ingresó
            setChangePasswordOpen(true);
          }}
          style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: ENJ_NAVY, fontSize: "13px", cursor: "pointer", fontWeight: 600 }}
        >
          ¿Olvidaste o quieres cambiar tu contraseña?
        </button>
      </div>

      {/* Modal para Cambio de Contraseña */}
      {changePasswordOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="change-password-title" 
          style={{ position: "fixed", inset: 0, zIndex: 10, display: "grid", placeItems: "center", padding: 24, background: "rgba(0,11,111,0.45)", backdropFilter: "blur(4px)" }}
        >
          <form 
            onSubmit={handleChangePassword} 
            style={{ width: "min(100%, 380px)", background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}
          >
            <h2 id="change-password-title" style={{ margin: "0 0 8px", color: ENJ_NAVY, fontSize: "20px", fontWeight: 700 }}>
              Cambiar Contraseña
            </h2>
            <p style={{ margin: "0 0 20px", color: "rgba(0,11,111,0.62)", fontSize: 14 }}>
              Ingresa tu correo registrado y tu nueva clave para actualizar la base de datos.
            </p>

            {/* Campo: Correo del usuario */}
            <div style={{ position: "relative", marginTop: 14 }}>
              <Mail size={17} style={{ position: "absolute", left: 12, top: 13, color: "rgba(0,11,111,0.35)" }} />
              <input 
                required 
                type="email" 
                placeholder="Correo registrado" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 12px 12px 38px", border: "1.5px solid rgba(0,11,111,0.14)", borderRadius: 10, fontSize: "14px" }} 
              />
            </div>

            {/* Campo: Nueva Contraseña */}
            <div style={{ position: "relative", marginTop: 14 }}>
              <Lock size={17} style={{ position: "absolute", left: 12, top: 13, color: "rgba(0,11,111,0.35)" }} />
              <input 
                required 
                minLength={8} 
                type="password" 
                placeholder="Nueva contraseña (mínimo 8 caracteres)" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 12px 12px 38px", border: "1.5px solid rgba(0,11,111,0.14)", borderRadius: 10, fontSize: "14px" }} 
              />
            </div>

            {/* Campo: Confirmar Contraseña */}
            <div style={{ position: "relative", marginTop: 14 }}>
              <Lock size={17} style={{ position: "absolute", left: 12, top: 13, color: "rgba(0,11,111,0.35)" }} />
              <input 
                required 
                minLength={8} 
                type="password" 
                placeholder="Confirmar nueva contraseña" 
                value={confirmation} 
                onChange={(e) => setConfirmation(e.target.value)} 
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 12px 12px 38px", border: "1.5px solid rgba(0,11,111,0.14)", borderRadius: 10, fontSize: "14px" }} 
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button 
                type="button" 
                onClick={() => setChangePasswordOpen(false)} 
                style={{ flex: 1, padding: 12, border: "1px solid rgba(0,11,111,0.18)", borderRadius: 10, background: "#fff", color: ENJ_NAVY, fontWeight: 600, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={changePasswordLoading} 
                style={{ flex: 1, padding: 12, border: 0, borderRadius: 10, background: ENJ_NAVY, color: "#fff", fontWeight: 700, cursor: "pointer", opacity: changePasswordLoading ? 0.7 : 1 }}
              >
                {changePasswordLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;