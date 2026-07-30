import { describe, expect, it } from "vitest";
import {
  validateInterpretationOutput,
  type HpiDomainErrorCode,
} from "./contracts";

const input = {
  requestId: "00000000-0000-4000-8000-000000000001",
  schemaVersion: "hpi-input-v1",
  promptVersion: "placeholder-v1",
  questionSetVersion: 1,
  ageBand: "16_17" as const,
  isMinor: true,
  safeguardingReviewRequired: false,
  prohibitedInferenceCategories: [
    "diagnosis",
    "career_assignment",
    "purpose_claim",
  ],
  evidence: [
    {
      id: "00000000-0000-4000-8000-000000000002",
      sourceId: "00000000-0000-4000-8000-000000000003",
      sourceVersion: 1,
      sourceKey: "activities_enjoyed",
      category: "interest" as const,
      responseType: "single_select" as const,
      value: "Making or designing",
      sensitivity: "standard" as const,
      contentHash: "a".repeat(64),
    },
  ],
};

function output(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: "hpi-output-v1",
    insights: [
      {
        insightType: "interest_pattern",
        insightKey: "making_interest",
        title: "Interest in making",
        summary: "You described returning to making or designing.",
        explanation: "This is a tentative pattern based on one response.",
        confidenceLevel: "low",
        confidenceScore: 0.2,
        confidenceFactors: ["one response", "single category"],
        evidence: [
          {
            evidenceId: input.evidence[0].id,
            supportType: "supporting",
            explanation: "The response names making or designing.",
            weight: 0.5,
          },
        ],
        uncertainties: [
          {
            type: "insufficient_examples",
            description: "Only one example is available.",
          },
        ],
        confirmationQuestion: "Does this still feel accurate to you?",
        sensitivity: "standard",
        ageAppropriate: true,
        ...overrides,
      },
    ],
  };
}

describe("Stage 4.1 interpretation contracts", () => {
  it("accepts evidence-backed, tentative output", () => {
    expect(validateInterpretationOutput(input, output()).ok).toBe(true);
  });

  it.each([
    [
      "unknown evidence",
      output({
        evidence: [
          {
            evidenceId: "00000000-0000-4000-8000-000000000099",
            supportType: "supporting",
            explanation: "Unknown",
            weight: 0.5,
          },
        ],
      }),
      "HPI_OUTPUT_UNKNOWN_EVIDENCE",
    ],
    ["missing provenance", output({ evidence: [] }), "HPI_OUTPUT_MISSING_PROVENANCE"],
    [
      "deterministic purpose",
      output({ summary: "This is definitely your purpose." }),
      "HPI_OUTPUT_INVALID",
    ],
    [
      "minor-unsafe guidance",
      output({
        summary: "Seek an unknown adult relationship.",
        ageAppropriate: false,
      }),
      "HPI_SAFEGUARDING_RESTRICTION",
    ],
  ])("rejects %s", (_name, candidate, code) => {
    const result = validateInterpretationOutput(input, candidate);
    expect(result).toEqual({ ok: false, code: code as HpiDomainErrorCode });
  });
});
