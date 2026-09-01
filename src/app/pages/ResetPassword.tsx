import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: searchParams.get("token"), newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo recuperar la contraseña.");
      alert(result.message);
      navigate("/login");
    } catch (error: any) {
      alert(error.message || "No se pudo recuperar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#F0F2FA" }}>
      <form onSubmit={handleSubmit} style={{ width: "min(100%, 400px)", background: "#fff", padding: 32, borderRadius: 18, boxShadow: "0 12px 40px rgba(0,11,111,0.12)" }}>
        <h1 style={{ color: "#000B6F", marginTop: 0 }}>Recuperar contraseña</h1>
        <p style={{ color: "rgba(0,11,111,0.65)", lineHeight: 1.5 }}>Crea una nueva contraseña para acceder a tu cuenta.</p>
        <div style={{ position: "relative", margin: "24px 0" }}>
          <Lock size={18} style={{ position: "absolute", left: 12, top: 13, color: "rgba(0,11,111,0.35)" }} />
          <input type="password" minLength={8} required placeholder="Nueva contraseña (mínimo 8 caracteres)" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px 12px 12px 40px", border: "1.5px solid rgba(0,11,111,0.14)", borderRadius: 10 }} />
        </div>
        <button disabled={loading} style={{ width: "100%", padding: 14, border: 0, borderRadius: 10, background: "#000B6F", color: "#fff", fontWeight: 700 }}>{loading ? "Guardando..." : "Guardar nueva contraseña"}</button>
      </form>
    </main>
  );
}