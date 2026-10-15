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

it("changes the activity for adult practice, making and research goals", () => {
  const practice = buildEvidenceBasedQuestPack({
    ...context,
    milestoneTitle: "Practise clear public speaking",
    milestonePurpose: "Practise explaining a useful idea to a known audience.",
    milestoneExpectedOutcome: "One short talk has been tried and improved.",
  });
  const making = buildEvidenceBasedQuestPack({
    ...context,
    milestoneTitle: "Create a repair service sample",
    milestonePurpose: "Make a useful sample of a safe repair service.",
    milestoneExpectedOutcome: "A sample of the service is ready to test.",
  });
  const research = buildEvidenceBasedQuestPack(context);
  expect(practice.quests[0].action_steps.join(" ")).toContain("practise");
  expect(making.quests[0].action_steps.join(" ")).toContain("repair service");
  expect(research.quests[0].action_steps.join(" ")).toContain("question");
  expect(
    new Set([practice, making, research].map((p) => JSON.stringify(p.quests)))
      .size,
  ).toBe(3);
  for (const pack of [practice, making]) {
    expect(
      pack.quests.every(
        (q) => !/teacher|school|classmate/i.test(JSON.stringify(q)),
      ),
    ).toBe(true);
    expect(
      pack.quests.every((q) =>
        q.resources_needed.every(
          (r) => !context.capabilitiesToDevelop.includes(r),
        ),
      ),
    ).toBe(true);
  }
});

it("preserves supervision for minors and bounded output for long milestone titles", () => {
  const minor = {
    ...context,
    ageBand: "10_12",
    isMinor: true,
    milestoneTitle: "Make ".repeat(32),
  };
  const output = buildEvidenceBasedQuestPack(minor);
  expect(validateQuestPackForContext(minor, output).ok).toBe(true);
  expect(
    output.quests.every((q) =>
      q.safety_guidance.includes("parent, guardian or teacher"),
    ),
  ).toBe(true);
  expect(output.quests[2].completion_criteria).toContain(
    "Do not claim an outcome",
  );
});
