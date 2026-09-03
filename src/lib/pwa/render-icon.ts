import { PIPUPATH_LOGO_DATA_URI } from "@/components/brand/brand-assets";
import { ImageResponse } from "next/og";
import { createElement } from "react";

export function renderPwaIcon(size: number) {
  const logoSize = Math.round(size * 0.78);

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
          background: "#020817",
        },
      },
      createElement("img", {
        src: PIPUPATH_LOGO_DATA_URI,
        alt: "",
        width: logoSize,
        height: logoSize,
        style: {
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          objectFit: "contain",
        },
      }),
    ),
    { width: size, height: size },
  );
}
