import { expect, it } from "vitest";
import {
  validateQuestPackForContext,
  type QuestContext,
} from "./quest-contract";
import { buildYouthPracticalPack } from "./youth-practical-quests";
import { inspectJourneyQuestActions } from "@/shared/domain/quest-quality";

const context: QuestContext = {
  journeyId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  journeyTitle: "Build practical solutions",
  journeyTargetOutcome: "Try a useful change in a familiar setting.",
  milestoneId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  milestoneTitle: "Build peer reading support",
  milestonePurpose: "Put one small practical change into use.",
  milestoneExpectedOutcome: "A useful intervention is tested.",
  milestoneCompletionSignal: "The real results are recorded.",
  milestoneResourceNote: "Use existing permitted resources.",
  capabilitiesToDevelop: ["Problem solving"],
  ageBand: "13_15",
  isMinor: true,
  generalResourceConstraints: ["No spending required"],
};

it.each([
  "Build peer reading support",
  "Reduce water waste",
  "Organise school supplies",
  "Reduce food waste",
  "Set up a daylight workspace",
  "Reduce study interruptions",
])("provides an ordered local practical pack for %s", (milestoneTitle) => {
  const current = { ...context, milestoneTitle };
  const pack = buildYouthPracticalPack(current);
  expect(pack).not.toBeNull();
  expect(validateQuestPackForContext(current, pack).ok).toBe(true);
  expect(inspectJourneyQuestActions(pack!.quests)).toBeNull();
  for (const quest of pack!.quests) {
    expect(quest.safety_guidance).toContain("parent, guardian or teacher");
    expect(quest.low_resource_alternative).toContain("do not buy anything");
    expect(quest.completion_criteria).toContain("did not improve");
    expect(quest.evidence_requirements).toHaveLength(2);
  }
});

it("does not override adult, unrelated or discovery-only milestones", () => {
  expect(buildYouthPracticalPack({ ...context, isMinor: false })).toBeNull();
  expect(
    buildYouthPracticalPack({ ...context, milestoneTitle: "Learn to sew" }),
  ).toBeNull();
  expect(
    buildYouthPracticalPack({
      ...context,
      milestoneTitle: "Research how to reduce water waste",
    }),
  ).toBeNull();
});
