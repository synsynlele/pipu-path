import { describe, expect, it } from "vitest";
import { interpretationInputSchema } from "../domain/contracts";
import { validateHumanPotentialProfileOutput } from "../domain/profile-contract";
import { buildEvidenceBasedFallbackProfile } from "./evidence-profile-fallback";

const categories = [
  "capability",
  "value",
  "interest",
  "current_reality",
  "experience",
  "constraint",
  "readiness",
] as const;

describe("evidence-based profile fallback", () => {
  it("always satisfies the complete Human Potential Profile contract", () => {
    const input = interpretationInputSchema.parse({
      requestId: "30000000-0000-4000-8000-000000000001",
      schemaVersion: "hpi-profile-v1",
      promptVersion: "hpi-gemini-v1",
      questionSetVersion: 1,
      ageBand: "25_plus",
      isMinor: false,
      safeguardingReviewRequired: false,
      prohibitedInferenceCategories: ["diagnosis"],
      evidence: categories.map((category, index) => ({
        id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        sourceId: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        sourceVersion: 1,
        sourceKey: `discovery_evidence_${index + 1}`,
        category,
        responseType: "reflection" as const,
        value: category === "constraint" ? null : `Evidence ${index + 1}`,
        sensitivity:
          category === "constraint"
            ? ("sensitive" as const)
            : ("standard" as const),
        contentHash: String(index + 1).repeat(64),
      })),
    });

    const output = buildEvidenceBasedFallbackProfile(input);
    const result = validateHumanPotentialProfileOutput(input, output);

    expect(result).toEqual({ ok: true, value: output });
    expect(output.insights).toHaveLength(7);
    expect(
      output.insights.filter(
        (insight) => insight.profileSection === "emerging_strengths",
      ),
    ).toHaveLength(2);
    expect(
      new Set(output.insights.map((insight) => insight.profileSection)),
    ).toEqual(
      new Set([
        "emerging_strengths",
        "what_draws_you",
        "problems_you_care_about",
        "how_you_can_contribute",
        "current_constraints",
        "best_next_direction",
      ]),
    );
  });
});
