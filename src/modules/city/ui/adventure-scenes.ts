/** Cinematic photography is decorative; game outcomes and XP remain server-owned.
 * Optimised WebP crops from Unsplash (https://unsplash.com/license).
 * Keep the gradient fallback when images cannot load on slower connections.
 */
export const adventureScenes = {
  city: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?fit=crop&crop=entropy&w=1200&h=740&q=70&fm=webp",
  garden:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?fit=crop&crop=entropy&w=1200&h=740&q=70&fm=webp",
  gardenDetail:
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?fit=crop&crop=entropy&w=640&h=420&q=65&fm=webp",
  river:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?fit=crop&crop=entropy&w=960&h=600&q=65&fm=webp",
} as const;

export const gardenChoiceArt: Record<
  string,
  {
    symbol: "seed" | "path" | "water" | "invite" | "bench" | "sun";
    accent: string;
    image: string;
  }
> = {
  seeds: {
    symbol: "seed",
    accent: "#7acda1",
    image: adventureScenes.gardenDetail,
  },
  paths: { symbol: "path", accent: "#f2c781", image: adventureScenes.garden },
  water: {
    symbol: "water",
    accent: "#8bd9f4",
    image: adventureScenes.gardenDetail,
  },
  signs: { symbol: "invite", accent: "#f0bb86", image: adventureScenes.city },
  benches: {
    symbol: "bench",
    accent: "#dfbcb0",
    image: adventureScenes.garden,
  },
  lights: { symbol: "sun", accent: "#f4d177", image: adventureScenes.city },
};
