"use client";

import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./ui/carousel";

type Monitor = {
  team: string;
  name: string;
  photo?: string;
};

export default function MonitorsCarousel({
  monitors,
  inline = true,
}: {
  monitors: Monitor[];
  inline?: boolean;
}) {
  const ENJ_NAVY = "#000B6F";
  const ENJ_YELLOW = "#F7BF16";
  const ENJ_MAGENTA = "#D7007E";

  const containerStyle: React.CSSProperties = inline
    ? { width: "100%", maxWidth: 820, margin: "0 auto", position: "relative", padding: "12px 0" }
    : { width: "100%" };

  const arrowCommon: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: 24,
    background: ENJ_MAGENTA,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    boxShadow: "0 8px 20px rgba(215,0,126,0.22)",
    zIndex: 30,
  };

  const prevButtonStyle: React.CSSProperties = inline
    ? { position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)", ...arrowCommon }
    : { ...arrowCommon };

  const nextButtonStyle: React.CSSProperties = inline
    ? { position: "absolute", right: -28, top: "50%", transform: "translateY(-50%)", ...arrowCommon }
    : { ...arrowCommon };

  const cardStyle: React.CSSProperties = {
    background: "#F8FAFF",
    borderRadius: 28,
    border: "1px solid rgba(0,11,111,0.08)",
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    boxShadow: "0 18px 44px rgba(0,11,111,0.08)",
  };

  return (
    <div style={containerStyle}>
      <Carousel opts={{ containScroll: "trimSnaps", align: "center" }}>
        <CarouselPrevious style={prevButtonStyle} />
        <CarouselContent>
          {monitors.map((monitor) => (
            <CarouselItem key={monitor.team} style={{ minWidth: inline ? "100%" : 320, width: inline ? "100%" : 320, display: "flex", justifyContent: "center" }}>
              <div style={cardStyle}>
                <div style={{ width: "100%", height: 420, overflow: "hidden", background: ENJ_YELLOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {monitor.photo ? (
                    <img
                      src={monitor.photo}
                      alt={monitor.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        const original = img.getAttribute("data-original-src") || img.src;
                        img.setAttribute("data-original-src", original);

                        if (original.endsWith(".jpg") || original.endsWith(".png") || original.endsWith(".webp")) {
                          const svgPath = original.replace(/\.[^/.]+$/, ".svg");
                          if (img.src !== svgPath) {
                            img.src = svgPath;
                            return;
                          }
                        }

                        if (img.src.includes("/assets/monitors/")) {
                          const alt = img.src.replace("/assets/monitors/", "/images/");
                          if (img.src !== alt) img.src = alt;
                        }
                      }}
                    />
                  ) : (
                    monitor.team
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                  )}
                </div>
                <div style={{ padding: 24 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: ENJ_MAGENTA, textTransform: "uppercase", letterSpacing: "0.12em" }}>{monitor.team}</p>
                  <h4 style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 800, color: ENJ_NAVY }}>{monitor.name}</h4>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext style={nextButtonStyle} />
      </Carousel>
    </div>
  );
}
