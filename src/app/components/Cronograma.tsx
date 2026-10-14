import { useState } from "react";
import { Clock } from "lucide-react";

type Tono = "blanco" | "rosa" | "magenta" | "salmon" | "navy" | "vacio";

interface Bloque {
  title: string;
  time?: string;
  start: number; // índice de la fila (hora) donde empieza
  span: number; // cuántas filas ocupa
  tono: Tono;
}

interface Dia {
  day: string;
  date: string;
  bloques: Bloque[];
}

export interface Fase {
  titulo: string;
  horas: string[];
  dias: Dia[];
}

const TONOS: Record<Tono, { bg: string; color: string }> = {
  blanco: { bg: "#FFFFFF", color: "#D1007A" },
  rosa: { bg: "#FF1F5E", color: "#FFFFFF" },
  magenta: { bg: "#D1007A", color: "#FFFFFF" },
  salmon: { bg: "#FFA284", color: "#A3103B" },
  navy: { bg: "#0A0A6B", color: "#FFFFFF" },
  vacio: { bg: "#F2F2F5", color: "transparent" },
};

const HEADER = "#D1007A";
const LINEA = "#E2DCEB";

export const faseOnline: Fase = {
  titulo: "Fase Online (Demo Days)",
  horas: ["8:00 a.m.", "9:00 a.m.", "10:00 a.m.", "11:00 a.m.", "12:00 m.", "1:00 p.m.", "2:00 p.m.", "3:00 p.m.", "4:00 p.m.", "5:00 p.m.", "6:00 p.m.", "7:00 p.m.", "8:00 p.m.", "9:00 p.m."],
  dias: [
    {
      day: "Viernes",
      date: "23/10",
      bloques: [
        { title: "", start: 0, span: 11, tono: "vacio" },
        { title: "Inicio de Oro y Normativas", time: "7:00 - 7:45 p.m.", start: 11, span: 1, tono: "blanco" },
        { title: "Protocolos y Seguridad", time: "7:45 - 8:15 p.m.", start: 12, span: 1, tono: "blanco" },
        { title: "Ambientación y Cronograma", time: "8:15 - 9:00 p.m.", start: 13, span: 1, tono: "blanco" },
      ],
    },
    {
      day: "Sábado",
      date: "24/10",
      bloques: [
        { title: "Tiempo de Conexión", start: 0, span: 1, tono: "blanco" },
        { title: "Red de Jóvenes y Buenas Prácticas", time: "8:30 - 12:00 m.", start: 1, span: 4, tono: "rosa" },
        { title: "Mesa de Trabajo 1 y Resultados", time: "12:00 - 2:15 p.m.", start: 5, span: 2, tono: "rosa" },
        { title: "Break", start: 7, span: 1, tono: "blanco" },
        { title: "Mundo Seguro", time: "4:15 - 5:30 p.m.", start: 8, span: 2, tono: "salmon" },
        { title: "VihVOS", time: "5:30 - 7:00 p.m.", start: 10, span: 1, tono: "salmon" },
        { title: "Bienestar y sus Dimensiones", time: "7:00 - 7:45 p.m.", start: 11, span: 1, tono: "salmon" },
        { title: "Abordaje de Comunidades", time: "8:00 - 9:00 p.m.", start: 12, span: 2, tono: "salmon" },
      ],
    },
    {
      day: "Domingo",
      date: "25/10",
      bloques: [
        { title: "Tiempo de Conexión", start: 0, span: 1, tono: "blanco" },
        { title: "Diversidad e Inclusión", time: "9:00 - 9:45 a.m.", start: 1, span: 1, tono: "salmon" },
        { title: "Punto y Seguido", time: "9:45 - 10:30 a.m.", start: 2, span: 1, tono: "salmon" },
        { title: "Primeros Auxilios Psicológicos (PAP)", time: "10:30 - 12:00 m.", start: 3, span: 2, tono: "salmon" },
        { title: "", start: 5, span: 9, tono: "vacio" },
      ],
    },
  ],
};

export const fasePresencial: Fase = {
  titulo: "Fase Presencial",
  horas: ["7:00 a.m.", "8:00 a.m.", "9:00 a.m.", "10:00 a.m.", "11:00 a.m.", "12:00 m.", "1:00 p.m.", "2:00 p.m.", "3:00 p.m.", "4:00 p.m.", "5:00 p.m.", "6:00 p.m.", "7:00 p.m.", "8:00 p.m.", "9:00 p.m.", "10:00 p.m.", "11:00 p.m."],
  dias: [
    {
      day: "Viernes",
      date: "30/10",
      bloques: [
        { title: "Traslado de parte de evento", start: 0, span: 3, tono: "blanco" },
        { title: "Registro", start: 3, span: 2, tono: "blanco" },
        { title: "Bienestar 360", time: "12:00 - 1:30 p.m.", start: 5, span: 1, tono: "salmon" },
        { title: "Frecuencia Cero", time: "1:45 - 3:30 p.m.", start: 6, span: 3, tono: "salmon" },
        { title: "La Churuata del Encuentro", time: "3:30 - 4:30 p.m.", start: 9, span: 1, tono: "navy" },
        { title: "Mesas de Trabajo 2 y 3", time: "4:30 - 6:45 p.m.", start: 10, span: 2, tono: "rosa" },
        { title: "Sazón en el Set", time: "6:45 - 8:00 p.m.", start: 12, span: 1, tono: "salmon" },
        { title: "Cena", start: 13, span: 1, tono: "blanco" },
        { title: "La Churuata del Encuentro", time: "8:45 - 10:00 p.m.", start: 14, span: 2, tono: "navy" },
        { title: "", start: 16, span: 1, tono: "vacio" },
      ],
    },
    {
      day: "Sábado",
      date: "31/10",
      bloques: [
        { title: "Despertarse y Desayuno", start: 0, span: 2, tono: "blanco" },
        { title: "Asamblea General", time: "8:30 - 12:00 m.", start: 2, span: 3, tono: "rosa" },
        { title: "Almuerzo", start: 5, span: 1, tono: "blanco" },
        { title: "Desafío Generación Z", time: "12:45 - 7:00 p.m.", start: 6, span: 6, tono: "magenta" },
        { title: "Conclusiones Finales", start: 12, span: 1, tono: "rosa" },
        { title: "Festival y Cena", time: "8:30 - 11:00 p.m.", start: 13, span: 4, tono: "navy" },
      ],
    },
    {
      day: "Domingo",
      date: "01/11",
      bloques: [
        { title: "Despertarse y Desayuno", start: 0, span: 2, tono: "blanco" },
        { title: "Lectura Manifiesto y Elección", time: "8:00 - 10:00 a.m.", start: 2, span: 2, tono: "rosa" },
        { title: "Uso de Instalaciones", start: 4, span: 2, tono: "navy" },
        { title: "Almuerzo", start: 6, span: 1, tono: "blanco" },
        { title: "Cierre", start: 7, span: 1, tono: "blanco" },
        { title: "", start: 8, span: 9, tono: "vacio" },
      ],
    },
  ],
};

export function Cronograma({ fase }: { fase: Fase }) {
  const [diaMovil, setDiaMovil] = useState(0);
  const HEAD_ROWS = 2;

  return (
    <div>
      {/* Escritorio: parrilla horaria */}
      <div
        className="crono-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "110px repeat(3, minmax(0, 1fr))",
          gridTemplateRows: `auto auto repeat(${fase.horas.length}, minmax(34px, auto))`,
          gap: 1,
          background: LINEA,
          border: `1px solid ${LINEA}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(80, 3, 157, 0.08)",
        }}
      >
        <div style={{ gridColumn: "1 / -1", background: HEADER, color: "white", textAlign: "center", padding: "12px 8px", fontWeight: 800, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {fase.titulo}
        </div>
        <div style={{ background: HEADER, color: "white", padding: "10px 12px", fontWeight: 800, fontSize: 14 }}>Hora</div>
        {fase.dias.map((d) => (
          <div key={d.day} style={{ background: HEADER, color: "white", padding: "10px 8px", fontWeight: 800, fontSize: 14, textAlign: "center" }}>
            {d.day} {d.date}
          </div>
        ))}

        {fase.horas.map((h, i) => (
          <div key={h} style={{ gridColumn: 1, gridRow: i + HEAD_ROWS + 1, background: "white", padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "#1F1F3A", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
            {h}
          </div>
        ))}

        {fase.dias.map((d, dIdx) =>
          d.bloques.map((b, bIdx) => {
            const t = TONOS[b.tono];
            return (
              <div
                key={`${dIdx}-${bIdx}`}
                aria-hidden={b.tono === "vacio" || undefined}
                style={{
                  gridColumn: dIdx + 2,
                  gridRow: `${b.start + HEAD_ROWS + 1} / span ${b.span}`,
                  background: t.bg,
                  color: t.color,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "6px 10px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                {b.title && <span>{b.title}</span>}
                {b.time && <span style={{ fontWeight: 600, opacity: 0.95 }}>({b.time})</span>}
              </div>
            );
          })
        )}
      </div>

      {/* Móvil: un día a la vez */}
      <div className="crono-list" style={{ display: "none" }}>
        <div style={{ background: HEADER, color: "white", textAlign: "center", padding: "12px 8px", fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", borderRadius: "16px 16px 0 0" }}>
          {fase.titulo}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, padding: 8, background: "white", borderLeft: `1px solid ${LINEA}`, borderRight: `1px solid ${LINEA}` }}>
          {fase.dias.map((d, i) => (
            <button
              key={d.day}
              onClick={() => setDiaMovil(i)}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 4px",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 13,
                background: diaMovil === i ? HEADER : "#F5F0FA",
                color: diaMovil === i ? "white" : HEADER,
              }}
            >
              {d.day}
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, opacity: 0.85 }}>{d.date}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8, background: "white", border: `1px solid ${LINEA}`, borderTop: "none", borderRadius: "0 0 16px 16px" }}>
          {fase.dias[diaMovil].bloques
            .filter((b) => b.tono !== "vacio")
            .map((b, i) => {
              const t = TONOS[b.tono];
              const blanco = b.tono === "blanco";
              return (
                <div
                  key={i}
                  style={{
                    background: t.bg,
                    color: t.color,
                    border: blanco ? `1px solid ${LINEA}` : "none",
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", minWidth: 78, opacity: 0.9 }}>
                    <Clock size={13} style={{ flexShrink: 0 }} />
                    {fase.horas[b.start]}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
                    {b.title}
                    {b.time && <span style={{ display: "block", fontSize: 12, fontWeight: 600, opacity: 0.9 }}>{b.time}</span>}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .crono-grid { display: none !important; }
          .crono-list { display: block !important; }
        }
      `}</style>
    </div>
  );
}
