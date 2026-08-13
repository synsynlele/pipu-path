import { describe, expect, it } from "vitest";
import {
  calculateJourneyProgress,
  validateJourneyForContext,
  validateJourneyOutput,
  type JourneyContext,
} from "./journey-contract";

const milestone = (
  sequence_order: number,
  title = `Milestone ${sequence_order}`,
) => ({
  title,
  purpose: "Produce one meaningful step toward the active mission.",
  expected_outcome: "A small useful result is ready for review.",
  suggested_duration: "One week",
  capabilities_to_develop: ["Listening", "Planning"],
  completion_signal: "One clear result has been recorded.",
  resource_note: "Use materials and people already available.",
  sequence_order,
});
const valid = {
  title: "Test a useful study idea",
  summary: "Build a small response and learn from using it with real people.",
  target_outcome: "Create and test one simple study support guide.",
  suggested_duration: "four_weeks" as const,
  milestones: [1, 2, 3, 4].map((order) => milestone(order)),
};

const selectedPath = {
  key: "communication_service",
  pathName: "Communication Through Useful Service",
  observedPattern:
    "Your profile repeatedly shows that you explain ideas clearly and move toward practical action.",
  possibleInterpretation:
    "This may fit work where communication turns a real problem into a useful result for other people.",
  whyItFits:
    "The profile combines communication, initiative and learning through practical feedback rather than theory alone.",
  skillsNeeded: ["Clear explanation", "Feedback"],
  howToTest:
    "Create one small explanation for a reachable person, let them use it and ask what became clearer.",
  valueOrIncome: [
    "A useful explanation can later become a service after evidence shows that people value it.",
  ],
  evidenceNeeded:
    "Keep the finished sample, specific feedback and one improved version that responds to the user's needs.",
  profileEvidenceRefs: [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ],
};

const pathwayContext: JourneyContext = {
  missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  title: "Test communication service",
  missionStatement:
    "Test communication by creating one useful explanation for a reachable person.",
  whoThisHelps: "A reachable learner",
  firstMeaningfulOutcome: "Create and test one useful explanation.",
  successSignal: "The learner uses it and provides feedback.",
  currentCaution: "Keep the test small and use trusted channels.",
  ageBand: "18_24",
  isMinor: false,
  generalResourceConstraints: ["Use existing resources"],
  selectedPath,
};

const validPathway = {
  ...valid,
  milestones: [
    milestone(1, "Week 1 — Learn the Basics"),
    milestone(2, "Week 2 — Practice the Skills"),
    milestone(3, "Week 3 — Build a Sample"),
    milestone(4, "Week 4 — Test With Feedback"),
  ],
};

describe("Journey contract", () => {
  it("accepts four to six ordered milestones", () =>
    expect(validateJourneyOutput(valid).ok).toBe(true));
  it("rejects fewer than four milestones", () =>
    expect(
      validateJourneyOutput({
        ...valid,
        milestones: valid.milestones.slice(0, 3),
      }).ok,
    ).toBe(false));
  it("rejects unordered sequences", () =>
    expect(
      validateJourneyOutput({
        ...valid,
        milestones: [milestone(2), milestone(1), milestone(3), milestone(4)],
      }).ok,
    ).toBe(false));
  it("rejects duplicate milestones", () =>
    expect(
      validateJourneyOutput({
        ...valid,
        milestones: [
          milestone(1, "Same"),
          milestone(2, "Same"),
          milestone(3),
          milestone(4),
        ],
      }).ok,
    ).toBe(false));
  it("rejects unsafe output", () =>
    expect(
      validateJourneyOutput({
        ...valid,
        summary:
          "Contact strangers and keep this secret while building the idea.",
      }),
    ).toEqual({ ok: false, code: "JOURNEY_OUTPUT_UNSAFE" }));
  it("keeps quests outside Stage 6", () =>
    expect(
      validateJourneyOutput({
        ...valid,
        summary:
          "Complete a daily task and earn XP while building the useful idea.",
      }),
    ).toEqual({ ok: false, code: "JOURNEY_OUTPUT_UNSAFE" }));
  it("calculates progress from completed milestones only", () =>
    expect(
      calculateJourneyProgress(["completed", "active", "locked", "locked"]),
    ).toBe(25));

  it("accepts the strict Learn Practice Build Test pathway", () => {
    expect(validateJourneyForContext(pathwayContext, validPathway)).toEqual({
      ok: true,
      value: validPathway,
    });
  });

  it("rejects a selected-path Journey outside four weeks", () => {
    expect(
      validateJourneyForContext(pathwayContext, {
        ...validPathway,
        suggested_duration: "six_weeks",
      }),
    ).toEqual({ ok: false, code: "JOURNEY_OUTPUT_INVALID" });
  });

  it("rejects a selected-path Journey with more than four milestones", () => {
    expect(
      validateJourneyForContext(pathwayContext, {
        ...validPathway,
        milestones: [
          ...validPathway.milestones,
          milestone(5, "Week 5 — Reflect"),
        ],
      }),
    ).toEqual({ ok: false, code: "JOURNEY_OUTPUT_INVALID" });
  });

  it("rejects a selected-path Journey with the wrong weekly phase", () => {
    expect(
      validateJourneyForContext(pathwayContext, {
        ...validPathway,
        milestones: [
          milestone(1, "Week 1 — Learn the Basics"),
          milestone(2, "Week 2 — Research More"),
          milestone(3, "Week 3 — Build a Sample"),
          milestone(4, "Week 4 — Test With Feedback"),
        ],
      }),
    ).toEqual({ ok: false, code: "JOURNEY_OUTPUT_INVALID" });
  });

  it("rejects an invalid Journey context before interpreting output", () => {
    expect(
      validateJourneyForContext(
        { ...pathwayContext, missionId: "not-a-uuid" },
        validPathway,
      ),
    ).toEqual({ ok: false, code: "JOURNEY_OUTPUT_INVALID" });
  });
});
