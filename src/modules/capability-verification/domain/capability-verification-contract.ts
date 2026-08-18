import { z } from "zod";

const optionalNote = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, "That note is too long.")
    .refine((value) => value.length === 0 || value.length >= 3, {
      message: "Add a little more context or leave the note blank.",
    });

export const capabilityVerificationRequestSchema = z.object({
  claimId: z.uuid(),
  evidenceId: z.uuid(),
  requestNote: optionalNote(400),
});

export const capabilityVerificationResponseSchema = z.object({
  verificationId: z.uuid(),
  action: z.enum(["confirm", "decline"]),
  responseNote: optionalNote(600),
});

export const capabilityVerificationCloseSchema = z.object({
  verificationId: z.uuid(),
  action: z.enum(["withdraw", "revoke"]),
});

export type CapabilityVerificationStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "withdrawn"
  | "revoked";

export function capabilityVerificationStatusLabel(
  status: CapabilityVerificationStatus,
) {
  return {
    pending: "Awaiting collaborator",
    confirmed: "Collaborator confirmed",
    declined: "Not confirmed",
    withdrawn: "Request withdrawn",
    revoked: "Verification revoked",
  }[status];
}

export const capabilityVerificationTrustCopy = {
  systemEvidence: "PipuPath action evidence",
  humanConfirmation: "Collaborator confirmed",
  boundary:
    "A collaborator can confirm only a capability tied to the exact completed collaboration you shared together.",
} as const;
