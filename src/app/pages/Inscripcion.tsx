import { useState } from "react";
import { useNavigate } from "react-router";
import { FileDropzone } from "../components/FileDropzone";
import { GoogleDriveIcon } from "../components/GoogleDriveIcon";
import { CheckCircle2, User, Shield, CreditCard, Phone, Mail, MapPin, Hash, ChevronDown, ArrowLeft } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

const scouts_groups = [
  "Grupo Scout Nro. 1 - Caracas",
  "Grupo Scout Nro. 2 - Maracaibo",
  "Grupo Scout Nro. 3 - Valencia",
  "Grupo Scout Nro. 4 - Barquisimeto",
  "Grupo Scout Nro. 5 - Mérida",
  "Grupo Scout Nro. 6 - San Cristóbal",
  "Grupo Scout Nro. 7 - Puerto La Cruz",
  "Grupo Scout Nro. 8 - Guárico",
  "Grupo Scout Nro. 9 - Maracay",
  "Otro",
];

const ramas = ["Manada (Lobatos)", "Tropa (Scouts)", "Comunidad (Caminantes)", "Clan (Rovers)"];

function InputField({
  label,
  placeholder,
  type = "text",
  icon,
  required = true,
}: {
  label: string;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, letterSpacing: "0.01em" }}>
        {label}
        {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)", display: "flex", pointerEvents: "none" }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: icon ? "11px 14px 11px 40px" : "11px 14px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: "#0D0D2B",
            outline: "none",
            transition: "border 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.currentTarget.style.border = `1.5px solid ${ENJ_NAVY}`)}
          onBlur={(e) => (e.currentTarget.style.border = "1.5px solid rgba(0,11,111,0.15)")}
        />
      </div>
    </div>
  );
}

function SelectField({ label, options, required = true }: { label: string; options: string[]; required?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, letterSpacing: "0.01em" }}>
        {label}
        {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <select
          defaultValue=""
          style={{
            width: "100%",
            padding: "11px 40px 11px 14px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: "#0D0D2B",
            outline: "none",
            appearance: "none",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <option value="" disabled>Seleccionar...</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 4px" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,11,111,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.09em" }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,11,111,0.1)" }} />
    </div>
  );
}

export function Inscripcion() {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#F0F2FA" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 40px rgba(0,11,111,0.10)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
            <CheckCircle2 size={42} color="#22c55e" />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: ENJ_NAVY }}>¡Inscripción Enviada!</h2>
          <p style={{ margin: "0 0 28px", color: "rgba(0,11,111,0.6)", fontSize: 15, lineHeight: 1.7 }}>
            Hemos recibido tu solicitud correctamente. Recibirás una confirmación en tu correo electrónico en las próximas 24 horas.
          </p>
          <div style={{ background: "rgba(247,191,22,0.12)", border: "1.5px solid rgba(247,191,22,0.4)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6B4A00", fontWeight: 600 }}>
              📅 ENJ 2026 · 11, 12 y 13 de Septiembre · Guárico, Venezuela
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              border: "none",
              background: ENJ_NAVY,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F0F2FA", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* back link */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(0,11,111,0.6)",
            fontSize: 14,
            fontWeight: 600,
            padding: 0,
            marginBottom: 32,
          }}
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>

        {/* header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ background: ENJ_MAGENTA, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            ENJ 2026 · Guárico
          </span>
          <h1 style={{ margin: "16px 0 10px", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: ENJ_NAVY, letterSpacing: "-0.02em" }}>
            Formulario de Inscripción
          </h1>
          <p style={{ margin: 0, color: "rgba(0,11,111,0.55)", fontSize: 15, lineHeight: 1.65 }}>
            Completa todos los campos para reservar tu cupo en el Encuentro Nacional de Jóvenes.
          </p>
        </div>

        {/* steps */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
          {[
            { n: 1, label: "Credenciales", color: ENJ_NAVY },
            { n: 2, label: "Pago", color: ENJ_MAGENTA },
            { n: 3, label: "Documentos", color: "#22c55e" },
          ].map(({ n, label, color }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                  {n}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {i < 2 && (
                <div style={{ width: 56, height: 2, background: i === 0 ? ENJ_YELLOW : "rgba(0,11,111,0.15)", margin: "0 8px", marginBottom: 22 }} />
              )}
            </div>
          ))}
        </div>

        {/* form card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10), 0 1px 4px rgba(0,11,111,0.06)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── 1. CREDENCIALES ── */}
            <SectionDivider title="Credenciales Scout" icon={<Shield size={16} color={ENJ_NAVY} />} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Nombre(s)" placeholder="María" icon={<User size={16} />} />
              <InputField label="Apellido(s)" placeholder="González" icon={<User size={16} />} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Cédula de Identidad" placeholder="V-12.345.678" icon={<Hash size={16} />} />
              <InputField label="Fecha de Nacimiento" placeholder="dd/mm/aaaa" type="date" />
            </div>

            <SelectField label="Grupo Scout" options={scouts_groups} />
            <SelectField label="Rama Scout" options={ramas} />
            <InputField label="Nombre del Jefe de Grupo" placeholder="Prof. Carlos Rodríguez" icon={<Shield size={16} />} />

            {/* ── 2. CONTACTO ── */}
            <SectionDivider title="Datos de Contacto" icon={<Mail size={16} color={ENJ_NAVY} />} />

            <InputField label="Correo Electrónico" placeholder="maria@email.com" type="email" icon={<Mail size={16} />} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Teléfono" placeholder="+58 412 000 0000" type="tel" icon={<Phone size={16} />} />
              <InputField label="Estado / Ciudad" placeholder="Caracas, D.C." icon={<MapPin size={16} />} />
            </div>

            {/* ── 3. PAGO ── */}
            <SectionDivider title="Información de Pago" icon={<CreditCard size={16} color={ENJ_NAVY} />} />

            <div style={{ background: "rgba(247,191,22,0.10)", border: "1.5px solid rgba(247,191,22,0.4)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>💰</span>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#6B4A00" }}>Costo de Inscripción: $25 USD</p>
                <p style={{ margin: 0, fontSize: 12, color: "#7A5500", lineHeight: 1.5 }}>
                  Transferencia Zelle / Pago Móvil: <strong>scouts.ven.enj@gmail.com</strong>. Incluye alojamiento, alimentación y materiales del evento.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SelectField label="Método de Pago" options={["Zelle", "Pago Móvil", "Transferencia Bancaria", "PayPal"]} />
              <InputField label="Referencia / Confirmación" placeholder="REF-2026-XXXXX" icon={<Hash size={16} />} />
            </div>

            <InputField label="Monto Pagado (USD)" placeholder="25.00" type="number" icon={<CreditCard size={16} />} />

            {/* ── 4. DOCUMENTOS ── */}
            <SectionDivider title="Documentos Requeridos" icon={<GoogleDriveIcon size={16} />} />

            <p style={{ margin: 0, fontSize: 13, color: "rgba(0,11,111,0.55)", lineHeight: 1.6 }}>
              Sube los archivos solicitados. Puedes arrastrar y soltar o hacer clic para seleccionarlos desde tu dispositivo.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Comprobante de Pago
                </p>
                <FileDropzone
                  label="Subir comprobante"
                  sublabel="PDF, JPG o PNG · Máx. 5MB"
                  accept=".pdf,.jpg,.jpeg,.png"
                  icon={<GoogleDriveIcon size={24} />}
                />
              </div>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Foto del Participante
                </p>
                <FileDropzone
                  label="Subir foto"
                  sublabel="JPG o PNG · Fondo blanco · Máx. 2MB"
                  accept=".jpg,.jpeg,.png"
                  icon={<GoogleDriveIcon size={24} />}
                />
              </div>
            </div>

            {/* terms */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 4 }}>
              <input
                type="checkbox"
                id="terms"
                required
                style={{ marginTop: 2, width: 16, height: 16, accentColor: ENJ_NAVY, flexShrink: 0, cursor: "pointer" }}
              />
              <label htmlFor="terms" style={{ fontSize: 13, color: "rgba(0,11,111,0.65)", lineHeight: 1.6, cursor: "pointer", fontWeight: 400 }}>
                Acepto los{" "}
                <span style={{ color: ENJ_MAGENTA, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
                  términos y condiciones
                </span>{" "}
                del ENJ 2026 y confirmo que la información proporcionada es correcta y verídica.
              </label>
            </div>

            {/* submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "15px 24px",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, #B5006A 100%)`,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.01em",
                boxShadow: "0 4px 20px rgba(215,0,126,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
                marginTop: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(215,0,126,0.45)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(215,0,126,0.35)"; }}
            >
              Enviar Inscripción →
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(0,11,111,0.4)", margin: 0 }}>
              Tu información está protegida · Scouts de Venezuela © 2026
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
