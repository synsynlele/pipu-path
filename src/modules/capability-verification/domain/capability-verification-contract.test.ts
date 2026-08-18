import { describe, expect, it } from "vitest";
import {
  capabilityVerificationCloseSchema,
  capabilityVerificationRequestSchema,
  capabilityVerificationResponseSchema,
  capabilityVerificationStatusLabel,
} from "./capability-verification-contract";

const id = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";

describe("capability verification contract", () => {
  it("accepts an evidence-bound verification request", () => {
    expect(
      capabilityVerificationRequestSchema.safeParse({
        claimId: id,
        evidenceId: otherId,
        requestNote: "You worked with me on this project.",
      }).success,
    ).toBe(true);
  });

  it("rejects notes that are neither empty nor meaningful", () => {
    expect(
      capabilityVerificationRequestSchema.safeParse({
        claimId: id,
        evidenceId: otherId,
        requestNote: "x",
      }).success,
    ).toBe(false);
  });

  it("limits verifier decisions to confirm or decline", () => {
    expect(
      capabilityVerificationResponseSchema.safeParse({
        verificationId: id,
        action: "confirm",
        responseNote: "I observed this during our completed collaboration.",
      }).success,
    ).toBe(true);
    expect(
      capabilityVerificationResponseSchema.safeParse({
        verificationId: id,
        action: "rate",
        responseNote: "",
      }).success,
    ).toBe(false);
  });

  it("supports lifecycle withdrawal and revocation without deletion", () => {
    expect(
      capabilityVerificationCloseSchema.safeParse({
        verificationId: id,
        action: "withdraw",
      }).success,
    ).toBe(true);
    expect(capabilityVerificationStatusLabel("confirmed")).toBe(
      "Collaborator confirmed",
    );
  });
});
