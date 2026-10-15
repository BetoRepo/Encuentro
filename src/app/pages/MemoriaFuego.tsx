import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Flame, RotateCcw, Trophy } from "lucide-react";

const ENJ_NAVY = "#000B6F";
const ENJ_YELLOW = "#F7BF16";
const ENJ_MAGENTA = "#50039D";

// Parejas tomadas de la presentación "Química del Fuego" (Prevención de Incendios).
type Simbolo = "triangulo" | "cuadrado" | "circulo" | "estrella" | "hexagono";

interface Pareja {
  id: string;
  tema: string;
  concepto: string;
  definicion: string;
  color: string;
  simbolo?: Simbolo;
}

const PAREJAS: Pareja[] = [
  { id: "clase-a", tema: "Clase de fuego", concepto: "Clase A", definicion: "Madera, papel, cartón, tela, plástico", color: "#0E9F3E", simbolo: "triangulo" },
  { id: "clase-b", tema: "Clase de fuego", concepto: "Clase B", definicion: "Pintura, gasolina, petróleo", color: "#E3132C", simbolo: "cuadrado" },
  { id: "clase-c", tema: "Clase de fuego", concepto: "Clase C", definicion: "Equipos o instalaciones eléctricas", color: "#2B2BB8", simbolo: "circulo" },
  { id: "clase-d", tema: "Clase de fuego", concepto: "Clase D", definicion: "Sodio, potasio, magnesio, aluminio, titanio", color: "#C9A800", simbolo: "estrella" },
  { id: "clase-k", tema: "Clase de fuego", concepto: "Clase K", definicion: "Grasas y aceites de cocina", color: "#111111", simbolo: "hexagono" },
  { id: "eliminacion", tema: "Extinción", concepto: "Eliminación", definicion: "Retiramos el combustible", color: ENJ_MAGENTA },
  { id: "sofocacion", tema: "Extinción", concepto: "Sofocación", definicion: "Actuamos sobre el oxígeno", color: ENJ_MAGENTA },
  { id: "enfriamiento", tema: "Extinción", concepto: "Enfriamiento", definicion: "Disminuimos el calor", color: ENJ_MAGENTA },
  { id: "inhibicion", tema: "Extinción", concepto: "Inhibición", definicion: "Cortamos la reacción en cadena", color: ENJ_MAGENTA },
  { id: "rojo", tema: "Color de seguridad", concepto: "Rojo", definicion: "Peligro, prohibición y equipos contra incendios", color: "#E3132C" },
  { id: "amarillo", tema: "Color de seguridad", concepto: "Amarillo", definicion: "Atención: advertencia de riesgo o peligro", color: "#C9A800" },
  { id: "verde", tema: "Color de seguridad", concepto: "Verde", definicion: "Situación de seguridad, salvamento o auxilio", color: "#0E9F3E" },
  { id: "azul", tema: "Color de seguridad", concepto: "Azul", definicion: "Obligación (solo en forma circular)", color: "#2B2BB8" },
  { id: "conduccion", tema: "Transmisión del calor", concepto: "Conducción", definicion: "El calor pasa por contacto a través de un sólido", color: "#E8590C" },
  { id: "conveccion", tema: "Transmisión del calor", concepto: "Convección", definicion: "El calor sube con el aire o gases calientes", color: "#E8590C" },
  { id: "radiacion", tema: "Transmisión del calor", concepto: "Radiación", definicion: "El calor viaja en ondas, sin contacto", color: "#E8590C" },
  { id: "comburente", tema: "Tetraedro del fuego", concepto: "Comburente", definicion: "Oxígeno", color: ENJ_NAVY },
  { id: "calor", tema: "Tetraedro del fuego", concepto: "Calor", definicion: "Energía de activación", color: ENJ_NAVY },
];

const PAREJAS_POR_PARTIDA = 8;
const ESPERA_AL_FALLAR_MS = 1000;

interface Carta {
  key: string;
  parejaId: string;
  lado: "concepto" | "definicion";
}

function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function nuevaPartida(): Carta[] {
  const elegidas = barajar(PAREJAS).slice(0, PAREJAS_POR_PARTIDA);
  return barajar(
    elegidas.flatMap((p) => [
      { key: `${p.id}-c`, parejaId: p.id, lado: "concepto" as const },
      { key: `${p.id}-d`, parejaId: p.id, lado: "definicion" as const },
    ])
  );
}

const PAREJA_POR_ID = new Map(PAREJAS.map((p) => [p.id, p]));

function SimboloClase({ simbolo, color }: { simbolo: Simbolo; color: string }) {
  const clip: Record<Simbolo, string> = {
    triangulo: "polygon(50% 0, 100% 100%, 0 100%)",
    cuadrado: "inset(0)",
    circulo: "circle(50%)",
    estrella: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
    hexagono: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
  };
  return <span aria-hidden style={{ display: "inline-block", width: 22, height: 22, background: color, clipPath: clip[simbolo] }} />;
}

export function MemoriaFuego() {
  const [cartas, setCartas] = useState<Carta[]>(nuevaPartida);
  const [volteadas, setVolteadas] = useState<number[]>([]);
  const [encontradas, setEncontradas] = useState<Set<string>>(new Set());
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const ganado = encontradas.size === PAREJAS_POR_PARTIDA;

  const reiniciar = () => {
    window.clearTimeout(temporizador.current);
    setCartas(nuevaPartida());
    setVolteadas([]);
    setEncontradas(new Set());
    setIntentos(0);
    setBloqueado(false);
  };

  const voltear = (indice: number) => {
    if (bloqueado || volteadas.includes(indice) || encontradas.has(cartas[indice].parejaId)) return;

    const nuevas = [...volteadas, indice];
    setVolteadas(nuevas);
    if (nuevas.length < 2) return;

    setIntentos((n) => n + 1);
    const [a, b] = nuevas;
    if (cartas[a].parejaId === cartas[b].parejaId) {
      setEncontradas((prev) => new Set(prev).add(cartas[a].parejaId));
      setVolteadas([]);
    } else {
      setBloqueado(true);
      temporizador.current = window.setTimeout(() => {
        setVolteadas([]);
        setBloqueado(false);
      }, ESPERA_AL_FALLAR_MS);
    }
  };

  const aprendidas = cartas
    .filter((c) => c.lado === "concepto" && encontradas.has(c.parejaId))
    .map((c) => PAREJA_POR_ID.get(c.parejaId)!);

  return (
    <div style={{ background: "#F5F7FB", minHeight: "100vh", width: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
      <style>{`
        .mf-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .mf-card { perspective: 900px; aspect-ratio: 3 / 4; border: none; padding: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .mf-card:disabled { cursor: default; }
        .mf-inner { position: relative; width: 100%; height: 100%; transition: transform 0.45s; transform-style: preserve-3d; }
        .mf-card.is-up .mf-inner { transform: rotateY(180deg); }
        .mf-face { position: absolute; inset: 0; border-radius: 14px; backface-visibility: hidden; -webkit-backface-visibility: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px; box-sizing: border-box; text-align: center; }
        .mf-front { transform: rotateY(180deg); background: #fff; }
        .mf-card:focus-visible { outline: 3px solid ${ENJ_YELLOW}; outline-offset: 3px; border-radius: 14px; }
        .mf-concepto { font-size: 17px; font-weight: 800; line-height: 1.1; }
        .mf-definicion { font-size: 13px; font-weight: 600; line-height: 1.25; color: #1f2544; }
        .mf-tema { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.75; }
        @media (max-width: 560px) {
          .mf-grid { gap: 7px; }
          .mf-face { padding: 5px; border-radius: 10px; gap: 4px; }
          .mf-concepto { font-size: 13px; }
          .mf-definicion { font-size: 10px; }
          .mf-tema { font-size: 8px; letter-spacing: 0.02em; }
        }
        @media (prefers-reduced-motion: reduce) { .mf-inner { transition: none; } }
      `}</style>

      <header
        style={{
          background: `linear-gradient(135deg, ${ENJ_MAGENTA} 0%, ${ENJ_NAVY} 100%)`,
          color: "#fff",
          padding: "40px 16px 32px",
          textAlign: "center",
        }}
      >
        <p style={{ color: ENJ_YELLOW, fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 10px" }}>
          Prevención de incendios
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(26px, 6vw, 40px)", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Flame size={34} color={ENJ_YELLOW} /> Química del Fuego
        </h1>
        <p style={{ margin: "10px auto 0", maxWidth: 520, fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
          Juego de memoria: voltea dos cartas y une cada concepto con su significado.
        </p>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px 48px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Contador etiqueta="Intentos" valor={intentos} />
            <Contador etiqueta="Parejas" valor={`${encontradas.size}/${PAREJAS_POR_PARTIDA}`} />
          </div>
          <button onClick={reiniciar} style={botonReiniciar}>
            <RotateCcw size={16} /> Reiniciar
          </button>
        </div>

        {ganado && (
          <div
            role="status"
            style={{
              background: "#fff",
              borderLeft: `6px solid ${ENJ_YELLOW}`,
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 6px 20px rgba(0,11,111,0.08)",
            }}
          >
            <Trophy size={32} color={ENJ_YELLOW} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ color: ENJ_NAVY, fontSize: 17 }}>¡Completaste el juego!</strong>
              <div style={{ color: "#4a5070", fontSize: 14 }}>
                Encontraste las {PAREJAS_POR_PARTIDA} parejas en {intentos} intentos.
              </div>
            </div>
            <button onClick={reiniciar} style={{ ...botonReiniciar, padding: "8px 14px" }}>
              Jugar otra vez
            </button>
          </div>
        )}

        <div className="mf-grid">
          {cartas.map((carta, i) => {
            const pareja = PAREJA_POR_ID.get(carta.parejaId)!;
            const hecha = encontradas.has(carta.parejaId);
            const arriba = hecha || volteadas.includes(i);
            return (
              <button
                key={carta.key}
                className={`mf-card${arriba ? " is-up" : ""}`}
                onClick={() => voltear(i)}
                disabled={hecha}
                aria-label={arriba ? (carta.lado === "concepto" ? pareja.concepto : pareja.definicion) : "Carta boca abajo"}
              >
                <div className="mf-inner">
                  <div
                    className="mf-face"
                    style={{
                      background: `linear-gradient(145deg, ${ENJ_NAVY} 0%, ${ENJ_MAGENTA} 100%)`,
                      border: `2px solid ${ENJ_YELLOW}`,
                      boxShadow: "0 4px 12px rgba(0,11,111,0.18)",
                    }}
                  >
                    <Flame size={30} color={ENJ_YELLOW} />
                  </div>
                  <div
                    className="mf-face mf-front"
                    style={{
                      borderStyle: "solid",
                      borderColor: hecha ? "#0E9F3E" : pareja.color,
                      borderWidth: "6px 2px 2px",
                      boxShadow: hecha ? "0 0 0 3px rgba(14,159,62,0.25)" : "0 4px 12px rgba(0,11,111,0.12)",
                      opacity: hecha ? 0.85 : 1,
                    }}
                  >
                    <span className="mf-tema" style={{ color: pareja.color }}>{pareja.tema}</span>
                    {carta.lado === "concepto" ? (
                      <>
                        {pareja.simbolo && <SimboloClase simbolo={pareja.simbolo} color={pareja.color} />}
                        <span className="mf-concepto" style={{ color: pareja.color }}>{pareja.concepto}</span>
                      </>
                    ) : (
                      <span className="mf-definicion">{pareja.definicion}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {aprendidas.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <h2 style={{ color: ENJ_NAVY, fontSize: 18, fontWeight: 800, margin: "0 0 10px" }}>Lo que vas aprendiendo</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {aprendidas.map((p) => (
                <li key={p.id} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", borderLeft: `5px solid ${p.color}`, fontSize: 14, color: "#1f2544" }}>
                  <strong style={{ color: p.color }}>{p.concepto}</strong> · {p.definicion}
                  <span style={{ display: "block", fontSize: 11, color: "#7a7f99", marginTop: 2 }}>{p.tema}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function Contador({ etiqueta, valor }: { etiqueta: string; valor: number | string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "8px 16px", boxShadow: "0 2px 10px rgba(0,11,111,0.08)", minWidth: 86 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ENJ_MAGENTA }}>{etiqueta}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: ENJ_NAVY }}>{valor}</div>
    </div>
  );
}

const botonReiniciar: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  background: ENJ_YELLOW,
  color: ENJ_NAVY,
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  flexShrink: 0,
};
