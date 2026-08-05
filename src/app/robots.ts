import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      disallow: [
        "/app",
        "/auth",
        "/build",
        "/continue",
        "/forgot-password",
        "/journey",
        "/login",
        "/mission",
        "/onboarding",
        "/portfolio",
        "/projects",
        "/quests",
        "/reset-password",
        "/signup",
      ],
    },
  };
}
