import { describe, expect, it } from "vitest";
import {
  calculateJourneyProgress,
  validateJourneyOutput,
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
});
