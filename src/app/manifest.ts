import type { MetadataRoute } from "next";

import { PIPUPATH_LOGO_DATA_URI } from "@/components/brand/brand-assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PipuPath — The University for Human Potential",
    short_name: "PipuPath",
    description:
      "Discover who you are, develop what you carry and deploy it through real-world action.",
    start_url: "/",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#020817",
    orientation: "portrait-primary",
    icons: [
      {
        src: PIPUPATH_LOGO_DATA_URI,
        sizes: "96x96",
        type: "image/webp",
        purpose: "any",
      },
    ],
  };
}
