import { describe, expect, it } from "vitest";
import {
  canBuilderTransitionApplication,
  canProviderTransitionApplication,
  canTransitionOpportunityApplication,
  canTransitionOpportunityProvider,
  evaluateMarketplaceApplicationEligibility,
  marketplaceApplicationPacketSchema,
  validateMarketplacePacketSelections,
} from "./marketplace-contract";

const basePacket = marketplaceApplicationPacketSchema.parse({
  displayName: "Stage Builder",
  builderSummary: "I build evidence-backed systems that improve practical learning outcomes.",
  selectedPathName: "Education technology builder",
  applicationNote: "I want to test my capability in a larger real-world environment.",
  capabilities: [
    {
      claimId: "11111111-1111-4111-8111-111111111111",
      capabilityKey: "systems_thinking",
      capabilityLabel: "Systems thinking",
      capabilityLevel: "demonstrated",
    },
  ],
  evidence: [
    {
      evidenceId: "22222222-2222-4222-8222-222222222222",
      claimId: "11111111-1111-4111-8111-111111111111",
      sourceType: "project",
      sourceTitle: "School system prototype",
      evidenceSummary: "Built and tested a practical system prototype with documented implementation evidence.",
      sourceHref: "/projects/22222222-2222-4222-8222-222222222222",
    },
  ],
  institutionVerifications: [
    {
      verificationId: "33333333-3333-4333-8333-333333333333",
      capabilityKey: "systems_thinking",
      capabilityLabel: "Systems thinking",
      institutionName: "KAEC Nigerian Schools",
      confirmedAt: "2026-08-18T10:00:00+00:00",
    },
  ],
  portfolioProofs: [
    {
      portfolioId: "44444444-4444-4444-8444-444444444444",
      slug: "stage-builder-school-system",
      publicTitle: "School system prototype",
      publicSummary: "A public-safe proof of a completed school system prototype and its observed outcome.",
      proofHref: "/proof/stage-builder-school-system",
    },
  ],
});

describe("Stage 20 marketplace contracts", () => {
  it("keeps provider approval under an explicit irreversible lifecycle", () => {
    expect(canTransitionOpportunityProvider("pending", "approved")).toBe(true);
    expect(canTransitionOpportunityProvider("approved", "suspended")).toBe(true);
    expect(canTransitionOpportunityProvider("suspended", "approved")).toBe(true);
    expect(canTransitionOpportunityProvider("revoked", "approved")).toBe(false);
  });

  it("separates Builder and provider application transitions", () => {
    expect(canBuilderTransitionApplication("draft", "submitted")).toBe(true);
    expect(canBuilderTransitionApplication("submitted", "withdrawn")).toBe(true);
    expect(canBuilderTransitionApplication("submitted", "accepted")).toBe(false);

    expect(canProviderTransitionApplication("submitted", "viewed")).toBe(true);
    expect(canProviderTransitionApplication("viewed", "shortlisted")).toBe(true);
    expect(canProviderTransitionApplication("shortlisted", "accepted")).toBe(true);
    expect(canProviderTransitionApplication("draft", "accepted")).toBe(false);
    expect(canProviderTransitionApplication("accepted", "not_selected")).toBe(false);
  });

  it("prevents reopening terminal application outcomes", () => {
    expect(canTransitionOpportunityApplication("accepted", "submitted")).toBe(false);
    expect(canTransitionOpportunityApplication("not_selected", "shortlisted")).toBe(false);
    expect(canTransitionOpportunityApplication("withdrawn", "submitted")).toBe(false);
  });

  it("blocks minors, safeguarding holds, unapproved providers and inactive listings", () => {
    const result = evaluateMarketplaceApplicationEligibility({
      isMinor: true,
      safeguardingReviewRequired: true,
      providerStatus: "suspended",
      opportunityActive: false,
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons).toHaveLength(4);
  });

  it("allows an eligible adult only when provider and listing are active", () => {
    expect(
      evaluateMarketplaceApplicationEligibility({
        isMinor: false,
        safeguardingReviewRequired: false,
        providerStatus: "approved",
        opportunityActive: true,
      }),
    ).toEqual({ eligible: true, reasons: [] });
  });

  it("requires every selected evidence item to belong to a selected capability", () => {
    expect(validateMarketplacePacketSelections(basePacket)).toBe(true);

    const invalidPacket = {
      ...basePacket,
      evidence: [
        {
          ...basePacket.evidence[0],
          claimId: "55555555-5555-4555-8555-555555555555",
        },
      ],
    };

    expect(validateMarketplacePacketSelections(invalidPacket)).toBe(false);
  });

  it("rejects duplicate packet selections", () => {
    expect(
      validateMarketplacePacketSelections({
        ...basePacket,
        capabilities: [basePacket.capabilities[0], basePacket.capabilities[0]],
      }),
    ).toBe(false);
  });
});
