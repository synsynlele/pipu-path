const allowedExactPaths = new Set([
  "/app",
  "/build",
  "/onboarding/identity",
  "/onboarding/discovery",
  "/onboarding/discovery/review",
  "/onboarding/discovery/profile",
  "/mission",
  "/journey",
  "/quests",
  "/projects",
  "/portfolio",
  "/reset-password",
]);

const allowedPrefixes = [
  "/onboarding/discovery/",
  "/mission/",
  "/journey/",
  "/quests/",
  "/projects/",
  "/portfolio/",
] as const;

export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  if (value.includes("\\") || /[\u0000-\u001f]/.test(value)) return "/app";

  try {
    const parsed = new URL(value, "https://pipupath.local");
    if (parsed.origin !== "https://pipupath.local") return "/app";
    const allowed =
      allowedExactPaths.has(parsed.pathname) ||
      allowedPrefixes.some((prefix) => parsed.pathname.startsWith(prefix));
    return allowed ? `${parsed.pathname}${parsed.search}` : "/app";
  } catch {
    return "/app";
  }
}

export function postAuthDestination(
  requiredPath: string,
  requestedPath: string | null | undefined,
) {
  const safeRequestedPath = safeNextPath(requestedPath);
  if (safeRequestedPath === "/reset-password") return safeRequestedPath;
  if (requiredPath !== "/app") return requiredPath;
  return safeRequestedPath;
}
