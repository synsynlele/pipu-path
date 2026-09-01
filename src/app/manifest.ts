import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/pipupath",
    name: "PipuPath",
    short_name: "PipuPath",
    description:
      "Discover, develop and deploy your potential through real-world action.",
    start_url: "/continue",
    scope: "/",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#07142f",
    orientation: "portrait-primary",
    categories: ["education", "productivity", "lifestyle"],
    icons: [
      {
        src: "/pwa/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Home",
        short_name: "Home",
        url: "/app",
      },
      {
        name: "Discover",
        short_name: "Discover",
        url: "/discover",
      },
      {
        name: "Build",
        short_name: "Build",
        url: "/build",
      },
      {
        name: "Connect",
        short_name: "Connect",
        url: "/connect",
      },
      {
        name: "Profile",
        short_name: "Profile",
        url: "/profile",
      },
    ],
  };
}
