import { useState, useEffect } from "react";

const EVENT_DATE = new Date("2026-09-11T08:00:00");

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function update() {
      const now = new Date();
      const diff = EVENT_DATE.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Días", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Minutos", value: timeLeft.minutes },
    { label: "Segundos", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
      {units.map(({ label, value }) => (
        <div
          key={label}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(247,191,22,0.4)",
            borderRadius: 16,
            minWidth: 88,
            padding: "18px 22px",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 48,
              fontWeight: 900,
              color: "#F7BF16",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pad(value)}
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.65)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginTop: 8,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
