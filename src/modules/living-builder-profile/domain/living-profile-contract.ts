export const builderCapabilityLevels = [
  "practicing",
  "demonstrated",
  "repeatedly_demonstrated",
] as const;

export type BuilderCapabilityLevel = (typeof builderCapabilityLevels)[number];

export const builderCapabilityFeedbackTypes = [
  "accurate",
  "needs_context",
  "not_representative",
] as const;

export type BuilderCapabilityFeedbackType =
  (typeof builderCapabilityFeedbackTypes)[number];

export type BuilderCapabilityEvidenceSource =
  | "quest"
  | "project"
  | "collaboration";
export type BuilderCapabilityVerification =
  | "pipupath_action"
  | "mutual_collaboration";

export function deriveCapabilityLevel(
  totalStrength: number,
  evidenceCount: number,
): BuilderCapabilityLevel {
  if (totalStrength >= 4 && evidenceCount >= 2) {
    return "repeatedly_demonstrated";
  }
  if (totalStrength >= 2) return "demonstrated";
  return "practicing";
}

export function capabilityLevelLabel(level: BuilderCapabilityLevel) {
  if (level === "repeatedly_demonstrated") return "Repeatedly demonstrated";
  if (level === "demonstrated") return "Demonstrated";
  return "Practicing";
}

export function capabilityVerificationLabel(
  verification: BuilderCapabilityVerification,
) {
  return verification === "mutual_collaboration"
    ? "Mutual collaboration evidence"
    : "PipuPath action evidence";
}
