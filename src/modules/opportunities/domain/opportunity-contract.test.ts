import { describe, expect, it } from "vitest";
import {
  matchOpportunity,
  opportunityAdminInputSchema,
  rankOpportunityMatches,
  validateOpportunitySafety,
  type OpportunityCatalogItem,
  type OpportunityMatchContext,
} from "./opportunity-contract";

function opportunity(
  overrides: Partial<OpportunityCatalogItem> = {},
): OpportunityCatalogItem {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Youth Community Innovation Challenge",
    providerName: "Example Foundation",
    category: "challenge",
    summary:
      "Build and present a small solution to a practical community problem with evidence of what changed.",
    eligibilitySummary:
      "Open to young people in Nigeria who can complete the challenge before the published deadline.",
    benefitSummary: "Finalists receive mentorship and a project support award.",
    minAge: 16,
    maxAge: 24,
    geographyScope: "country",
    countryCodes: ["NG"],
    geographyLabel: "Nigeria",
    deliveryMode: "hybrid",
    pathwayTags: ["community", "design"],
    capabilityTags: ["project execution", "communication"],
    deadlineDate: "2026-10-30",
    isActive: true,
    state: {
      savedAt: null,
      appliedAt: null,
      outcome: null,
      outcomeAt: null,
    },
    ...overrides,
  };
}

function context(
  overrides: Partial<OpportunityMatchContext> = {},
): OpportunityMatchContext {
  return {
    ageBand: "18_24",
    isMinor: false,
    countryCode: "NG",
    selectedPathName: "Community design and problem solving",
    selectedPathSkills: ["research", "design", "communication"],
    capabilities: [
      { label: "Project execution", level: "demonstrated" },
      { label: "Collaboration", level: "practicing" },
    ],
    ...overrides,
  };
}

describe("Stage 18 Opportunity matching", () => {
  it("returns a strong transparent match when eligibility and evidence overlap", () => {
    const match = matchOpportunity(context(), opportunity());
    expect(match?.tier).toBe("strong_match");
    expect(match?.matchedPathwayTags).toContain("design");
    expect(match?.matchedCapabilityTags).toContain("project execution");
    expect(match?.reasons.join(" ")).toMatch(/selected path/i);
  });

  it("does not recommend an inactive opportunity kept only for outcome tracking", () => {
    expect(
      matchOpportunity(context(), opportunity({ isActive: false })),
    ).toBeNull();
  });

  it("does not surface a definite country mismatch", () => {
    expect(
      matchOpportunity(context({ countryCode: "GH" }), opportunity()),
    ).toBeNull();
  });

  it("marks missing geography as an eligibility check instead of guessing", () => {
    const match = matchOpportunity(
      context({ countryCode: null }),
      opportunity(),
    );
    expect(match?.tier).toBe("eligibility_check");
    expect(match?.readinessGaps.join(" ")).toMatch(/location eligibility/i);
  });

  it("marks an overlapping age band as a check instead of inventing exact age", () => {
    const match = matchOpportunity(
      context({ ageBand: "16_17", isMinor: true }),
      opportunity({ minAge: 17, maxAge: 24 }),
    );
    expect(match?.tier).toBe("eligibility_check");
    expect(match?.readinessGaps.join(" ")).toMatch(/exact age/i);
  });

  it("filters a definite minor age conflict", () => {
    expect(
      matchOpportunity(
        context({ ageBand: "16_17", isMinor: true }),
        opportunity({ minAge: 18, maxAge: 24 }),
      ),
    ).toBeNull();
  });

  it("orders strong matches before possible matches and eligibility checks", () => {
    const strong = matchOpportunity(context(), opportunity())!;
    const possible = matchOpportunity(
      context({
        selectedPathName: null,
        selectedPathSkills: [],
        capabilities: [],
      }),
      opportunity({ pathwayTags: [], capabilityTags: [] }),
    )!;
    const check = matchOpportunity(
      context({ countryCode: null }),
      opportunity({ id: "22222222-2222-4222-8222-222222222222" }),
    )!;
    expect(
      rankOpportunityMatches([check, possible, strong]).map(
        (item) => item.tier,
      ),
    ).toEqual(["strong_match", "possible_match", "eligibility_check"]);
  });
});

describe("Stage 18 Opportunity supply contract", () => {
  it("accepts a reviewed-supply candidate with explicit global geography", () => {
    const parsed = opportunityAdminInputSchema.safeParse({
      id: null,
      title: "Global Builder Challenge",
      providerName: "Example Foundation",
      category: "competition",
      summary:
        "A practical global competition where young builders submit evidence of a useful project.",
      eligibilitySummary: "Open globally to applicants aged 16 to 24.",
      benefitSummary: "Finalists receive mentorship and project support.",
      minAge: 16,
      maxAge: 24,
      geographyScope: "global",
      countryCodes: [],
      geographyLabel: "Global",
      deliveryMode: "remote",
      pathwayTags: ["design"],
      capabilityTags: ["project execution"],
      officialUrl: "https://example.org/global-builder",
      deadlineDate: "2026-12-01",
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && validateOpportunitySafety(parsed.data)).toBe(true);
  });

  it("rejects non-HTTPS links and country scopes without country codes", () => {
    const parsed = opportunityAdminInputSchema.safeParse({
      id: null,
      title: "Local Challenge",
      providerName: "Example Foundation",
      category: "challenge",
      summary:
        "A practical challenge for young people to build a useful local project and document results.",
      eligibilitySummary: "Open to eligible applicants in the listed country.",
      benefitSummary: "Participants receive feedback and project support.",
      minAge: null,
      maxAge: null,
      geographyScope: "country",
      countryCodes: [],
      geographyLabel: "Nigeria",
      deliveryMode: "hybrid",
      pathwayTags: [],
      capabilityTags: [],
      officialUrl: "http://example.org/local",
      deadlineDate: null,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects get-rich, gambling and speculative finance opportunity copy", () => {
    const parsed = opportunityAdminInputSchema.parse({
      id: null,
      title: "Global Trading Challenge",
      providerName: "Example Foundation",
      category: "competition",
      summary:
        "Join this crypto trading challenge and learn a speculative approach that promises quick money for winners.",
      eligibilitySummary:
        "Open globally to adults who meet the published rules.",
      benefitSummary:
        "Participants receive educational resources and recognition.",
      minAge: 18,
      maxAge: null,
      geographyScope: "global",
      countryCodes: [],
      geographyLabel: "Global",
      deliveryMode: "remote",
      pathwayTags: [],
      capabilityTags: [],
      officialUrl: "https://example.org/trading",
      deadlineDate: null,
    });
    expect(validateOpportunitySafety(parsed)).toBe(false);
  });
});
