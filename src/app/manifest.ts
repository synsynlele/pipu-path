import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PipuPath — The University for Human Potential",
    short_name: "PipuPath",
    description:
      "Discover who you are, develop what you carry and deploy it through real-world action.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    orientation: "portrait-primary",
  };
}
