import { describe, expect, it } from "vitest";
import { validateQuestPackForContext } from "../domain/quest-contract";
import { buildEvidenceBasedQuestPack } from "./quest-fallback";

const context = {
  journeyId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  journeyTitle: "Build useful study support",
  journeyTargetOutcome: "Create one tested support guide.",
  milestoneId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  milestoneTitle: "Understand the learner problem",
  milestonePurpose: "Learn what makes studying difficult for three learners.",
  milestoneExpectedOutcome: "A clear pattern of learner needs is recorded.",
  milestoneCompletionSignal: "Three honest learner responses are compared.",
  milestoneResourceNote: "Use trusted learners and existing materials.",
  capabilitiesToDevelop: ["Listening", "Observation"],
  ageBand: "18_24",
  isMinor: false,
  generalResourceConstraints: ["No spending required"],
};

describe("evidence-based Quest fallback", () => {
  it("produces a contract-valid ordered three-Quest pack", () => {
    const output = buildEvidenceBasedQuestPack(context);
    const result = validateQuestPackForContext(context, output);

    expect(result.ok).toBe(true);
    expect(output.quests).toHaveLength(3);
    expect(output.quests.map((item) => item.sequence_order)).toEqual([1, 2, 3]);
    expect(
      output.quests.every((item) => item.reflection_prompts.length === 4),
    ).toBe(true);
  });

  it("keeps every Quest practical without requiring new spending", () => {
    const output = buildEvidenceBasedQuestPack(context);

    expect(
      output.quests.every(
        (item) =>
          item.estimated_minutes >= 15 &&
          item.action_steps.length >= 3 &&
          item.low_resource_alternative.length >= 10,
      ),
    ).toBe(true);
  });
});
