import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/pipupath",
    name: "PipuPath",
    short_name: "PipuPath",
    description:
      "Discover, develop and deploy your potential through real-world action.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#07142f",
    orientation: "portrait-primary",
    categories: ["education", "productivity", "lifestyle"],
    related_applications: [
      {
        platform: "play",
        url: "https://play.google.com/store/apps/details?id=ng.name.pipupath.lite",
        id: "ng.name.pipupath.lite",
      },
    ],
    icons: [
      {
        src: "/brand/pipupath-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/pipupath-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/pipupath-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/pipupath-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Play", short_name: "Play", url: "/play" },
      { name: "Real Quests", short_name: "Quests", url: "/real-quests" },
      { name: "You", short_name: "You", url: "/profile" },
    ],
  };
}
