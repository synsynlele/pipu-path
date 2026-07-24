export const ageBands = [
  "under_13",
  "13_15",
  "16_17",
  "18_24",
  "25_plus",
] as const;

export type AgeBand = (typeof ageBands)[number];

export function isMinor(ageBand: AgeBand): boolean {
  return ["under_13", "13_15", "16_17"].includes(ageBand);
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  return /^[a-z][a-z0-9_]{2,29}$/.test(normalizeUsername(value));
}

export type IdentityState = {
  hasSession: boolean;
  hasProfile: boolean;
  checkpointCompleted: boolean;
};

export type IdentityDestination = "/login" | "/onboarding/identity" | "/app";

export function identityDestination(state: IdentityState): IdentityDestination {
  if (!state.hasSession) return "/login";
  if (!state.hasProfile || !state.checkpointCompleted)
    return "/onboarding/identity";
  return "/app";
}
