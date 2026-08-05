import { describe, expect, it } from "vitest";
import {
  validateMissionOutput,
  type MissionOutput,
  type MissionProfileContext,
} from "../domain/mission-contract";
import { buildEvidenceBasedMission } from "./mission-fallback";

const ids = {
  strength: "11111111-1111-4111-8111-111111111111",
  interest: "22222222-2222-4222-8222-222222222222",
  problem: "33333333-3333-4333-8333-333333333333",
  contribution: "44444444-4444-4444-8444-444444444444",
  direction: "55555555-5555-4555-8555-555555555555",
};

function contextWithSections(): MissionProfileContext {
  return {
    profileId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    summary: "A completed provisional profile.",
    ageBand: "25_plus",
    lifeStage: null,
    isMinor: false,
    generalResourceConstraints: [],
    sections: [
      {
        key: "emerging_strengths",
        insights: [
          {
            id: ids.strength,
            title: "Organising",
            summary: "You may organise useful action.",
            description: "This pattern is grounded in profile evidence.",
          },
        ],
      },
      {
        key: "what_draws_you",
        insights: [
          {
            id: ids.interest,
            title: "Learning",
            summary: "You may enjoy helping people learn.",
            description: "This pattern is grounded in profile evidence.",
          },
        ],
      },
      {
        key: "problems_you_care_about",
        insights: [
          {
            id: ids.problem,
            title: "A learning problem",
            summary: "You may care about a practical learning problem.",
            description: "This pattern is grounded in profile evidence.",
          },
        ],
      },
      {
        key: "how_you_can_contribute",
        insights: [
          {
            id: ids.contribution,
            title: "Guide and improve",
            summary: "You may guide one useful improvement.",
            description: "This pattern is grounded in profile evidence.",
          },
        ],
      },
      {
        key: "best_next_direction",
        insights: [
          {
            id: ids.direction,
            title: "Test one improvement",
            summary: "A small experiment may be a useful next step.",
            description: "This pattern is grounded in profile evidence.",
          },
          {
            id: ids.contribution,
            title: "Repeated evidence",
            summary: "The same evidence may appear in another section.",
            description: "Duplicate references should be removed.",
          },
        ],
      },
    ],
  };
}

const currentMission: MissionOutput = {
  title: "Current Draft Mission",
  mission_statement:
    "Test one small learning improvement with a reachable group this month.",
  why_this_fits:
    "The current draft is grounded in the user's approved profile evidence and remains appropriately limited.",
  who_this_helps: "A reachable group of learners",
  first_meaningful_outcome:
    "Complete one useful learning resource and collect feedback.",
  time_horizon: "four_weeks",
  success_signal: "At least one intended user tries it and gives feedback.",
  current_caution: "An earlier caution.",
  profile_evidence_refs: [ids.direction, ids.contribution],
};

describe("evidence-based mission fallback", () => {
  it("builds a contract-valid mission with ordered unique evidence", () => {
    const context = contextWithSections();
    const mission = buildEvidenceBasedMission({ context });

    expect(validateMissionOutput(context, mission)).toEqual({
      ok: true,
      value: mission,
    });
    expect(mission.profile_evidence_refs).toEqual([
      ids.direction,
      ids.contribution,
      ids.problem,
      ids.interest,
    ]);
  });

  it("preserves a current draft while replacing its caution", () => {
    const mission = buildEvidenceBasedMission({
      context: contextWithSections(),
      currentMission,
    });

    expect(mission).toEqual({
      ...currentMission,
      current_caution:
        "Keep the scope small, use resources already available and confirm the next step through real feedback.",
    });
  });

  it("rejects a profile with fewer than two usable evidence references", () => {
    const context = contextWithSections();
    context.sections = context.sections.slice(0, 1);

    expect(() => buildEvidenceBasedMission({ context })).toThrow(
      "MISSION_PROFILE_REQUIRED",
    );
  });
});
