import { ImageResponse } from "next/og";
import { createElement } from "react";

export function renderPwaIcon(size: number) {
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #061027 0%, #312e81 52%, #4f7cff 100%)",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        },
      },
      createElement(
        "div",
        {
          style: {
            width: "70%",
            height: "70%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "28%",
            border: `${Math.max(3, Math.round(size * 0.018))}px solid rgba(255,255,255,0.28)`,
            background: "rgba(255,255,255,0.08)",
            boxShadow: "0 24px 80px rgba(2,8,23,0.34)",
            fontSize: `${Math.round(size * 0.42)}px`,
            fontWeight: 800,
            letterSpacing: "-0.08em",
          },
        },
        "P",
      ),
    ),
    { width: size, height: size },
  );
}
