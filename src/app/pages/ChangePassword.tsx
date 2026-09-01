import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

export function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmation) return alert("Las contraseñas no coinciden.");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo cambiar la contraseña.");
      alert(result.message);
      navigate("/");
    } catch (error: any) {
      alert(error.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "70vh", background: "#F0F2FA", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <button type="button" onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: 0, color: "rgba(0,11,111,0.65)", cursor: "pointer", fontWeight: 600 }}><ArrowLeft size={16} /> Volver</button>
        <form onSubmit={handleSubmit} style={{ marginTop: 24, background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 8px 30px rgba(0,11,111,0.1)" }}>
          <h1 style={{ marginTop: 0, color: "#000B6F" }}>Cambiar contraseña</h1>
          <p style={{ color: "rgba(0,11,111,0.62)", lineHeight: 1.5 }}>Define una nueva contraseña para tu cuenta.</p>
          {[{ label: "Nueva contraseña", value: newPassword, setValue: setNewPassword }, { label: "Confirmar contraseña", value: confirmation, setValue: setConfirmation }].map((field) => (
            <div key={field.label} style={{ position: "relative", marginTop: 18 }}>
              <Lock size={18} style={{ position: "absolute", left: 12, top: 13, color: "rgba(0,11,111,0.35)" }} />
              <input type="password" required minLength={8} placeholder={`${field.label} (mínimo 8 caracteres)`} value={field.value} onChange={(event) => field.setValue(event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px 12px 12px 40px", border: "1.5px solid rgba(0,11,111,0.14)", borderRadius: 10 }} />
            </div>
          ))}
          <button disabled={loading} style={{ width: "100%", marginTop: 24, padding: 14, border: 0, borderRadius: 10, background: "#000B6F", color: "#fff", fontWeight: 700 }}>{loading ? "Guardando..." : "Guardar contraseña"}</button>
        </form>
      </div>
    </main>
  );
}
