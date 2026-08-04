import { describe, expect, it } from "vitest";
import {
  calculateQuestPackProgress,
  validateQuestPackOutput,
} from "./quest-contract";

const quest = (sequence_order: number, title = `Quest ${sequence_order}`) => ({
  title,
  real_world_outcome: "One useful real-world result is created and recorded.",
  why_it_matters:
    "This builds practical capability and tests the milestone with honest action.",
  estimated_minutes: 60,
  action_steps: [
    "Choose one small result to create.",
    "Use people and materials already available.",
    "Carry out the action and record what happened.",
  ],
  resources_needed: ["A notebook", "A trusted participant"],
  low_resource_alternative:
    "Use paper, a basic phone note or a face-to-face conversation.",
  evidence_requirements: [
    "Write what you created, who used it and what happened.",
  ],
  safety_guidance:
    "Work only with trusted people and do not share private information.",
  completion_criteria:
    "The useful result exists, has been tried and has honest evidence.",
  reflection_prompts: [
    "What did you do?",
    "What happened when you tried it?",
    "What did you learn?",
    "What will you change next time?",
  ],
  sequence_order,
});

const valid = { quests: [1, 2, 3].map((order) => quest(order)) };

describe("Stage 7 Quest contract", () => {
  it("accepts exactly three ordered HQLS Quests", () => {
    expect(validateQuestPackOutput(valid)).toEqual({ ok: true, value: valid });
  });
  it("rejects an incomplete Quest pack", () => {
    expect(validateQuestPackOutput({ quests: valid.quests.slice(0, 2) })).toEqual({ ok: false, code: "QUEST_OUTPUT_INVALID" });
  });
  it("rejects sequence gaps", () => {
    expect(validateQuestPackOutput({ quests: [quest(1), quest(3), quest(2)] })).toEqual({ ok: false, code: "QUEST_OUTPUT_INVALID" });
  });
  it("rejects duplicate Quest titles", () => {
    expect(validateQuestPackOutput({ quests: [quest(1, "Same Quest"), quest(2, "Same Quest"), quest(3)] })).toEqual({ ok: false, code: "QUEST_OUTPUT_INVALID" });
  });
  it("rejects unsafe stranger contact", () => {
    expect(validateQuestPackOutput({ quests: [{ ...quest(1), safety_guidance: "Meet an unknown adult and keep this secret." }, quest(2), quest(3)] })).toEqual({ ok: false, code: "QUEST_OUTPUT_UNSAFE" });
  });
  it("rejects mandatory spending", () => {
    expect(validateQuestPackOutput({ quests: [{ ...quest(1), resources_needed: ["You must buy a new laptop"] }, quest(2), quest(3)] })).toEqual({ ok: false, code: "QUEST_OUTPUT_UNSAFE" });
  });
  it("rejects fabricated evidence", () => {
    expect(validateQuestPackOutput({ quests: [{ ...quest(1), evidence_requirements: ["Invent a result if the action fails."] }, quest(2), quest(3)] })).toEqual({ ok: false, code: "QUEST_OUTPUT_UNSAFE" });
  });
  it("calculates progress only from genuinely completed Quests", () => {
    expect(calculateQuestPackProgress(["completed", "evidence_submitted", "locked"])).toBe(33);
  });
});
