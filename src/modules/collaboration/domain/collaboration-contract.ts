import { z } from "zod";

const bounded = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} needs a little more detail.`)
    .max(maximum, `${label} is too long.`);

export const collaborationInvitationSchema = z.object({
  projectId: z.uuid(),
  collaboratorId: z.uuid(),
  objective: bounded("Collaboration objective", 20, 800),
  roleNeeded: bounded("Role needed", 3, 120),
  expectedContribution: bounded("Expected contribution", 20, 800),
  ownerContribution: bounded("Your contribution", 20, 800),
  commitmentNote: bounded("Commitment", 10, 400),
});

export const collaborationResponseSchema = z.object({
  collaborationId: z.uuid(),
  action: z.enum(["accept", "decline"]),
});

export const collaborationCloseSchema = z.object({
  collaborationId: z.uuid(),
  action: z.enum(["withdraw", "cancel"]),
});

export const collaborationContributionSchema = z.object({
  collaborationId: z.uuid(),
  contributionSummary: bounded("Contribution summary", 20, 1200),
  evidenceNote: bounded("Evidence note", 10, 1200),
  evidenceLink: z
    .string()
    .trim()
    .max(500, "The evidence link is too long.")
    .refine(
      (value) => value.length === 0 || /^https?:\/\//i.test(value),
      "Use a complete http or https link.",
    ),
  nextStep: bounded("Next step", 10, 600),
});

export const collaborationCompletionSchema = z.object({
  collaborationId: z.uuid(),
});

export type BuilderCollaborationStatus =
  "pending" | "accepted" | "declined" | "withdrawn" | "cancelled" | "completed";

export function collaborationStatusLabel(status: BuilderCollaborationStatus) {
  return {
    pending: "Invitation pending",
    accepted: "Building together",
    declined: "Declined",
    withdrawn: "Withdrawn",
    cancelled: "Closed",
    completed: "Completed",
  }[status];
}
