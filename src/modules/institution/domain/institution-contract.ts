import { z } from "zod";

const optionalNote = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, "That note is too long.")
    .refine((value) => value.length === 0 || value.length >= 3, {
      message: "Add a little more context or leave the note blank.",
    });

const username = z
  .string()
  .trim()
  .min(2, "Enter a PipuPath username.")
  .max(60, "That username is too long.");

export const institutionVerificationRequestSchema = z.object({
  claimId: z.uuid(),
  evidenceId: z.uuid(),
  requestNote: optionalNote(400),
});

export const institutionVerificationResponseSchema = z.object({
  verificationId: z.uuid(),
  workspaceId: z.uuid(),
  action: z.enum(["confirm", "decline"]),
  responseNote: optionalNote(600),
});

export const institutionVerificationCloseSchema = z.object({
  verificationId: z.uuid(),
  workspaceId: z.uuid().optional(),
  action: z.enum(["withdraw", "revoke"]),
});

export const institutionProvisionSchema = z.object({
  cohortId: z.uuid(),
  ownerUsername: username,
});

export const institutionMemberSchema = z.object({
  workspaceId: z.uuid(),
  targetUsername: username,
  role: z.enum(["owner", "verifier", "analyst"]),
  action: z.enum(["activate", "revoke"]),
});

export const institutionWorkspaceRevokeSchema = z.object({
  workspaceId: z.uuid(),
});

export type InstitutionRole = "owner" | "verifier" | "analyst";
export type InstitutionVerificationStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "withdrawn"
  | "revoked";

export function institutionRoleLabel(role: InstitutionRole) {
  return { owner: "Owner", verifier: "Verifier", analyst: "Analyst" }[role];
}

export function institutionVerificationStatusLabel(
  status: InstitutionVerificationStatus,
) {
  return {
    pending: "Awaiting institution",
    confirmed: "Institution confirmed",
    declined: "Not confirmed",
    withdrawn: "Request withdrawn",
    revoked: "Verification revoked",
  }[status];
}

export const institutionTrustCopy = {
  verification: "Institution confirmed",
  aggregate:
    "Cohort intelligence is aggregate-only and never opens a learner browser.",
  share:
    "Your institution sees this capability only because you explicitly shared this exact evidence for verification.",
} as const;
