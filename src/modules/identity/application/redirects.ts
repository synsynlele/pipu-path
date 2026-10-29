const allowedExactPaths = new Set([
  "/account-deletion",
  "/account-privacy",
  "/app",
  "/real-quests",
  "/build",
  "/build/adventures",
  "/build/play/neighbourhood-garden-v1",
  "/build/play",
  "/build/neighbourhood",
  "/onboarding/identity",
  "/onboarding/guardian",
  "/guardian",
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
  if (
    safeRequestedPath === "/reset-password" ||
    safeRequestedPath === "/account-deletion" ||
    safeRequestedPath === "/account-privacy"
  )
    return safeRequestedPath;
  if (
    safeRequestedPath === "/guardian" &&
    requiredPath !== "/onboarding/identity"
  )
    return "/guardian";
  // Read-only play and the action hub can explain the next prerequisite.
  // Identity and guardian checks remain mandatory, as do all actual Quest gates.
  const readOnlyEntry = [
    "/app",
    "/real-quests",
    "/build/play",
    "/build/adventures",
  ].includes(new URL(safeRequestedPath, "https://pipupath.local").pathname);
  if (
    readOnlyEntry &&
    !["/onboarding/identity", "/onboarding/guardian"].includes(requiredPath)
  )
    return safeRequestedPath;
  if (requiredPath !== "/app") return requiredPath;
  return safeRequestedPath;
}
