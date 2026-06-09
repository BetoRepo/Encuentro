import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropzone } from "../components/FileDropzone";
import { GoogleDriveIcon } from "../components/GoogleDriveIcon";
import { CheckCircle2, User, Shield, CreditCard, Phone, Mail, MapPin, Hash, ChevronDown, ArrowLeft } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#D7007E";

type ScoutDistrict = {
  district: string;
  groups: string[];
};

type ScoutRegion = {
  region: string;
  districts: ScoutDistrict[];
};

const scoutRegions: ScoutRegion[] = [
  {
    region: "ARAGUA",
    districts: [
      {
        district: "Guarico",
        groups: ["INDEPENDENCIA"],
      },
      {
        district: "HENRI PITTIER",
        groups: [
          "ARAGUANEY",
          "CIUDAD JARDIN",
          "HUMBOLDT",
          "JOSE SMITH",
          "LIBERTADOR",
        ],
      },
      {
        district: "JOSE FELIX RIBAS",
        groups: ["GUSTAVO JOSE VOLLMER H."],
      },
      {
        district: "MANUEL ATANASIO GIRARDOT",
        groups: [
          "GRAN MARISCAL DE AYACUCHO",
          "LA SAGRADA FAMILIA",
        ],
      },
      {
        district: "SANTIAGO MARIÑO",
        groups: [
          "GENERAL SANTIAGO MARIÑO",
          "INDEPENDENCIA",
          "ORION",
        ],
      },
      {
        district: "SUCRE ZAMORA",
        groups: [
          "AGUSTÍN CODAZZI",
          "FRANCISCO DE MIRANDA",
        ],
      },
    ],
  },
  {
    region: "ATENDIDOS POR LA OSN",
    districts: [
      {
        district: "BOLIVAR",
        groups: [
          "KENYA",
          "SAN FRANCISCO DE ASIS",
          "SOROCAIMA",
        ],
      },
      {
        district: "COJEDES",
        groups: ["GENAZARET"],
      },
      {
        district: "FALCON",
        groups: [
          "FRANCISCO DE MIRANDA",
          "NAZARET",
          "POSEIDON",
        ],
      },
      {
        district: "GUARAPICHE",
        groups: [
          "CECILIO ACOSTA",
          "MORICHE",
          "TIPURO",
          "VILLA DE MORICHAL",
        ],
      },
      {
        district: "PORTUGUESA",
        groups: [
          "BADEN POWELL",
          "CENTAURO DE LOS LLANOS",
          "GUANAGUANARE",
          "TAMANACO",
        ],
      },
      {
        district: "PUERTO LA CRUZ",
        groups: [
          "ANDRES ELOY BLANCO",
          "ARAUCA",
          "CIVO",
          "DON BOSCO VII",
          "MARIA AUXILIADORA",
          "PADRE JOSE MARIA VELAZ",
        ],
      },
      {
        district: "TRUJILLO",
        groups: ["SANTA TERESITA"],
      },
      {
        district: "YARACUY",
        groups: [
          "BOGDAN PLEGUNOV TOMM",
          "ELIGIO VARGAS OCHOA",
          "PIONEROS DE YARACUY",
          "ROLAND ERASMUS PHILIPPS",
        ],
      },
    ],
  },
  {
    region: "CARABOBO",
    districts: [
      {
        district: "GUACARA",
        groups: [
          "GEA",
          "PADRE JORGE DEVOS",
          "SAN AGUSTIN",
        ],
      },
      {
        district: "SAN ESTEBAN",
        groups: [
          "EXPLORADORES DE BROWNSEA",
          "HEROES DE BADEN POWELL",
          "INAGUANAGOA",
          "LIBERTADOR",
          "NUESTRA SEÑORA DE BEGOÑA",
          "RELAMPAGO DEL CATATUMBO",
          "SAN DIEGO DE ALCALA",
          "VALENCIA DEL REY",
        ],
      },
      {
        district: "VALENCIA NORTE",
        groups: [
          "ACUARIUS",
          "BATALLA DE CARABOBO",
          "CASUPO",
          "DON BOSCO",
          "JUPITER",
          "LA SALLE GUAPARO",
        ],
      },
      {
        district: "VALENCIA SUR",
        groups: [
          "MONSEÑOR AROCHA",
          "RAFAEL URDANETA",
        ],
      },
    ],
  },
  {
    region: "DISTRITO CAPITAL",
    districts: [
      {
        district: "AVILA",
        groups: [
          "ARISTIDES ROJAS",
          "BICENTENARIO",
          "DON BOSCO 21",
          "HENRI PITTIER",
          "LA SALLE LA COLINA",
          "NEPTUNO",
        ],
      },
      {
        district: "CARICUAO",
        groups: [
          "AGUSTINO",
          "CLAUDIO FELICIANO",
          "SAN AGUSTIN",
          "SAN BENITO 20",
          "SAN BENITO XIV",
          "TOMAS SANABRIA",
        ],
      },
      {
        district: "JOSE ANTONIO PAEZ",
        groups: [
          "ANDROMEDA",
          "CARACAS RIMOR",
          "DON BOSCO",
          "SIMON BOLIVAR",
        ],
      },
      {
        district: "LOS PROCERES",
        groups: [
          "FRANCISCO DE MIRANDA",
          "RORAIMA",
        ],
      },
      {
        district: "MARISCAL SUCRE",
        groups: [
          "ALDEBARAN",
          "COMETA",
          "RENACER",
          "SAN JOSE DE CALASANZ 38",
          "SAN JOSE DE CALASANZ 40",
        ],
      },
      {
        district: "SANTIAGO DE LEON",
        groups: [
          "LA SALLE TIENDA HONDA",
          "LIBERTADOR",
          "MADRE RAFOLS",
          "SAN BENITO 18",
        ],
      },
    ],
  },
  {
    region: "LARA",
    districts: [
      {
        district: "ANDRES ELOY BLANCO",
        groups: ["GUERREROS DE YACAMBU"],
      },
      {
        district: "CATEDRAL",
        groups: [
          "GENERAL JACINTO LARA",
          "LA SALLE",
          "NUEVA SEGOVIA",
          "SIMON BOLIVAR",
        ],
      },
      {
        district: "CREPUSCULAR",
        groups: [
          "CARLOS LAURER",
          "HERMANO JUAN",
          "MONSEÑOR ROMERO",
        ],
      },
      {
        district: "PALAVECINO",
        groups: [
          "LISANDRO ALVARADO",
          "TEREPAIMA",
        ],
      },
    ],
  },
  {
    region: "MERIDA",
    districts: [
      {
        district: "CARI",
        groups: [
          "GUAKES",
          "JOSE FELIX RIBAS",
          "YUKOS",
        ],
      },
      {
        district: "LIBERTADOR",
        groups: [
          "LIBERTADOR",
          "ORION LXXII",
          "SANTIAGO DE LOS CABALLEROS",
          "ZUHE",
        ],
      },
      {
        district: "NO APLICA",
        groups: ["ELITE"],
      },
    ],
  },
  {
    region: "METROPOLITANA",
    districts: [
      {
        district: "BARUTA",
        groups: [
          "AUTANA",
          "DIPAHO",
          "KURENAN",
          "SANTA ROSALIA DE PALERMO",
          "SEONEE",
        ],
      },
      {
        district: "CHACAO",
        groups: [
          "DON BOSCO",
          "SANTO TOMAS DE AQUINO",
        ],
      },
      {
        district: "SUCRE NORTE",
        groups: [
          "CLARET",
          "DOMINGO SAVIO",
          "MACONDO",
          "SAN CAYETANO",
        ],
      },
      {
        district: "SUCRE SUR",
        groups: [
          "AMAZONIA",
          "MAFEKING 100",
          "PLEYADES 7",
          "SIGUANOI",
        ],
      },
    ],
  },
  {
    region: "MIRANDA",
    districts: [
      {
        district: "ALTOS MIRANDINOS",
        groups: [
          "CAYAURIMA",
          "DON BOSCO",
          "LOS NUEVOS TEQUES",
          "MIRANDA",
          "PARAMACONI",
        ],
      },
      {
        district: "GUARENAS GUATIRE",
        groups: [
          "AGUATIRI",
          "ALIANZA",
          "GAMMA",
          "MAFEKING100",
          "ORION 84",
          "SIRIO 23",
        ],
      },
      {
        district: "VALLES DEL TUY",
        groups: [
          "CACIQUE CUE",
          "CHARALLAVE",
          "RAMON OCANDO PEREZ",
        ],
      },
    ],
  },
  {
    region: "TACHIRA",
    districts: [
      {
        district: "RIO TORBES",
        groups: [
          "BADEN POWELL G.S DON BOSCO",
          "LAS VEGAS DE TARIBA",
          "SAN FRANCISCO DE ASIS",
        ],
      },
      {
        district: "SAN CRISTOBAL ESTE",
        groups: [
          "ALCALDIA DE SAN CRISTOBAL",
          "ASOGATA",
          "CAPROU",
          "FRANKLIN EDUARDO VILLAMIZAR VELAZCO",
          "FUNTHA SIND",
          "POOLE DE DORSET",
        ],
      },
      {
        district: "SAN CRISTOBAL OESTE",
        groups: [
          "BADEN POWELL XVIII",
          "CIPRIANO CASTRO",
          "GISA",
          "ROBERTO RAMIREZ G.",
        ],
      },
    ],
  },
  {
    region: "ZULIA",
    districts: [
      {
        district: "COQUIVACOA",
        groups: [
          "BRAVOS DE PAEZ",
          "INDEPENDENCIA",
          "LA TRINIDAD",
          "LUCILA PALACIOS",
          "PAOLA PRINCE",
        ],
      },
      {
        district: "FRANCISCO POLANCO - PERIJA",
        groups: ["MARANATHA"],
      },
      {
        district: "PEDRO HENRIQUEZ AMADO",
        groups: [
          "SAN JORGE",
          "SAN SEBASTIAN",
        ],
      },
      {
        district: "SAMUEL MARTINEZ",
        groups: [
          "CIUDADELA FARIA",
          "L.U.Z",
          "LA VICTORIA",
          "LOS OLIVOS",
          "RAFAEL URDANETA",
        ],
      },
      {
        district: "SAN FRANCISCO",
        groups: [
          "ADRIEL ENRIQUE",
          "BADEN POWELL",
          "MANAURE",
          "MARA",
          "MARISCAL SUCRE",
          "VENEZUELA",
        ],
      },
      {
        district: "ZULIA ORIENTAL",
        groups: [
          "COPAIBA",
          "OMEGA",
          "SANTA RITA",
        ],
      },
    ],
  },
];

const ramas = [ "Comunidad (Caminantes)", "Clan (Rovers)" ];

function InputField({
  label,
  placeholder,
  type = "text",
  icon,
  required = true,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
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
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
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

function SelectField({ label, options, value, onChange, placeholder = "Seleccionar...", required = true, disabled = false }: { label: string; options: string[]; value?: string; onChange?: (value: string) => void; placeholder?: string; required?: boolean; disabled?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: ENJ_NAVY, letterSpacing: "0.01em" }}>
        {label}
        {required && <span style={{ color: ENJ_MAGENTA, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value ?? ""}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "11px 40px 11px 14px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,11,111,0.15)",
            background: disabled ? "#F4F5FA" : "#FAFBFF",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: disabled ? "rgba(0,11,111,0.35)" : "#0D0D2B",
            outline: "none",
            appearance: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            boxSizing: "border-box",
          }}
        >
          <option value="" disabled>{placeholder}</option>
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
  const [participantType, setParticipantType] = useState<"joven" | "adulto">("joven");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const navigate = useNavigate();

  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [fotoParticipante, setFotoParticipante] = useState<File | null>(null);
  const [screenshotMedica, setScreenshotMedica] = useState<File | null>(null);

  const [acceptTerms, setAcceptTerms] = useState(false);

  function calculateAge(dateString: string) {
    const date = new Date(dateString);
    if (!dateString || Number.isNaN(date.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    const dayDiff = now.getDate() - date.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years -= 1;
    }
    return years >= 0 ? years : null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms) {
      alert("Debe leer y aceptar el acuerdo de convivencia.");
      return;
    }
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

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 30, flexWrap: "wrap" }}>
          {[
            { label: "Joven", value: "joven" },
            { label: "Adulto", value: "adulto" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setParticipantType(option.value as "joven" | "adulto")}
              style={{
                borderRadius: 999,
                border: `1.5px solid ${participantType === option.value ? ENJ_MAGENTA : "rgba(0,11,111,0.18)"}`,
                /* ERROR CORREGIDO AQUÍ: Se completó la lógica del operador ternario */
                background: participantType === option.value ? ENJ_MAGENTA : "#fff",
                color: participantType === option.value ? "#fff" : ENJ_NAVY,
                padding: "12px 28px",
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: participantType === option.value ? "0 12px 30px rgba(215,0,126,0.16)" : "none",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 40px rgba(0,11,111,0.10), 0 1px 4px rgba(0,11,111,0.06)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <SectionDivider title="Credenciales Scout" icon={<Shield size={16} color={ENJ_NAVY} />} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Nombre(s)" placeholder="María" icon={<User size={16} />} />
              <InputField label="Apellido(s)" placeholder="González" icon={<User size={16} />} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Cédula de Identidad" placeholder="V-12.345.678" icon={<Hash size={16} />} />
              <InputField
                label="Fecha de Nacimiento"
                placeholder="dd/mm/aaaa"
                type="date"
                value={birthDate}
                onChange={(value) => {
                  setBirthDate(value);
                  setAge(calculateAge(value));
                }}
              />
            </div>
            {age !== null && (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(0,11,111,0.65)", fontWeight: 600 }}>
                Edad: {age} años
              </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SelectField
                label="Región Scout"
                options={scoutRegions.map((region) => region.region)}
                value={selectedRegion}
                onChange={(value) => {
                  setSelectedRegion(value);
                  setSelectedDistrict("");
                  setSelectedGroup("");
                }}
              />
              <SelectField
                label="Distrito Scout"
                options={
                  selectedRegion
                    ? scoutRegions.find((region) => region.region === selectedRegion)?.districts.map((district) => district.district) ?? []
                    : []
                }
                value={selectedDistrict}
                onChange={(value) => {
                  setSelectedDistrict(value);
                  setSelectedGroup("");
                }}
                disabled={!selectedRegion}
                placeholder={selectedRegion ? "Seleccionar distrito..." : "Selecciona región primero"}
              />
            </div>
            <SelectField
              label="Grupo Scout"
              options={
                selectedDistrict && selectedRegion
                  ? scoutRegions
                      .find((region) => region.region === selectedRegion)
                      ?.districts.find((district) => district.district === selectedDistrict)
                      ?.groups ?? []
                  : []
              }
              value={selectedGroup}
              onChange={setSelectedGroup}
              disabled={!selectedDistrict}
              placeholder={selectedDistrict ? "Seleccionar grupo..." : "Selecciona distrito primero"}
            />
            <SelectField label="Rama Scout" options={ramas} />

            <SectionDivider title="Datos de Contacto" icon={<Mail size={16} color={ENJ_NAVY} />} />

            <InputField label="Correo Electrónico" placeholder="maria@email.com" type="email" icon={<Mail size={16} />} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputField label="Teléfono" placeholder="+58 412 000 0000" type="tel" icon={<Phone size={16} />} />
              <InputField label="Estado / Ciudad" placeholder="Caracas, D.C." icon={<MapPin size={16} />} />
            </div>

            <SectionDivider title={participantType === "adulto" ? "Datos del Adulto" : "Datos del Joven"} icon={<User size={16} color={ENJ_NAVY} />} />
            {participantType === "joven" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelectField label="Rama Actual" options={ramas} />
                  <InputField label="Líder de Rama" placeholder="Prof. Carlos Rodríguez" />
                </div>
                <InputField label="Año de Grupo" placeholder="2026" />
                <InputField label="Talla de Uniforme" placeholder="M / L / XL" />
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Ocupación / Profesión" placeholder="Abogado" />
                  <InputField label="Rol en Scouts" placeholder="Dirigente / Adulto en el Movimiento" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <InputField label="Años de experiencia scout" placeholder="Ej. 5" type="number" />
                  <InputField label="Teléfono de emergencia" placeholder="+58 412 000 0000" type="tel" />
                </div>
              </>
            )}

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

            <SectionDivider title="Documentos Requeridos" icon={<GoogleDriveIcon size={16} />} />

            <p style={{ margin: 0, fontSize: 13, color: "rgba(0,11,111,0.55)", lineHeight: 1.6 }}>
              Sube los archivos solicitados directamente desde tu dispositivo. Puedes arrastrar y soltar o hacer clic para seleccionarlos.
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
                  onFileSelect={(file: File) => setComprobantePago(file)}
                />
                {comprobantePago && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {comprobantePago.name}</p>}
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
                  onFileSelect={(file: File) => setFotoParticipante(file)}
                />
                {fotoParticipante && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {fotoParticipante.name}</p>}
              </div>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: ENJ_NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Screenshot ficha médica
                </p>
                <FileDropzone
                  label="Subir screenshot"
                  sublabel="PNG o JPG · Máx. 5MB"
                  accept=".jpg,.jpeg,.png"
                  icon={<GoogleDriveIcon size={24} />}
                  onFileSelect={(file: File) => setScreenshotMedica(file)}
                />
                {screenshotMedica && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>✓ {screenshotMedica.name}</p>}
              </div>
            </div>

            <div style={{ 
              background: "#F8FAFC", 
              border: "1.5px solid rgba(0,11,111,0.12)", 
              borderRadius: 12, 
              padding: 16,
              marginTop: 10
            }}>
              <p style={{ margin: "0 0 10px 0", fontSize: 13, fontWeight: 700, color: ENJ_NAVY }}>
                Lee atentamente el Acuerdo de Convivencia oficial del ENJ 2026:
              </p>
              
              <div style={{ 
                height: 150, 
                overflowY: "scroll", 
                background: "#fff", 
                border: "1px solid rgba(0,11,111,0.08)", 
                borderRadius: 8, 
                padding: 12, 
                fontSize: 12, 
                lineHeight: 1.6, 
                color: "rgba(0,11,111,0.7)",
                textAlign: "justify"
              }}>
                <strong>1. Participación:</strong> Cada participante es el "protagonista" de su aprendizaje. Se espera una asistencia del 100% a las Mesas Técnicas y Plenarias. Durante las actividades virtuales, se debe utilizar un lenguaje formal y respetuoso. El uso de cámaras es obligatorio. Está prohibido compartir enlaces de acceso. Se debe mantener el respeto en Paneles de Expertos y Masterclasses hacia los facilitadores y especialistas.<br/><br/>
                <strong>2. Instalaciones:</strong> Al llegar a San Juan de los Morros, cada participante debe formalizar su registro. Queda prohibido cualquier daño a la infraestructura. Cada participante es responsable de mantener su área libre de desperdicios. Se prohíbe correr, gritar o realizar dinámicas en los pasillos de las habitaciones en cualquier horario. Se prohíbe dejar regletas o cargadores conectados sin supervisión.<br/><br/>
                <strong>3. Bienestar y Seguridad:</strong> Se aplicará de forma estricta la Política de Salvo del Peligro (Safe from Harm). Cualquier sospecha de acoso, abuso o maltrato debe ser reportada de inmediato al equipo de bienestar. Las relaciones inadecuadas o la falta de consentimiento son motivo de expulsión inmediata. No se permiten conductas que estigmatizan trastornos.<br/><br/>
                <strong>4. Comunicaciones y Privacidad:</strong> Solo se permite generar contenido que cuide la marca scout. La información compartida en el "Confesionario Abierto" es estrictamente privada. Todo participante debe portar su Ficha Médica actualizada y original; sin este documento, no se permitirá el ingreso. Las publicaciones en redes personales deben alinearse con los valores scouts. El uso de dispositivos en plenarias y talleres se limita a fines indicados.<br/><br/>
                <strong>5. Prohibiciones:</strong> Prohibido el alcohol, tabaco/vapeadores y drogas. Cualquier acto de agresión física o verbal resultará en la descalificación (expulsión).<br/><br/>
                <strong>6. Gestión de Riesgo y Horarios:</strong> La pañoleta y la credencial son obligatorios. El programa inicia a las 07:00 AM y finaliza a las 11:00 PM. A partir de las 11:00 PM se restringe la circulación y el ruido en las áreas de pernocta.<br/><br/>
                <strong>7. Alimentación y Aseo:</strong> Solo se atenderán dietas especiales reportadas previamente. Se debe limitar el tiempo de ducha. Queda prohibido lavar ropa en los lavamanos o duchas del hotel.<br/><br/>
                <strong>8. Perímetro Seguro y Salidas:</strong> El ENJ es un evento de régimen cerrado. Nadie puede salir del Hotel Aguas Termales sin autorización. No se permiten visitas externas. En actividades externas, nadie se desplaza solo; se debe ir en parejas o tríos y dar aviso al Staff. Se aplicará la ética de "No Deje Rastro". Todo medicamento no registrado en la ficha médica será retirado por seguridad.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 4 }}>
              <input
                type="checkbox"
                id="terms"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: ENJ_NAVY, flexShrink: 0, cursor: "pointer" }}
              />
              <label htmlFor="terms" style={{ fontSize: 13, color: "rgba(0,11,111,0.65)", lineHeight: 1.6, cursor: "pointer", fontWeight: 400 }}>
                Acepto los{" "}
                <span style={{ color: ENJ_MAGENTA, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
                  términos y condiciones
                </span>{" "}
                del ENJ 2026 y confirmo que he leído y me comprometo a cumplir el Acuerdo de Convivencia.
              </label>
            </div>

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