import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon } from "lucide-react";

// 1. IMPORTACIÓN DE IMÁGENES (Rutas relativas corregidas)
import bgImage from "../../assets/background.png";
import logoImage from "../../assets/logonacional.svg";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

export function Login() {
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const result = await readResponse(response);
        localStorage.setItem("token", result.token);
        localStorage.setItem("enj_user", JSON.stringify(result.user));
        navigate("/");
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
        });
        const result = await readResponse(response);
        localStorage.setItem("token", result.token);
        localStorage.setItem("enj_user", JSON.stringify(result.user));

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

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmation) return alert("Las contraseñas no coinciden.");
    setChangePasswordLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });
      const result = await readResponse(response);
      alert(result.message);
      setNewPassword("");
      setConfirmation("");
      setChangePasswordOpen(false);
    } catch (error: any) {
      alert(error.message || "No se pudo cambiar la contraseña.");
    } finally {
      setChangePasswordLoading(false);
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
          onClick={() => {
            setIsLogin(!isLogin);
          }}
          style={{ background: "none", border: "none", color: ENJ_MAGENTA, marginTop: "24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          {isLogin ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
        <button
          type="button"
          onClick={() => setChangePasswordOpen(true)}
          style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", color: ENJ_NAVY, fontSize: "13px", cursor: "pointer", fontWeight: 600 }}
        >
          Cambiar Contraseña
        </button>
      </div>

      {changePasswordOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="change-password-title" style={{ position: "fixed", inset: 0, zIndex: 10, display: "grid", placeItems: "center", padding: 24, background: "rgba(0,11,111,0.35)" }}>
          <form onSubmit={handleChangePassword} style={{ width: "min(100%, 380px)", background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <h2 id="change-password-title" style={{ margin: "0 0 8px", color: ENJ_NAVY }}>Cambiar Contraseña</h2>
            <p style={{ margin: "0 0 20px", color: "rgba(0,11,111,0.62)", fontSize: 14 }}>Escribe y confirma tu nueva contraseña.</p>
            {[{ label: "Nueva contraseña", value: newPassword, setValue: setNewPassword }, { label: "Confirmar nueva contraseña", value: confirmation, setValue: setConfirmation }].map((field) => (
              <div key={field.label} style={{ position: "relative", marginTop: 14 }}>
                <Lock size={17} style={{ position: "absolute", left: 12, top: 13, color: "rgba(0,11,111,0.35)" }} />
                <input required minLength={8} type="password" placeholder={`${field.label} (mínimo 8 caracteres)`} value={field.value} onChange={(event) => field.setValue(event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px 12px 12px 38px", border: "1.5px solid rgba(0,11,111,0.14)", borderRadius: 10 }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button type="button" onClick={() => setChangePasswordOpen(false)} style={{ flex: 1, padding: 12, border: "1px solid rgba(0,11,111,0.18)", borderRadius: 10, background: "#fff", color: ENJ_NAVY, fontWeight: 600 }}>Cancelar</button>
              <button type="submit" disabled={changePasswordLoading} style={{ flex: 1, padding: 12, border: 0, borderRadius: 10, background: ENJ_NAVY, color: "#fff", fontWeight: 700 }}>{changePasswordLoading ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;