"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type FeatureKey =
  | "home"
  | "profile"
  | "journey"
  | "build"
  | "portfolio"
  | "connect";

function featureForPath(pathname: string): FeatureKey | null {
  if (pathname === "/app") return "home";
  if (pathname.startsWith("/onboarding/discovery/profile")) return "profile";
  if (pathname.startsWith("/mission") || pathname.startsWith("/journey"))
    return "journey";
  if (
    pathname.startsWith("/build") ||
    pathname.startsWith("/quests") ||
    pathname.startsWith("/projects")
  )
    return "build";
  if (pathname.startsWith("/portfolio")) return "portfolio";
  if (pathname.startsWith("/connect")) return "connect";
  return null;
}

export function ProductTelemetry() {
  const pathname = usePathname();

  useEffect(() => {
    const featureKey = featureForPath(pathname);
    if (!featureKey) return;

    const storageKey = `pipupath:feature-view:${pathname}`;
    const now = Date.now();
    const previous = Number(sessionStorage.getItem(storageKey) ?? "0");
    if (Number.isFinite(previous) && now - previous < 60_000) return;
    sessionStorage.setItem(storageKey, String(now));

    void fetch("/api/product-events/feature-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ featureKey }),
      keepalive: true,
    }).catch(() => {
      sessionStorage.removeItem(storageKey);
    });
  }, [pathname]);

  return null;
}
