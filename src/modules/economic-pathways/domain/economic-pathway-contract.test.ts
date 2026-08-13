import { describe, expect, it } from "vitest";
import { buildEvidenceBasedEconomicPathways } from "../application/economic-pathway-fallback";
import {
  validateEconomicPathwayOutput,
  type EconomicPathwayContext,
} from "./economic-pathway-contract";

const ids = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
  "00000000-0000-4000-8000-000000000004",
  "00000000-0000-4000-8000-000000000005",
  "00000000-0000-4000-8000-000000000006",
  "00000000-0000-4000-8000-000000000007",
] as const;

function insight(id: string, title: string, summary: string) {
  return {
    id,
    title,
    summary,
    description: `${summary} This is a provisional pattern grounded in the user's completed Discovery evidence and should be tested through practical action.`,
  };
}

function context(isMinor = true): EconomicPathwayContext {
  return {
    profileId: "00000000-0000-4000-8000-000000000099",
    summary:
      "This profile suggests practical communication, curiosity, initiative and a preference for learning by creating useful things for other people.",
    ageBand: isMinor ? "16_17" : "25_plus",
    lifeStage: isMinor ? "secondary school" : "working adult",
    isMinor,
    safeguardingReviewRequired: false,
    sections: [
      {
        key: "emerging_strengths",
        insights: [
          insight(
            ids[0],
            "Explaining Ideas Clearly",
            "You repeatedly organise ideas so other people can understand and use them.",
          ),
          insight(
            ids[1],
            "Practical Initiative",
            "You tend to move from an idea toward a small action rather than staying only in discussion.",
          ),
        ],
      },
      {
        key: "what_draws_you",
        insights: [
          insight(
            ids[2],
            "Creative Communication",
            "You are drawn to communication, media and making information more engaging.",
          ),
        ],
      },
      {
        key: "problems_you_care_about",
        insights: [
          insight(
            ids[3],
            "Helping People Understand",
            "You notice when people lack clear information or practical guidance.",
          ),
        ],
      },
      {
        key: "how_you_can_contribute",
        insights: [
          insight(
            ids[4],
            "Make Useful Explanations",
            "You may contribute by turning complicated ideas into useful explanations, examples or media.",
          ),
        ],
      },
      {
        key: "current_constraints",
        insights: [
          insight(
            ids[5],
            "Limited Resources",
            "You need experiments that can begin with tools and relationships already available.",
          ),
        ],
      },
      {
        key: "best_next_direction",
        insights: [
          insight(
            ids[6],
            "Test Communication Through Service",
            "A useful next direction is to test communication by creating something another person can actually use.",
          ),
        ],
      },
    ],
  };
}

describe("Economic Pathways contract", () => {
  it("builds a valid evidence-grounded minor pathway fallback", () => {
    const userContext = context(true);
    const output = buildEvidenceBasedEconomicPathways(userContext);
    const validated = validateEconomicPathwayOutput(userContext, output);

    expect(validated.ok).toBe(true);
    expect(output.possiblePaths).toHaveLength(3);
    expect(output.earnFromStrengths).toHaveLength(3);
    expect(
      output.possiblePaths.every(
        (path) => path.profileEvidenceRefs.length >= 2,
      ),
    ).toBe(true);
    expect(JSON.stringify(output)).toContain("trusted adult");
  });

  it("allows adult value experiments without promising earnings", () => {
    const userContext = context(false);
    const output = buildEvidenceBasedEconomicPathways(userContext);
    const validated = validateEconomicPathwayOutput(userContext, output);

    expect(validated.ok).toBe(true);
    expect(JSON.stringify(output)).toContain("starter service");
    expect(JSON.stringify(output)).not.toMatch(
      /guaranteed income|quick money/i,
    );
  });

  it("rejects invented profile evidence", () => {
    const userContext = context();
    const output = buildEvidenceBasedEconomicPathways(userContext);
    output.possiblePaths[0].profileEvidenceRefs[0] =
      "00000000-0000-4000-8000-000000000999";

    expect(validateEconomicPathwayOutput(userContext, output)).toEqual({
      ok: false,
      code: "ECONOMIC_PATHWAYS_OUTPUT_INVALID",
    });
  });

  it("rejects guaranteed or risky money language", () => {
    const userContext = context(false);
    const output = buildEvidenceBasedEconomicPathways(userContext);
    output.possiblePaths[0].valueOrIncome[0] =
      "Guaranteed income from crypto trading after one quick course.";

    expect(validateEconomicPathwayOutput(userContext, output)).toEqual({
      ok: false,
      code: "ECONOMIC_PATHWAYS_OUTPUT_UNSAFE",
    });
  });

  it("rejects unsafe minor contact", () => {
    const userContext = context(true);
    const output = buildEvidenceBasedEconomicPathways(userContext);
    output.possiblePaths[0].howToTest =
      "Contact strangers and arrange an unsupervised client meeting to sell the first sample.";

    expect(validateEconomicPathwayOutput(userContext, output)).toEqual({
      ok: false,
      code: "ECONOMIC_PATHWAYS_OUTPUT_UNSAFE",
    });
  });
});
