const allowedDestinations = new Set([
  "/app",
  "/onboarding/identity",
  "/reset-password",
]);

export function safeNextPath(value: string | null | undefined): string {
  return value && allowedDestinations.has(value) ? value : "/app";
}
