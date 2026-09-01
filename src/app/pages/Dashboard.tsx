import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Users, WalletCards, Receipt } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

export function Dashboard() {
  const [metrics, setMetrics] = useState<{ participants: number; payments: number; totalAmount: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "No se pudieron cargar las métricas.");
        setMetrics(result.metrics);
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("enj_user") || "null");
  if (currentUser?.role !== "admin") return <Navigate to="/" replace />;

  if (error) return <main style={{ padding: 48, color: ENJ_MAGENTA, textAlign: "center" }}>{error}</main>;
  if (!metrics) return <main style={{ padding: 48, color: ENJ_NAVY, textAlign: "center" }}>Cargando dashboard...</main>;

  const cards = [
    { label: "Personas inscritas", value: metrics.participants.toLocaleString("es-VE"), icon: <Users size={24} />, color: ENJ_NAVY },
    { label: "Pagos registrados", value: metrics.payments.toLocaleString("es-VE"), icon: <Receipt size={24} />, color: ENJ_MAGENTA },
    { label: "Total recaudado", value: `${metrics.totalAmount.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs`, icon: <WalletCards size={24} />, color: "#157347" },
  ];

  return (
    <main style={{ background: "#F0F2FA", minHeight: "70vh", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ margin: 0, color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>Administración ENJ 2026</p>
        <h1 style={{ margin: "10px 0 8px", color: ENJ_NAVY, fontSize: 34 }}>Dashboard de inscripción</h1>
        <p style={{ margin: "0 0 30px", color: "rgba(0,11,111,0.62)" }}>Resumen actualizado de participantes y pagos registrados.</p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {cards.map((card) => (
            <article key={card.label} style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 4px 24px rgba(0,11,111,0.08)" }}>
              <div style={{ color: card.color, marginBottom: 18 }}>{card.icon}</div>
              <strong style={{ display: "block", color: ENJ_NAVY, fontSize: 30 }}>{card.value}</strong>
              <span style={{ color: "rgba(0,11,111,0.58)", fontSize: 14 }}>{card.label}</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
