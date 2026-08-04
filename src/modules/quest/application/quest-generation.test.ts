import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  env: vi.fn(),
  getContext: vi.fn(),
  getState: vi.fn(),
  browserRpc: vi.fn(),
  serviceRpc: vi.fn(),
  generate: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mocks.auth,
}));
vi.mock("@/lib/config/env", () => ({ requireGeminiEnvironment: mocks.env }));
vi.mock("../infrastructure/quest-dal", () => ({
  getQuestContext: mocks.getContext,
  getCurrentQuestState: mocks.getState,
}));
vi.mock("../infrastructure/quest-client", () => ({
  createQuestServerClient: vi.fn(async () => ({ rpc: mocks.browserRpc })),
  createQuestServiceClient: vi.fn(() => ({ rpc: mocks.serviceRpc })),
}));
vi.mock("../infrastructure/gemini-quest-provider", () => ({
  GeminiQuestProvider: class {
    generate = mocks.generate;
  },
}));
vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ info: mocks.info, warn: mocks.warn }),
}));

import { generateCurrentQuestPack } from "./quest-generation";

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

const quest = (sequence_order: number) => ({
  title: `Quest ${sequence_order}`,
  real_world_outcome: "One useful result is created and recorded.",
  why_it_matters: "This tests the milestone through practical action.",
  estimated_minutes: 60,
  action_steps: [
    "Choose one small result.",
    "Carry out the action with trusted people.",
    "Record what happened honestly.",
  ],
  resources_needed: ["Notebook"],
  low_resource_alternative: "Use paper or a basic phone note.",
  evidence_requirements: ["Write what happened and what was created."],
  safety_guidance: "Use trusted people and protect private information.",
  completion_criteria: "The result exists and honest evidence is recorded.",
  reflection_prompts: [
    "What did you do?",
    "What happened?",
    "What did you learn?",
    "What will you change?",
  ],
  sequence_order,
});
const output = { quests: [1, 2, 3].map(quest) };

describe("Stage 7 Quest generation orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.env.mockReturnValue({ model: "gemini-flash", apiKey: "hidden" });
    mocks.getContext.mockResolvedValue(context);
    mocks.getState.mockResolvedValue({
      quests: [],
      attempts: 0,
      requestRunning: false,
      totalXp: 0,
    });
    mocks.browserRpc.mockResolvedValue({ data: "request-1", error: null });
    mocks.serviceRpc.mockImplementation(async (name: string) =>
      name === "claim_stage7_quest_request"
        ? { data: true, error: null }
        : name === "persist_stage7_quest_pack"
          ? { data: "quest-1", error: null }
          : { data: true, error: null },
    );
    mocks.generate.mockResolvedValue(output);
  });

  it("turns an available milestone into a persisted Quest pack", async () => {
    await expect(generateCurrentQuestPack()).resolves.toEqual({
      ok: true,
      firstQuestId: "quest-1",
    });
    expect(mocks.browserRpc).toHaveBeenCalledWith(
      "create_stage7_quest_request",
      expect.objectContaining({ milestone_id_input: context.milestoneId }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage7_quest_pack",
      expect.objectContaining({ quest_pack_input: output }),
    );
  });

  it("rejects malformed model output and records a safe failure", async () => {
    mocks.generate.mockResolvedValue({ quests: [] });
    await expect(generateCurrentQuestPack()).resolves.toMatchObject({
      ok: false,
      code: "QUEST_OUTPUT_INVALID",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "fail_stage7_quest_request",
      expect.objectContaining({ failure_code_input: "QUEST_OUTPUT_INVALID" }),
    );
  });

  it("classifies provider timeouts without exposing content", async () => {
    mocks.generate.mockRejectedValue(new Error("GEMINI_TIMEOUT"));
    await expect(generateCurrentQuestPack()).resolves.toMatchObject({
      ok: false,
      code: "QUEST_PROVIDER_TIMEOUT",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "fail_stage7_quest_request",
      expect.objectContaining({ failure_detail_safe_input: "GEMINI_TIMEOUT" }),
    );
  });
});
