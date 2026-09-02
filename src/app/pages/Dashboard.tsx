import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Users, WalletCards, Receipt } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";

type DashboardParticipant = {
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  region: string;
  distrito: string;
  grupo_scout: string;
  rama: string;
  tipo_participante: string;
  totalPagado: number;
  totalPagadoUsd: number;
  pagos: Array<{ numero_cuota: string; monto_bs: number; monto_usd: number; referencia: string; fecha_pago: string | null; estado: string }>;
  documentos: Array<{ tipo_documento: string; nombre_archivo: string; url_archivo?: string; mime_type?: string; path_archivo?: string }>;
};

export function Dashboard() {
  const [data, setData] = useState<{ bcvRate: number; metrics: { participants: number; payments: number; totalAmount: number; totalAmountUsd: number }; participants: DashboardParticipant[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "No se pudieron cargar las métricas.");
        setData({
          bcvRate: Number(result.bcvRate) || 1,
          metrics: result.metrics,
          participants: result.participants || [],
        });
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("enj_user") || "null");
  if (currentUser?.role !== "admin") return <Navigate to="/" replace />;

  if (error) return <main style={{ padding: 48, color: ENJ_MAGENTA, textAlign: "center" }}>{error}</main>;
  if (!data) return <main style={{ padding: 48, color: ENJ_NAVY, textAlign: "center" }}>Cargando dashboard...</main>;

  const cards = [
    { label: "Personas inscritas", value: data.metrics.participants.toLocaleString("es-VE"), icon: <Users size={24} />, color: ENJ_NAVY },
    { label: "Pagos registrados", value: data.metrics.payments.toLocaleString("es-VE"), icon: <Receipt size={24} />, color: ENJ_MAGENTA },
    { label: "Total recaudado", value: `${data.metrics.totalAmount.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs / ${data.metrics.totalAmountUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })} USD`, icon: <WalletCards size={24} />, color: "#157347" },
  ];

  return (
    <main style={{ background: "#F0F2FA", minHeight: "70vh", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ margin: 0, color: ENJ_MAGENTA, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>Administración ENJ 2026</p>
        <h1 style={{ margin: "10px 0 8px", color: ENJ_NAVY, fontSize: 34 }}>Dashboard de inscripción</h1>
        <p style={{ margin: "0 0 30px", color: "rgba(0,11,111,0.62)" }}>Resumen de participantes, pagos y archivos cargados.</p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {cards.map((card) => (
            <article key={card.label} style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 4px 24px rgba(0,11,111,0.08)" }}>
              <div style={{ color: card.color, marginBottom: 18 }}>{card.icon}</div>
              <strong style={{ display: "block", color: ENJ_NAVY, fontSize: 30 }}>{card.value}</strong>
              <span style={{ color: "rgba(0,11,111,0.58)", fontSize: 14 }}>{card.label}</span>
            </article>
          ))}
        </section>

        <section style={{ marginTop: 30, display: "grid", gap: 18 }}>
          {data.participants.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 14, padding: 24 }}>No hay participantes registrados aún.</div>
          ) : (
            data.participants.map((participant) => (
              <article key={participant.cedula} style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 4px 24px rgba(0,11,111,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, color: ENJ_NAVY, fontSize: 22 }}>{participant.nombre} {participant.apellido}</h2>
                    <p style={{ margin: "6px 0 0", color: "rgba(0,11,111,0.6)" }}>CI: {participant.cedula} • {participant.region || "Sin región"} / {participant.distrito || "Sin distrito"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: ENJ_MAGENTA, fontWeight: 800 }}>{participant.totalPagado.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs</div>
                    <div style={{ color: "rgba(0,11,111,0.7)", fontWeight: 700 }}>{participant.totalPagadoUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })} USD</div>
                    <small style={{ color: "rgba(0,11,111,0.6)" }}>{participant.pagos.length} pagos</small>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
                  <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 12 }}>
                    <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8 }}>Contacto</strong>
                    <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>{participant.correo || "Sin correo"}</div>
                    <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>{participant.telefono || "Sin teléfono"}</div>
                  </div>

                  <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 12 }}>
                    <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8 }}>Unidad</strong>
                    <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>{participant.grupo_scout || "Sin grupo"}</div>
                    <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>{participant.rama || "Sin rama"}</div>
                    <div style={{ fontSize: 13, color: "rgba(0,11,111,0.7)" }}>{participant.tipo_participante || "Sin tipo"}</div>
                  </div>

                  <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 12 }}>
                    <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8 }}>Pagos</strong>
                    {participant.pagos.length ? participant.pagos.map((payment, index) => (
                      <div key={`${payment.numero_cuota}-${index}`} style={{ fontSize: 12, color: "rgba(0,11,111,0.7)", marginBottom: 8 }}>
                        {payment.numero_cuota}: {Number(payment.monto_bs).toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs ({Number(payment.monto_usd || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })} USD) • {payment.referencia || "Sin referencia"}
                      </div>
                    )) : <div style={{ fontSize: 12, color: "rgba(0,11,111,0.7)" }}>Sin pagos</div>}
                  </div>

                  <div style={{ background: "#F8F9FF", borderRadius: 12, padding: 12 }}>
                    <strong style={{ display: "block", color: ENJ_NAVY, marginBottom: 8 }}>Archivos</strong>
                    {participant.documentos.length ? participant.documentos.map((doc, index) => (
                      <div key={`${doc.tipo_documento}-${index}`} style={{ marginBottom: 8, fontSize: 12, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        {doc.url_archivo ? (
                          <a href={doc.url_archivo} target="_blank" rel="noreferrer" style={{ color: ENJ_NAVY, textDecoration: "underline", wordBreak: "break-word" }}>
                            {doc.nombre_archivo || doc.tipo_documento}
                          </a>
                        ) : (
                          <span style={{ color: "rgba(0,11,111,0.7)" }}>{doc.nombre_archivo || doc.tipo_documento}</span>
                        )}
                        {doc.url_archivo && (
                          <a href={doc.url_archivo} target="_blank" rel="noreferrer" download={doc.nombre_archivo || doc.tipo_documento} style={{ color: "#fff", background: ENJ_MAGENTA, borderRadius: 8, padding: "5px 8px", textDecoration: "none", fontWeight: 700 }}>
                            Descargar
                          </a>
                        )}
                      </div>
                    )) : <div style={{ fontSize: 12, color: "rgba(0,11,111,0.7)" }}>Sin archivos</div>}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
