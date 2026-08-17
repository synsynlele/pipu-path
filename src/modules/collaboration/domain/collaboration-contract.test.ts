import { describe, expect, it } from "vitest";
import {
  collaborationCloseSchema,
  collaborationCompletionSchema,
  collaborationContributionSchema,
  collaborationInvitationSchema,
  collaborationResponseSchema,
  collaborationStatusLabel,
} from "./collaboration-contract";

const id = "123e4567-e89b-42d3-a456-426614174000";
const otherId = "123e4567-e89b-42d3-a456-426614174001";

describe("Stage 15 collaboration contract", () => {
  it("accepts a bounded structured invitation", () => {
    const parsed = collaborationInvitationSchema.parse({
      projectId: id,
      collaboratorId: otherId,
      objective: "Test a useful prototype with three intended users.",
      roleNeeded: "Research partner",
      expectedContribution: "Interview users and summarise the strongest patterns.",
      ownerContribution: "Prepare the prototype and organise the test sessions.",
      commitmentNote: "Two short working sessions across one week.",
    });
    expect(parsed.roleNeeded).toBe("Research partner");
  });

  it("rejects vague collaboration invitations", () => {
    expect(
      collaborationInvitationSchema.safeParse({
        projectId: id,
        collaboratorId: otherId,
        objective: "Help me",
        roleNeeded: "x",
        expectedContribution: "Do stuff",
        ownerContribution: "I help",
        commitmentNote: "soon",
      }).success,
    ).toBe(false);
  });

  it("keeps response and closure actions explicit", () => {
    expect(
      collaborationResponseSchema.parse({ collaborationId: id, action: "accept" })
        .action,
    ).toBe("accept");
    expect(
      collaborationCloseSchema.parse({ collaborationId: id, action: "cancel" })
        .action,
    ).toBe("cancel");
    expect(
      collaborationCompletionSchema.parse({ collaborationId: id }).collaborationId,
    ).toBe(id);
  });

  it("requires structured contribution evidence", () => {
    const parsed = collaborationContributionSchema.parse({
      collaborationId: id,
      contributionSummary: "I interviewed three users and grouped their recurring needs.",
      evidenceNote: "Notes from all three interviews are recorded in the shared evidence link.",
      evidenceLink: "https://example.com/proof",
      nextStep: "Use the strongest pattern to revise the prototype.",
    });
    expect(parsed.evidenceLink).toContain("https://");
    expect(
      collaborationContributionSchema.safeParse({
        collaborationId: id,
        contributionSummary: "done",
        evidenceNote: "yes",
        evidenceLink: "javascript:bad",
        nextStep: "later",
      }).success,
    ).toBe(false);
  });

  it("uses evidence-oriented status language", () => {
    expect(collaborationStatusLabel("accepted")).toBe("Building together");
    expect(collaborationStatusLabel("completed")).toBe("Completed");
  });
});
