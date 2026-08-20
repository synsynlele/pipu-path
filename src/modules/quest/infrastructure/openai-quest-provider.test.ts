import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/openai-structured-output", () => ({
  requestOpenAIStructuredOutput: request,
}));

import {
  normalizeQuestProviderOutput,
  OpenAIQuestProvider,
} from "./openai-quest-provider";

const quest = (title: string) => ({
  title,
  real_world_outcome: "Create one useful result and record what happened.",
  why_it_matters: "This tests the Journey milestone through real action.",
  estimated_minutes: 45,
  action_steps: [
    "Choose one small result to create.",
    "Carry out the action with trusted people.",
    "Record what happened honestly.",
  ],
  resources_needed: ["Notebook"],
  low_resource_alternative: "Use paper or a basic phone note instead.",
  evidence_requirements: ["Record the result and what happened."],
  safety_guidance: "Use trusted people and protect private information.",
  completion_criteria: "The useful result exists and is honestly recorded.",
  reflection_prompts: [
    "What did you do in the real world?",
    "What happened when you tried it?",
    "What did you learn from the result?",
    "What will you improve next time?",
  ],
});

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

describe("OpenAIQuestProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assigns sequence order from array position instead of trusting model numbering", () => {
    const normalized = normalizeQuestProviderOutput({
      quests: [quest("Create a Study Check"), quest("Test the Check"), quest("Improve the Check")],
    }) as { quests: Array<{ sequence_order: number }> };

    expect(normalized.quests.map((item) => item.sequence_order)).toEqual([1, 2, 3]);
  });

  it("makes duplicate model titles distinct without changing the Quest content", () => {
    const normalized = normalizeQuestProviderOutput({
      quests: [quest("Try the idea"), quest("Try the idea"), quest("Try the idea")],
    }) as { quests: Array<{ title: string }> };

    expect(new Set(normalized.quests.map((item) => item.title.toLowerCase())).size).toBe(3);
  });

  it("requests an ordered three-Quest pack and returns normalized domain-ready output", async () => {
    request.mockResolvedValue({
      quests: [quest("Create a Study Check"), quest("Test the Study Check"), quest("Improve the Study Check")],
    });

    const output = (await new OpenAIQuestProvider().generate({ context })) as {
      quests: Array<{ sequence_order: number }>;
    };

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ schemaName: "pipupath_quest_pack_v2" }),
    );
    expect(output.quests.map((item) => item.sequence_order)).toEqual([1, 2, 3]);
  });
});
