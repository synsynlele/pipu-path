import { describe, expect, it } from "vitest";
import { interpretationInputSchema } from "./contracts";
import { validateHumanPotentialProfileOutput } from "./profile-contract";

const evidenceId = "11111111-1111-4111-8111-111111111111";
const input = interpretationInputSchema.parse({
  requestId: "22222222-2222-4222-8222-222222222222",
  schemaVersion: "hpi-profile-v1",
  promptVersion: "hpi-gemini-v1",
  questionSetVersion: 1,
  ageBand: "18_24",
  isMinor: false,
  safeguardingReviewRequired: false,
  prohibitedInferenceCategories: ["diagnosis"],
  evidence: [
    {
      id: evidenceId,
      sourceId: "33333333-3333-4333-8333-333333333333",
      sourceVersion: 1,
      sourceKey: "discovery_interest",
      category: "interest",
      responseType: "reflection",
      value: "I enjoy helping people learn.",
      sensitivity: "standard",
      contentHash: "a".repeat(64),
    },
  ],
});

function insight(
  profileSection:
    | "emerging_strengths"
    | "what_draws_you"
    | "problems_you_care_about"
    | "how_you_can_contribute"
    | "current_constraints"
    | "best_next_direction",
  key: string,
) {
  return {
    profileSection,
    insightType:
      profileSection === "emerging_strengths"
        ? ("strength_pattern" as const)
        : profileSection === "what_draws_you"
          ? ("interest_pattern" as const)
          : profileSection === "problems_you_care_about"
            ? ("problem_orientation" as const)
            : profileSection === "how_you_can_contribute"
              ? ("contribution_orientation" as const)
              : profileSection === "current_constraints"
                ? ("constraint" as const)
                : ("readiness_pattern" as const),
    insightKey: key,
    title: "A possible pattern",
    summary: "Based on your answers, this may be worth exploring.",
    explanation:
      "Your supplied Discovery evidence appears to support this possibility.",
    confidenceLevel: "emerging" as const,
    confidenceScore: 0.55,
    confidenceFactors: ["One relevant Discovery response"],
    evidence: [
      {
        evidenceId,
        supportType: "supporting" as const,
        explanation: "This answer directly relates to the provisional insight.",
        weight: 0.7,
      },
    ],
    uncertainties: [
      {
        type: "insufficient_examples" as const,
        description: "More real-world examples would improve confidence.",
      },
    ],
    confirmationQuestion: "Does this feel accurate to you?",
    sensitivity: "standard" as const,
    ageAppropriate: true,
  };
}

const validOutput = {
  schemaVersion: "hpi-profile-v1" as const,
  summary:
    "Based on your answers, several early patterns may be worth testing.",
  insights: [
    insight("emerging_strengths", "strength_one"),
    insight("emerging_strengths", "strength_two"),
    insight("what_draws_you", "draws_one"),
    insight("problems_you_care_about", "problem_one"),
    insight("how_you_can_contribute", "contribution_one"),
    insight("current_constraints", "constraint_one"),
    insight("best_next_direction", "direction_one"),
  ],
};

describe("Human Potential Profile output validation", () => {
  it("accepts all six evidence-linked sections", () => {
    expect(validateHumanPotentialProfileOutput(input, validOutput).ok).toBe(
      true,
    );
  });

  it("rejects invalid JSON-shaped provider output", () => {
    expect(validateHumanPotentialProfileOutput(input, "{not-json").ok).toBe(
      false,
    );
  });

  it("rejects a profile with a missing required section", () => {
    const missing = {
      ...validOutput,
      insights: validOutput.insights.filter(
        (item) => item.profileSection !== "best_next_direction",
      ),
    };
    expect(validateHumanPotentialProfileOutput(input, missing).ok).toBe(false);
  });

  it("rejects fixed-purpose language", () => {
    const unsafe = {
      ...validOutput,
      summary: "Your purpose is to teach.",
    };
    expect(validateHumanPotentialProfileOutput(input, unsafe).ok).toBe(false);
  });
});
