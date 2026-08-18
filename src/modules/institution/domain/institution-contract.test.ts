import { describe, expect, it } from "vitest";
import {
  institutionMemberSchema,
  institutionProvisionSchema,
  institutionRoleLabel,
  institutionVerificationRequestSchema,
  institutionVerificationResponseSchema,
  institutionVerificationStatusLabel,
} from "./institution-contract";

const id = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";

describe("institution contract", () => {
  it("requires an exact claim and evidence pair for Builder verification", () => {
    expect(
      institutionVerificationRequestSchema.safeParse({
        claimId: id,
        evidenceId: otherId,
        requestNote: "Please verify what you observed from this work.",
      }).success,
    ).toBe(true);
  });

  it("limits institution decisions to confirm or decline", () => {
    expect(
      institutionVerificationResponseSchema.safeParse({
        verificationId: id,
        workspaceId: otherId,
        action: "confirm",
        responseNote: "Observed by the institution during the programme.",
      }).success,
    ).toBe(true);
    expect(
      institutionVerificationResponseSchema.safeParse({
        verificationId: id,
        workspaceId: otherId,
        action: "score",
        responseNote: "",
      }).success,
    ).toBe(false);
  });

  it("keeps administration to explicit roles", () => {
    expect(
      institutionMemberSchema.safeParse({
        workspaceId: id,
        targetUsername: "institution_operator",
        role: "analyst",
        action: "activate",
      }).success,
    ).toBe(true);
    expect(institutionRoleLabel("verifier")).toBe("Verifier");
  });

  it("accepts controlled workspace provisioning", () => {
    expect(
      institutionProvisionSchema.safeParse({
        cohortId: id,
        ownerUsername: "school_owner",
      }).success,
    ).toBe(true);
  });

  it("uses truthful institution confirmation language", () => {
    expect(institutionVerificationStatusLabel("confirmed")).toBe(
      "Institution confirmed",
    );
  });
});
