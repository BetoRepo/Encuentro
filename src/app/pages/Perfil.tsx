import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, User, ChevronDown, Camera, MapPin, Heart, Instagram,
  ShieldCheck, Send, Users, CheckCircle, Clock, AlertCircle, Edit3, Share2,
  Sparkles, Award, Trophy, X, Upload
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import bannerImg from "../../assets/Bannerperfil.jpeg";
import { Elenco } from "./Elenco";
import { CREWS } from "../crews";

// ==========================================
// CONSTANTES DE DISEÑO ENJ 2026 (ASV)
// ==========================================
const ENJ_NAVY = "#000B6F";
const ENJ_MAGENTA = "#D7007E";
const ENJ_PURPLE = "#50039D";

// Estilos de la vista de perfil: credencial con la gráfica del banner ENJ
// (morado + amarillo, texto "ENJ" repetido, trama de puntos y stickers).
const PERFIL_CSS = `
.pf { --navy: ${ENJ_NAVY}; --purple: ${ENJ_PURPLE}; --magenta: ${ENJ_MAGENTA}; --yellow: #F7BF16;
  --ink: #0D0D2B; --muted: rgba(0,11,111,0.58); --line: rgba(0,11,111,0.08);
  display: flex; flex-direction: column; gap: 22px; font-family: Inter, sans-serif; }

/* ---------- HERO ---------- */
.pf-hero { position: relative; overflow: hidden; border-radius: 28px; color: #fff;
  background: linear-gradient(140deg, var(--purple) 0%, #3A0280 45%, var(--navy) 100%);
  box-shadow: 0 24px 60px rgba(80,3,157,0.28); isolation: isolate; }
.pf-hero::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: var(--yellow); }
.pf-hero-bg { position: absolute; inset: -10px -40px auto; display: flex; flex-direction: column; gap: 0; z-index: -1;
  font-weight: 900; font-size: clamp(64px, 12vw, 128px); line-height: 0.92; letter-spacing: -0.02em;
  color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,0.09); white-space: nowrap; user-select: none; }
.pf-hero-bg span:nth-child(2) { transform: translateX(-12%); }
.pf-hero-dots { position: absolute; right: -40px; bottom: -40px; width: 260px; height: 260px; z-index: -1; opacity: 0.35;
  background-image: radial-gradient(var(--yellow) 2px, transparent 2.5px); background-size: 14px 14px;
  -webkit-mask-image: radial-gradient(circle at 70% 70%, #000 0%, transparent 70%); mask-image: radial-gradient(circle at 70% 70%, #000 0%, transparent 70%); }
.pf-hero-actions { position: absolute; top: 18px; right: 18px; display: flex; gap: 10px; z-index: 2; }
.pf-icon-btn { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; color: #fff;
  background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(8px); transition: background .2s, transform .2s; }
.pf-icon-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
.pf-edit-btn { height: 42px; padding: 0 18px; border-radius: 999px; border: 0; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  background: #fff; color: var(--purple); font-weight: 800; font-size: 13px; box-shadow: 0 6px 18px rgba(0,0,0,0.2); transition: transform .2s; }
.pf-edit-btn:hover { transform: translateY(-1px); }
.pf-hero-body { display: flex; align-items: center; gap: clamp(20px, 4vw, 40px); padding: clamp(64px, 8vw, 72px) clamp(20px, 5vw, 44px) 22px; }
.pf-avatar-wrap { position: relative; flex-shrink: 0; }
.pf-avatar { width: clamp(132px, 18vw, 176px); aspect-ratio: 1; border-radius: 32px; overflow: hidden; display: grid; place-items: center;
  background: #F1EAFE; border: 5px solid var(--yellow); transform: rotate(-4deg); box-shadow: 0 16px 34px rgba(0,0,0,0.3); }
.pf-avatar img { width: 100%; height: 100%; object-fit: cover; }
.pf-avatar-sticker { position: absolute; right: -14px; bottom: -10px; width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center;
  background: var(--magenta); color: #fff; font-size: 11px; font-weight: 900; line-height: 1; text-align: center; letter-spacing: 0.02em;
  border: 3px solid #fff; transform: rotate(12deg); box-shadow: 0 6px 14px rgba(0,0,0,0.25); }
.pf-hero-info { min-width: 0; }
.pf-kicker { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--yellow); }
.pf-name { margin: 6px 0 12px; font-size: clamp(30px, 5vw, 46px); font-weight: 900; line-height: 1; letter-spacing: -0.03em; text-transform: uppercase; overflow-wrap: anywhere; }
.pf-name span { color: var(--yellow); }
.pf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.pf-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 999px; font-size: 12px; font-weight: 800; }
.pf-chip-yellow { background: var(--yellow); color: var(--navy); }
.pf-chip-crew { background: var(--magenta); color: #fff; text-transform: uppercase; letter-spacing: 0.04em; box-shadow: 0 4px 12px rgba(215,0,126,0.35); }
.pf-chip-outline { border: 1.5px solid rgba(255,255,255,0.55); color: #fff; }
.pf-chip-ghost { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.92); }
.pf-stats { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.pf-stat { min-width: 92px; padding: 10px 14px; border-radius: 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.16); }
.pf-stat strong { display: block; font-size: 24px; font-weight: 900; line-height: 1.1; font-variant-numeric: tabular-nums; }
.pf-stat small { font-size: 14px; opacity: 0.6; }
.pf-stat span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.75; }
.pf-hero-footer { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 0 clamp(20px, 5vw, 44px) 30px; }
.pf-handshake { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 999px; border: 0; font: inherit;
  font-size: 14px; font-weight: 900; background: var(--yellow); color: var(--navy); cursor: pointer;
  box-shadow: 0 6px 0 #C99200, 0 10px 24px rgba(0,0,0,0.25); transition: transform .15s, box-shadow .15s; }
.pf-handshake:hover:not(:disabled) { transform: translateY(-2px); }
.pf-handshake:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 2px 0 #C99200, 0 4px 10px rgba(0,0,0,0.2); }
.pf-handshake-done, .pf-handshake-own { background: rgba(255,255,255,0.14); color: #fff; box-shadow: none; cursor: default; }
.pf-insta { display: inline-flex; align-items: center; gap: 6px; color: #fff; text-decoration: none; font-size: 13px; font-weight: 700;
  padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.3); transition: background .2s; }
.pf-insta:hover { background: rgba(255,255,255,0.12); }

/* ---------- TARJETAS ---------- */
.pf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 22px; align-items: start; }
.pf-card { background: #fff; border-radius: 24px; padding: clamp(18px, 3vw, 26px); border: 1px solid var(--line); box-shadow: 0 10px 30px rgba(0,11,111,0.05); min-width: 0; }
.pf-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 900; color: var(--navy); }
.pf-title svg { color: var(--magenta); }
.pf-title-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.pf-subtitle { margin: 18px 0 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.pf-hint { margin: 6px 0 0; font-size: 12px; color: var(--muted); }
.pf-empty { margin: 14px 0 0; font-size: 13px; color: var(--muted); }
.pf-quote { position: relative; margin: 16px 0 0; padding: 16px 18px 16px 44px; border-radius: 18px; background: #FBF8FF;
  color: #2E2A4F; font-size: 14.5px; line-height: 1.6; font-weight: 500; }
.pf-quote::before { content: "“"; position: absolute; left: 12px; top: -4px; font-size: 54px; font-weight: 900; color: var(--magenta); line-height: 1; }
.pf-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-top: 16px; }
.pf-facts div { padding: 12px 14px; border-radius: 16px; background: #F6F7FC; }
.pf-facts span { display: block; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
.pf-facts strong { display: flex; align-items: center; gap: 6px; font-size: 13.5px; color: var(--navy); font-weight: 800; }
.pf-facts svg { color: var(--magenta); flex-shrink: 0; }
.pf-tags { display: flex; flex-wrap: wrap; gap: 7px; }
.pf-tags span { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; color: var(--purple); background: #F1EAFE; }

/* ---------- LOGROS ---------- */
.pf-progress-label { font-size: 12px; font-weight: 800; color: var(--purple); background: #F1EAFE; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.pf-progress { height: 10px; margin-top: 14px; border-radius: 999px; background: #EEF0F8; overflow: hidden; }
.pf-progress div { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--magenta), var(--purple)); transition: width .6s ease; }
.pf-badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 14px; margin-top: 18px; }
.pf-badge { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border-radius: 18px; font: inherit;
  border: 1.5px dashed rgba(0,11,111,0.16); background: #FAFBFF; color: var(--muted); transition: transform .2s, border-color .2s, box-shadow .2s; }
.pf-badge:not(:disabled) { cursor: pointer; }
.pf-badge:not(:disabled):hover { transform: translateY(-3px); border-color: var(--magenta); box-shadow: 0 10px 20px rgba(215,0,126,0.12); }
.pf-badge-medal { width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; background: #EEF0F8; color: rgba(0,11,111,0.35); }
.pf-badge-name { font-size: 11.5px; font-weight: 700; line-height: 1.2; text-align: center; }
.pf-badge-pts { font-size: 10px; font-weight: 800; opacity: 0.7; }
.pf-badge.is-unlocked { border-style: solid; border-color: transparent; background: linear-gradient(160deg, #FFF7DD, #F1EAFE); color: var(--navy); }
.pf-badge.is-unlocked .pf-badge-medal { background: var(--yellow); color: var(--purple); box-shadow: 0 0 0 4px #fff, 0 0 0 6px var(--purple); }
.pf-badge.is-unlocked .pf-badge-name { font-weight: 900; }

/* ---------- CUOTAS ---------- */
.pf-list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.pf-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; background: #F6F7FC; }
.pf-row strong { display: block; font-size: 13.5px; color: var(--navy); font-weight: 800; }
.pf-row span { font-size: 11.5px; color: var(--muted); }
.pf-status { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 999px; font-size: 11.5px !important; font-weight: 900; white-space: nowrap; }
.pf-status-ok { color: #15803D !important; background: rgba(22,163,74,0.12); }
.pf-status-bad { color: #B91C1C !important; background: rgba(220,38,38,0.1); }
.pf-status-wait { color: #A16207 !important; background: rgba(247,191,22,0.22); }

/* ---------- MURO ---------- */
.pf-wall-form { display: flex; gap: 8px; margin-top: 14px; }
.pf-wall-form input { flex: 1; min-width: 0; padding: 12px 16px; border-radius: 999px; border: 1.5px solid rgba(0,11,111,0.12); font: inherit; font-size: 13.5px; outline: none; background: #FAFBFF; }
.pf-wall-form input:focus { border-color: var(--purple); background: #fff; }
.pf-wall-form button { width: 46px; flex-shrink: 0; border: 0; border-radius: 50%; cursor: pointer; display: grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, var(--purple), var(--navy)); box-shadow: 0 6px 14px rgba(80,3,157,0.3); }
.pf-wall-list { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; max-height: 420px; overflow-y: auto; padding-right: 2px; }
.pf-msg { display: flex; gap: 10px; }
.pf-msg-avatar { flex-shrink: 0; width: 34px; height: 34px; border-radius: 12px; display: grid; place-items: center; font-size: 14px; font-weight: 900; color: var(--navy); background: var(--yellow); }
.pf-msg > div { flex: 1; min-width: 0; padding: 10px 14px; border-radius: 4px 16px 16px 16px; background: #F6F7FC; }
.pf-msg header { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 3px; }
.pf-msg strong { font-size: 12.5px; color: var(--navy); font-weight: 800; }
.pf-msg time { font-size: 10.5px; color: var(--muted); white-space: nowrap; }
.pf-msg p { margin: 0; font-size: 13px; color: #334155; line-height: 1.45; overflow-wrap: anywhere; }

.pf button:focus-visible, .pf a:focus-visible, .pf input:focus-visible { outline: 3px solid var(--yellow); outline-offset: 2px; }

@media (max-width: 640px) {
  .pf-hero-body { flex-direction: column; text-align: center; padding-top: 70px; }
  .pf-chips, .pf-stats, .pf-hero-footer { justify-content: center; }
  .pf-stat { flex: 1; min-width: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .pf *, .pf *::before, .pf *::after { transition: none !important; }
}
`;

// ==========================================
// ESTRUCTURA ORGANIZATIVA SCOUT DE VENEZUELA
// ==========================================
export interface ScoutRegion {
  region: string;
  districts: string[];
}

export const scoutRegions: ScoutRegion[] = [
  {
    region: "ESTRUCTURA NACIONAL / OSN",
    districts: [
      "CONSEJO SCOUT NACIONAL",
      "COOPERADORES DE SOPORTE",
      "OFICINA SCOUT NACIONAL",
      "COMISIONADO"
    ]
  },
  { region: "ANZOÁTEGUI", districts: ["EL TIGRE", "PUERTO LA CRUZ", "BARCELONA"] },
  { region: "APURE", districts: ["SAN FERNANDO"] },
  { region: "ARAGUA", districts: ["GUARICO", "HENRI PITTIER", "JOSE FELIX RIBAS", "MANUEL ATANASIO GIRARDOT", "SANTIAGO MARIÑO", "SUCRE ZAMORA"] },
  { region: "ATENDIDOS POR LA OSN", districts: ["BOLIVAR", "COJEDES", "FALCON", "GUARAPICHE", "PORTUGUESA", "PUERTO LA CRUZ", "TRUJILLO", "YARACUY"] },
  { region: "BARINAS", districts: ["BARINAS CENTRO"] },
  { region: "BOLÍVAR", districts: ["CARONÍ", "ANGOSTURA", "UPATA"] },
  { region: "CARABOBO", districts: ["GUACARA", "SAN ESTEBAN", "VALENCIA NORTE", "VALENCIA SUR"] },
  { region: "COJEDES", districts: ["SAN CARLOS"] },
  { region: "DISTRITO CAPITAL", districts: ["AVILA", "CARICUAO", "JOSE ANTONIO PAEZ", "LOS PROCERES", "MARISCAL SUCRE", "SANTIAGO DE LEON"] },
  { region: "FALCÓN", districts: ["CORO", "PARAGUANÁ"] },
  { region: "GUÁRICO", districts: ["VALLE DE LA PASCUA", "SAN JUAN DE LOS MORROS"] },
  { region: "LARA", districts: ["ANDRES ELOY BLANCO", "CATEDRAL", "CREPUSCULAR", "PALAVECINO"] },
  { region: "MÉRIDA", districts: ["CARI", "LIBERTADOR", "NO APLICA"] },
  { region: "METROPOLITANA", districts: ["BARUTA", "CHACAO", "SUCRE NORTE", "SUCRE SUR"] },
  { region: "MIRANDA", districts: ["ALTOS MIRANDINOS", "GUARENAS GUATIRE", "VALLES DEL TUY"] },
  { region: "MONAGAS", districts: ["MATURÍN"] },
  { region: "NUEVA ESPARTA", districts: ["PORLAMAR", "MARGARITA"] },
  { region: "PORTUGUESA", districts: ["ACARIGUA", "GUANARE"] },
  { region: "SUCRE", districts: ["CUMANÁ", "CARÚPANO"] },
  { region: "TÁCHIRA", districts: ["RIO TORBES", "SAN CRISTOBAL ESTE", "SAN CRISTOBAL OESTE"] },
  { region: "TRUJILLO", districts: ["VALERA", "TRUJILLO"] },
  { region: "YARACUY", districts: ["SAN FELIPE"] },
  { region: "ZULIA", districts: ["COQUIVACOA", "FRANCISCO POLANCO - PERIJA", "PEDRO HENRIQUEZ AMADO", "SAMUEL MARTINEZ", "SAN FRANCISCO", "ZULIA ORIENTAL"] }
];

const tiposRol = [
  "Protagonista (Joven participante)",
  "Equipo de Producción (Adultos de Soporte)",
  "Directores (Staff)"
];

const ramas = ["Comunidad (Caminante)", "Clan (Rover)", "Dirigencia / Adulto de Soporte"];
const opcionesGustos = [
  "RDJ", "Herramientas digitales", "Marca personal", "Comunicación y negociación", 
  "Educación financiera", "Idiomas", "Inclusión y diversidad", "Gestión de Riesgo", 
  "A Salvo del Peligro", "Gobernanza", "Ciudadanía activa", "Salud mental", 
  "Nutrición", "Derechos sexuales y reproductivos", "Intercambio cultural", 
  "Hacer amigos", "Intercambiar pañoletas", "Música/Canto", "Deportes", "Aldea Global"
];

interface InsigniaCatalogo {
  id: string;
  nombre: string;
  puntos?: number;
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
function InputField({ label, placeholder, type = "text", icon, required = true, value, onChange, disabled = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(0,11,111,0.4)", display: "flex", pointerEvents: "none" }}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            padding: icon ? "12px 14px 12px 42px" : "12px 14px",
            borderRadius: 12,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: disabled ? "#F4F5FA" : "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: disabled ? "rgba(0,11,111,0.5)" : "#0D0D2B",
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange, placeholder = "Seleccionar...", required = true, disabled = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>
        {label} {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            padding: "12px 40px 12px 14px",
            borderRadius: 12,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: disabled ? "#F4F5FA" : "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: disabled ? "rgba(0,11,111,0.35)" : "#0D0D2B",
            outline: "none",
            appearance: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} color="rgba(0,11,111,0.4)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 12px" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,11,111,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 800, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
      <div style={{ flex: 1, height: 1.5, background: "linear-gradient(to right, rgba(0,11,111,0.12), rgba(0,11,111,0.02))" }} />
    </div>
  );
}

// ==========================================
// MODAL DE POSTULACIÓN DE INSIGNIAS
// ==========================================
interface ModalProps {
  insignia: InsigniaCatalogo;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function SolicitudInsigniaModal({ insignia, userId, onClose, onSuccess }: ModalProps) {
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return alert("Por favor describe la prueba o evidencia realizada.");

    setLoading(true);
    try {
      let fotoUrl = "";

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${insignia.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("evidencias_insignias")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("evidencias_insignias")
          .getPublicUrl(filePath);

        fotoUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("solicitudes_insignias")
        .insert([
          {
            user_id: userId,
            insignia_id: insignia.id,
            descripcion_evidencia: descripcion.trim(),
            foto_url: fotoUrl,
            estado: "pendiente"
          }
        ]);

      if (insertError) throw insertError;

      alert("¡Solicitud de insignia enviada con éxito al Equipo Evaluador!");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error al enviar la solicitud: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,11,111,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", position: "relative" }}>
        
        <button type="button" onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "#F4F5FA", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ENJ_NAVY }}>
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ background: "rgba(215,0,126,0.1)", padding: 8, borderRadius: 12 }}>
            <Sparkles color={ENJ_MAGENTA} size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: 19, color: ENJ_NAVY, fontWeight: 900 }}>Demuestra tu Logro ENJ</h3>
        </div>

        <p style={{ fontSize: 13, color: "#555", margin: "0 0 18px", lineHeight: 1.4 }}>
          Insignia a solicitar: <strong style={{ color: ENJ_MAGENTA, fontWeight: 800 }}>{insignia.nombre}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: ENJ_NAVY, display: "block", marginBottom: 6 }}>
              ¿Cómo completaste este reto o taller? *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explica detalladamente la actividad o reto realizado..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid rgba(0,11,111,0.15)", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: ENJ_NAVY, display: "block", marginBottom: 6 }}>
              Adjuntar Foto / Evidencia (Opcional)
            </label>
            <label htmlFor="evidencia-file" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, border: `1.5px dashed ${ENJ_NAVY}`, background: "#FAFBFF", cursor: "pointer", transition: "all 0.2s" }}>
              <Upload size={18} color={ENJ_NAVY} />
              <span style={{ fontSize: 13, color: ENJ_NAVY, fontWeight: 700 }}>
                {file ? file.name : "Seleccionar foto del logro"}
              </span>
            </label>
            <input id="evidencia-file" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </div>

          {preview && (
            <img src={preview} alt="Vista previa" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, border: "2px solid #EAEFFF" }} />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, #FF2A85 100%)`,
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 6px 16px rgba(215,0,126,0.3)"
            }}
          >
            <Send size={16} />
            {loading ? "Enviando Solicitud..." : "Enviar a Validación del Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL DE PERFIL
// ==========================================
export function Perfil() {
  const navigate = useNavigate();
  const { id: urlUserId } = useParams();

  const currentUser = JSON.parse(localStorage.getItem("enj_user") || "null");
  const targetUserId = urlUserId || currentUser?.id;
  const isOwnProfile = Boolean(currentUser && currentUser.id === targetUserId);

  const [isEditing, setIsEditing] = useState(false);

  // 1. Datos Personales
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [rolEvento, setRolEvento] = useState("Protagonista (Joven participante)");

  // 2. Estructura Scout
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [grupoScout, setGrupoScout] = useState("");
  const [ramaScout, setRamaScout] = useState("");
  const [crew, setCrew] = useState("");

  // 3. Redes y Perfil Público
  const [descripcion, setDescripcion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [gustos, setGustos] = useState<string[]>([]);
  const [foto, setFoto] = useState("");
  const [apretonesCount, setApretonesCount] = useState(0);
  const [hasHandshaked, setHasHandshaked] = useState(false);

  const [loading, setLoading] = useState(false);

  // Muro Social & Pagos Privados
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [misPagos, setMisPagos] = useState<any[]>([]);

  // Insignias y Modal
  const [catalogoInsignias, setCatalogoInsignias] = useState<InsigniaCatalogo[]>([]);
  const [misInsigniasIds, setMisInsigniasIds] = useState<string[]>([]);
  const [insigniaParaSolicitar, setInsigniaParaSolicitar] = useState<InsigniaCatalogo | null>(null);

  useEffect(() => {
    if (!targetUserId) return;

    const loadProfileAndData = async () => {
      // Variable para almacenar la cédula del usuario y poder buscar sus pagos
      let userCedula = currentUser?.cedula || null;

      // 1. Cargar datos del perfil
      const { data } = await supabase.from("profiles").select("*").eq("id", targetUserId).single();
      if (data) {
        setNombre(data.nombre || "");
        setApellido(data.apellido || "");
        setBirthDate(data.birth_date || "");
        setRolEvento(data.rol_evento || "Protagonista (Joven participante)");
        setSelectedRegion(data.selected_region || "");
        setSelectedDistrict(data.selected_district || "");
        setGrupoScout(data.grupo_scout || "");
        setRamaScout(data.rama_scout || "");
        setCrew(data.crew || "");
        setDescripcion(data.descripcion || "");
        setInstagram(data.instagram || "");
        setGustos(data.gustos_evento || []);
        setFoto(data.foto || "");
        setApretonesCount(data.apretones_count || 0);
      } else if (isOwnProfile) {
        setIsEditing(true);
      }

      // 2. Cargar pagos si es perfil propio (CORRECCIÓN APLICADA AQUÍ)
      if (isOwnProfile) {
        let finalCedula = userCedula;
        
        // Si no tenemos la cédula registrada en caché, buscamos en la tabla de participantes
        if (!finalCedula) {
          const { data: partData } = await supabase
            .from("participantes")
            .select("cedula")
            .eq("id_usuario", targetUserId)
            .maybeSingle(); // maybeSingle para no lanzar excepción si no lo encuentra

          if (partData?.cedula) {
            finalCedula = partData.cedula;
          } else if (currentUser?.email) {
            // Plan b: Buscar por correo en participantes
            const { data: partDataByEmail } = await supabase
              .from("participantes")
              .select("cedula")
              .eq("correo", currentUser.email)
              .maybeSingle();
              
            if (partDataByEmail?.cedula) {
              finalCedula = partDataByEmail.cedula;
            }
          }
        }

        // Ahora sí, si conseguimos la cédula, la usamos; si no, fallback (aunque lo ideal es tener la cédula)
        const identifierToUse = finalCedula || targetUserId;
        
        const { data: pagosData } = await supabase
          .from("pagos")
          .select("*")
          .eq("cedula_participante", identifierToUse)
          .order("fecha_pago", { ascending: false });
          
        if (pagosData) setMisPagos(pagosData);
      }

      // 3. Cargar Muro Social
      const { data: muroData } = await supabase
        .from("muro_social")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(50);
      if (muroData) setComentarios(muroData);

      // 4. Cargar Catálogo e Insignias del Usuario
      const { data: catData } = await supabase.from("insignias").select("id, nombre, descripcion, imagen_url, tipo, puntos");
      if (catData) setCatalogoInsignias(catData);

      const { data: userInsigData } = await supabase
        .from("participante_insignias")
        .select("insignia_id")
        .eq("user_id", targetUserId);
      if (userInsigData) setMisInsigniasIds(userInsigData.map((i: any) => i.insignia_id));
    };

    loadProfileAndData();

    // Suscripción Realtime Muro Social
    const channel = supabase
      .channel(`muro_realtime_${targetUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "muro_social" },
        (payload) => {
          setComentarios((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId, isOwnProfile]);

  const toggleGusto = (item: string) => {
    setGustos(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleHandshake = async () => {
    if (isOwnProfile || hasHandshaked || !targetUserId) return;
    setHasHandshaked(true);

    const { data: total, error } = await supabase.rpc("dar_apreton", { p_destino: targetUserId });
    if (error) {
      setHasHandshaked(false);
      alert("No se pudo enviar el apretón de manos. Inténtalo de nuevo.");
      return;
    }
    setApretonesCount(typeof total === "number" ? total : apretonesCount + 1);
  };

  const handleSaveProfile = async () => {
    if (!nombre || !apellido || !selectedRegion || !selectedDistrict || !grupoScout || !ramaScout) {
      return alert("Por favor completa los campos obligatorios (*) del formulario.");
    }

    setLoading(true);
    try {
      const profilePayload = {
        id: currentUser?.id,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        birth_date: birthDate,
        rol_evento: rolEvento,
        selected_region: selectedRegion,
        selected_district: selectedDistrict,
        grupo_scout: grupoScout,
        rama_scout: ramaScout,
        crew: crew || null,
        descripcion: descripcion.trim(),
        instagram: instagram.trim().replace("@", ""),
        gustos_evento: gustos,
        foto,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(profilePayload);
      if (error) throw error;

      alert("¡Perfil Scout guardado exitosamente!");
      setIsEditing(false);
    } catch (error: any) {
      alert("Error al guardar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensajeMuro = async () => {
    if (!nuevoMensaje.trim()) return;
    const autorNombre = currentUser
      ? `${nombre || currentUser.email.split("@")[0]}`
      : "Scout Visitante";

    const { error } = await supabase.from("muro_social").insert([
      {
        autor: autorNombre,
        autor_id: currentUser?.id || null,
        mensaje: nuevoMensaje.trim(),
        fecha: new Date().toISOString()
      }
    ]);

    if (error) {
      alert("Error al publicar mensaje: " + error.message);
    } else {
      setNuevoMensaje("");
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/scout/${targetUserId}`;
    navigator.clipboard.writeText(link);
    alert("¡Enlace de tu perfil copiado al portapapeles!");
  };


  return (
    <div style={{ background: "#F0F3F9", minHeight: "100vh", padding: "48px 20px 80px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        
        {/* BOTÓN VOLVER */}
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8, 
            background: "#FFFFFF", 
            border: "1px solid rgba(0,11,111,0.1)", 
            borderRadius: 30,
            padding: "8px 16px",
            cursor: "pointer", 
            color: ENJ_NAVY, 
            fontSize: 13, 
            fontWeight: 700, 
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(0,11,111,0.04)"
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>

        {/* MODO EDICIÓN FORMULARIO */}
        {isEditing ? (
          <div style={{ background: "#fff", borderRadius: 28, padding: "clamp(24px, 5vw, 40px)", boxShadow: "0 15px 40px rgba(0,11,111,0.07)", border: "1px solid rgba(0,11,111,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <span style={{ background: `linear-gradient(135deg, ${ENJ_MAGENTA}, #FF2A85)`, color: "#fff", fontSize: 10, fontWeight: 900, padding: "5px 14px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>Edición de Perfil</span>
                <h2 style={{ margin: "8px 0 0", fontSize: 24, color: ENJ_NAVY, fontWeight: 900 }}>Actualiza tus Datos Scout</h2>
              </div>
              {nombre && (
                <button type="button" onClick={() => setIsEditing(false)} style={{ background: "#F4F5FA", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, cursor: "pointer" }}>
                  Cancelar
                </button>
              )}
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* FOTO DE EDICIÓN */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <label htmlFor="foto-upload" style={{ cursor: "pointer", position: "relative" }}>
                  <div style={{ 
                    padding: 4, 
                    borderRadius: "50%", 
                    background: `linear-gradient(135deg, ${ENJ_MAGENTA}, ${ENJ_NAVY})`,
                    boxShadow: "0 8px 20px rgba(0,11,111,0.15)"
                  }}>
                    <div style={{ width: 144, height: 144, borderRadius: "50%", border: "4px solid #fff", background: "#F4F5FA", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {foto ? <img src={foto} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={56} color="rgba(0,11,111,0.3)" />}
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: 4, right: 4, width: 36, height: 36, borderRadius: "50%", background: ENJ_MAGENTA, border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,0.2)" }}>
                    <Camera size={18} />
                  </div>
                </label>
                <input id="foto-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                <span style={{ fontSize: 12, color: "rgba(0,11,111,0.6)", fontWeight: 700 }}>Cambiar foto de perfil</span>
              </div>

              {/* SECCIÓN 1: DATOS PERSONALES */}
              <SectionDivider title="1. Datos Personales" icon={<User size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                <InputField label="Nombre(s)" placeholder="María" value={nombre} onChange={setNombre} />
                <InputField label="Apellido(s)" placeholder="González" value={apellido} onChange={setApellido} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                <InputField label="Fecha de Nacimiento" type="date" value={birthDate} onChange={setBirthDate} required={false} />
                <SelectField label="Rol en el Evento" options={tiposRol} value={rolEvento} onChange={setRolEvento} />
              </div>

              {/* SECCIÓN 2: ESTRUCTURA SCOUT */}
              <SectionDivider title="2. Estructura Scout" icon={<MapPin size={16} color={ENJ_NAVY} />} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                <SelectField
                  label="Región Scout"
                  options={scoutRegions.map((r) => r.region)}
                  value={selectedRegion}
                  onChange={(v: string) => { setSelectedRegion(v); setSelectedDistrict(""); }}
                />
                <SelectField
                  label="Distrito Scout"
                  options={scoutRegions.find((r) => r.region === selectedRegion)?.districts || []}
                  value={selectedDistrict}
                  disabled={!selectedRegion}
                  onChange={setSelectedDistrict}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                <InputField
                  label="Grupo Scout / Instancia"
                  placeholder="Ej. Grupo San Jorge 12"
                  value={grupoScout}
                  onChange={setGrupoScout}
                  required={true}
                />
                <SelectField label="Unidad / Rama" options={ramas} value={ramaScout} onChange={setRamaScout} />
              </div>

              {/* CREW */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY, display: "block", marginBottom: 4 }}>Tu Crew ENJ</label>
                <span style={{ fontSize: 12, color: "rgba(0,11,111,0.55)", display: "block", marginBottom: 10 }}>Elige el crew al que perteneces en el encuentro.</span>
                <div role="radiogroup" aria-label="Crew" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                  {CREWS.map((nombreCrew) => {
                    const selected = crew === nombreCrew;
                    return (
                      <button
                        key={nombreCrew}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setCrew(selected ? "" : nombreCrew)}
                        style={{
                          padding: "12px 10px",
                          borderRadius: 14,
                          border: selected ? `2px solid ${ENJ_PURPLE}` : "1.5px solid rgba(0,11,111,0.12)",
                          background: selected ? `linear-gradient(135deg, ${ENJ_PURPLE}, ${ENJ_NAVY})` : "#FAFBFF",
                          color: selected ? "#fff" : ENJ_NAVY,
                          fontSize: 14,
                          fontWeight: 900,
                          cursor: "pointer",
                          boxShadow: selected ? "0 6px 16px rgba(80,3,157,0.3)" : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        {selected ? "★ " : ""}{nombreCrew}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN 3: REDES E INTERESES */}
              <SectionDivider title="3. Social & Redes ENJ" icon={<Heart size={16} color={ENJ_NAVY} />} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>Biografía / Lema Scout</label>
                <textarea placeholder="Cuéntanos tus expectativas para el ENJ 2026..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1.5px solid rgba(0,11,111,0.15)", outline: "none", boxSizing: "border-box", fontSize: 13, fontFamily: "Inter, sans-serif" }} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: ENJ_NAVY, display: "block", marginBottom: 10 }}>Tus intereses en el ENJ 2026:</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {opcionesGustos.map((item) => {
                    const selected = gustos.includes(item);
                    return (
                      <button key={item} type="button" onClick={() => toggleGusto(item)} style={{ padding: "6px 14px", borderRadius: 100, border: selected ? `1.5px solid ${ENJ_MAGENTA}` : "1.5px solid rgba(0,11,111,0.12)", background: selected ? "rgba(215,0,126,0.08)" : "#FAFBFF", color: selected ? ENJ_MAGENTA : ENJ_NAVY, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                        {selected ? "✓ " : "+ "}{item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <InputField label="Instagram" placeholder="usuario" icon={<Instagram size={16} />} value={instagram} onChange={setInstagram} required={false} />

              <button type="button" onClick={handleSaveProfile} disabled={loading} style={{ marginTop: 12, padding: "16px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, #FF2A85 100%)`, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 20px rgba(215,0,126,0.3)" }}>
                <Sparkles size={18} /> {loading ? "Guardando Perfil..." : "Guardar Perfil Scout"}
              </button>
            </form>
          </div>
        ) : (

          /* VISTA DEL PERFIL */
          <div className="pf">
            <style>{PERFIL_CSS}</style>

            {/* 1. HERO */}
            <section className="pf-hero">
              <div className="pf-hero-bg" aria-hidden="true">
                <span>ENJ ENJ ENJ ENJ ENJ ENJ</span>
                <span>ENJ ENJ ENJ ENJ ENJ ENJ</span>
                <span>ENJ ENJ ENJ ENJ ENJ ENJ</span>
              </div>
              <div className="pf-hero-dots" aria-hidden="true" />

              <div className="pf-hero-actions">
                <button type="button" className="pf-icon-btn" onClick={copyProfileLink} title="Copiar enlace del perfil" aria-label="Copiar enlace del perfil">
                  <Share2 size={18} />
                </button>
                {isOwnProfile && (
                  <button type="button" className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                    <Edit3 size={15} /> Editar perfil
                  </button>
                )}
              </div>

              <div className="pf-hero-body">
                <div className="pf-avatar-wrap">
                  <div className="pf-avatar">
                    {foto ? <img src={foto} alt={nombre} /> : <User size={64} color={ENJ_PURPLE} />}
                  </div>
                  <span className="pf-avatar-sticker">ENJ<br />2026</span>
                </div>

                <div className="pf-hero-info">
                  <span className="pf-kicker">Elenco · Encuentro Nacional de Jóvenes</span>
                  <h1 className="pf-name">
                    {nombre || "Scout"} <span>{apellido}</span>
                  </h1>
                  <div className="pf-chips">
                    {crew && <span className="pf-chip pf-chip-crew">★ Crew {crew}</span>}
                    <span className="pf-chip pf-chip-yellow">{rolEvento}</span>
                    {ramaScout && <span className="pf-chip pf-chip-outline">{ramaScout}</span>}
                    {selectedRegion && (
                      <span className="pf-chip pf-chip-ghost"><MapPin size={13} /> {selectedRegion}{selectedDistrict ? ` · ${selectedDistrict}` : ""}</span>
                    )}
                  </div>

                  <div className="pf-stats">
                    <div className="pf-stat">
                      <strong>{apretonesCount}</strong>
                      <span>Apretones</span>
                    </div>
                    <div className="pf-stat">
                      <strong>{misInsigniasIds.length}{catalogoInsignias.length > 0 && <small>/{catalogoInsignias.length}</small>}</strong>
                      <span>Insignias</span>
                    </div>
                    <div className="pf-stat">
                      <strong>{gustos.length}</strong>
                      <span>Intereses</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pf-hero-footer">
                {isOwnProfile ? (
                  <span className="pf-handshake pf-handshake-own">🤝 {apretonesCount} apretones recibidos</span>
                ) : (
                  <button
                    type="button"
                    className={`pf-handshake${hasHandshaked ? " pf-handshake-done" : ""}`}
                    onClick={handleHandshake}
                    disabled={hasHandshaked}
                  >
                    🤝 {hasHandshaked ? "¡Apretón enviado!" : "Dar apretón de manos"}
                  </button>
                )}
                {instagram && (
                  <a className="pf-insta" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">
                    <Instagram size={16} /> @{instagram}
                  </a>
                )}
              </div>
            </section>

            {/* 2. SOBRE MÍ */}
            <section className="pf-card pf-about">
                <h3 className="pf-title"><Sparkles size={18} /> Sobre mí</h3>
                {descripcion ? (
                  <blockquote className="pf-quote">{descripcion}</blockquote>
                ) : (
                  <p className="pf-empty">{isOwnProfile ? "Aún no tienes biografía. Cuéntale al elenco qué esperas del ENJ." : "Este scout todavía no ha escrito su biografía."}</p>
                )}

                <div className="pf-facts">
                  <div>
                    <span>Grupo / Instancia</span>
                    <strong><Award size={15} /> {grupoScout || "Sin registrar"}</strong>
                  </div>
                  <div>
                    <span>Región / Distrito</span>
                    <strong><MapPin size={15} /> {selectedRegion || "ASV"}{selectedDistrict ? ` · ${selectedDistrict}` : ""}</strong>
                  </div>
                </div>

                {gustos.length > 0 && (
                  <>
                    <h4 className="pf-subtitle">Me interesa</h4>
                    <div className="pf-tags">
                      {gustos.map((g) => <span key={g}>#{g}</span>)}
                    </div>
                  </>
                )}
            </section>

            {/* 3. LOGROS */}
            <section className="pf-card">
              <div className="pf-title-row">
                <h3 className="pf-title"><Trophy size={18} /> Logros del campamento</h3>
                {catalogoInsignias.length > 0 && (
                  <span className="pf-progress-label">{misInsigniasIds.length} de {catalogoInsignias.length}</span>
                )}
              </div>
              {catalogoInsignias.length > 0 && (
                <div className="pf-progress" role="progressbar" aria-valuemin={0} aria-valuemax={catalogoInsignias.length} aria-valuenow={misInsigniasIds.length}>
                  <div style={{ width: `${(misInsigniasIds.length / catalogoInsignias.length) * 100}%` }} />
                </div>
              )}
              {isOwnProfile && catalogoInsignias.length > 0 && <p className="pf-hint">Toca una insignia bloqueada para enviar tu evidencia.</p>}

              {catalogoInsignias.length === 0 ? (
                <p className="pf-empty">Las insignias del campamento aparecerán aquí muy pronto.</p>
              ) : (
                <div className="pf-badges">
                  {catalogoInsignias.map((insignia) => {
                    const isUnlocked = misInsigniasIds.includes(insignia.id);
                    const canApply = !isUnlocked && isOwnProfile;
                    return (
                      <button
                        type="button"
                        key={insignia.id}
                        className={`pf-badge${isUnlocked ? " is-unlocked" : ""}`}
                        onClick={() => canApply && setInsigniaParaSolicitar(insignia)}
                        disabled={!canApply}
                        title={canApply ? "Envía tu evidencia" : insignia.nombre}
                      >
                        <span className="pf-badge-medal"><Award size={30} /></span>
                        <span className="pf-badge-name">{insignia.nombre}</span>
                        {insignia.puntos ? <span className="pf-badge-pts">{insignia.puntos} pts</span> : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 4. CUOTAS (PRIVADO) + MURO */}
            <div className="pf-grid">
              {isOwnProfile && (
                <section className="pf-card">
                  <h3 className="pf-title"><ShieldCheck size={18} /> Mis cuotas ENJ 2026</h3>
                  <p className="pf-hint">Solo tú ves esta sección.</p>
                  {misPagos.length === 0 ? (
                    <p className="pf-empty">No has reportado cuotas todavía.</p>
                  ) : (
                    <div className="pf-list">
                      {misPagos.map((pago) => {
                        const isValidado = pago.estado === "validado";
                        const isRechazado = pago.estado === "rechazado";
                        const estado = isValidado ? "ok" : isRechazado ? "bad" : "wait";
                        return (
                          <div key={pago.id} className="pf-row">
                            <div>
                              <strong>{pago.numero_cuota || "Cuota ENJ 2026"}</strong>
                              <span>{pago.fecha_pago ? new Date(`${pago.fecha_pago}T12:00:00`).toLocaleDateString("es-VE") : "Sin fecha"}</span>
                            </div>
                            <span className={`pf-status pf-status-${estado}`}>
                              {isValidado && <CheckCircle size={14} />}
                              {isRechazado && <AlertCircle size={14} />}
                              {!isValidado && !isRechazado && <Clock size={14} />}
                              {isValidado ? "Validado" : isRechazado ? "Rechazado" : "Pendiente"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              <section className="pf-card pf-wall">
                <h3 className="pf-title"><Users size={18} /> Muro del elenco</h3>
                <div className="pf-wall-form">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje para el elenco..."
                    value={nuevoMensaje}
                    maxLength={500}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleEnviarMensajeMuro())}
                    aria-label="Mensaje para el muro"
                  />
                  <button type="button" onClick={handleEnviarMensajeMuro} aria-label="Publicar mensaje">
                    <Send size={16} />
                  </button>
                </div>
                <div className="pf-wall-list">
                  {comentarios.length === 0 ? (
                    <p className="pf-empty">Aún no hay mensajes. ¡Sé el primero!</p>
                  ) : (
                    comentarios.map((c, idx) => (
                      <article key={c.id || idx} className="pf-msg">
                        <span className="pf-msg-avatar" aria-hidden="true">{String(c.autor || "?").trim().charAt(0).toUpperCase()}</span>
                        <div>
                          <header>
                            <strong>{c.autor}</strong>
                            <time>
                              {c.fecha && !Number.isNaN(new Date(c.fecha).getTime())
                                ? new Date(c.fecha).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Caracas" })
                                : ""}
                            </time>
                          </header>
                          <p>{c.mensaje}</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* 5. ELENCO */}
            <Elenco />
          </div>
        )}

        {/* MODAL DE POSTULACIÓN DE INSIGNIAS */}
        {insigniaParaSolicitar && currentUser && (
          <SolicitudInsigniaModal
            insignia={insigniaParaSolicitar}
            userId={currentUser.id}
            onClose={() => setInsigniaParaSolicitar(null)}
            onSuccess={() => {
              // Notificación o refresco opcional
            }}
          />
        )}

      </div>
    </div>
  );
}

export default Perfil;