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
vi.mock("@/lib/config/env", () => ({ requireOpenAIEnvironment: mocks.env }));
vi.mock("../infrastructure/quest-dal", () => ({
  getQuestContext: mocks.getContext,
  getCurrentQuestState: mocks.getState,
}));
vi.mock("../infrastructure/quest-client", () => ({
  createQuestServerClient: vi.fn(async () => ({ rpc: mocks.browserRpc })),
  createQuestServiceClient: vi.fn(() => ({ rpc: mocks.serviceRpc })),
}));
vi.mock("../infrastructure/openai-quest-provider", () => ({
  OpenAIQuestProvider: class {
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
    mocks.env.mockReturnValue({ model: "gpt-5-mini", apiKey: "hidden" });
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

  it("turns an available milestone into an OpenAI-generated Quest pack", async () => {
    await expect(generateCurrentQuestPack()).resolves.toEqual({
      ok: true,
      firstQuestId: "quest-1",
    });
    expect(mocks.browserRpc).toHaveBeenCalledWith(
      "create_stage7_quest_request",
      expect.objectContaining({
        milestone_id_input: context.milestoneId,
        prompt_version_input: "quest-plain-v2",
      }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "claim_stage7_quest_request",
      expect.objectContaining({
        provider_input: "openai",
        model_input: "gpt-5-mini",
      }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage7_quest_pack",
      expect.objectContaining({ quest_pack_input: output }),
    );
  });

  it("requires an available Journey milestone", async () => {
    mocks.getContext.mockResolvedValue(null);

    await expect(generateCurrentQuestPack()).resolves.toMatchObject({
      ok: false,
      code: "QUEST_MILESTONE_REQUIRED",
    });
    expect(mocks.getState).not.toHaveBeenCalled();
  });

  it("does not replace an existing Quest pack", async () => {
    mocks.getState.mockResolvedValue({
      quests: [{ id: "existing-quest" }],
      attempts: 1,
      requestRunning: false,
      totalXp: 0,
    });

    await expect(generateCurrentQuestPack()).resolves.toMatchObject({
      ok: false,
      code: "QUEST_GENERATION_DISABLED",
    });
    expect(mocks.browserRpc).not.toHaveBeenCalled();
  });

  it("returns the safe request error raised by the database", async () => {
    mocks.browserRpc.mockResolvedValue({
      data: null,
      error: new Error("QUEST_CONSENT_REQUIRED"),
    });

    await expect(generateCurrentQuestPack()).resolves.toMatchObject({
      ok: false,
      code: "QUEST_CONSENT_REQUIRED",
    });
    expect(mocks.serviceRpc).not.toHaveBeenCalled();
  });

  it("stops when the generation request cannot be claimed", async () => {
    mocks.serviceRpc.mockResolvedValueOnce({
      data: false,
      error: new Error("claim failed"),
    });

    await expect(generateCurrentQuestPack()).resolves.toMatchObject({
      ok: false,
      code: "QUEST_REQUEST_ALREADY_RUNNING",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("repairs invalid output once, then persists only the validated AI result", async () => {
    mocks.generate
      .mockResolvedValueOnce({ title: "Incomplete" })
      .mockResolvedValueOnce(output);
    expect(await generateCurrentQuestPack()).toMatchObject({ ok: true });
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(mocks.generate).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ timeoutMs: expect.any(Number) }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage7_quest_pack",
      expect.anything(),
    );
  });
  it("keeps invalid retries out of saved work", async () => {
    mocks.generate.mockResolvedValue({ title: "Incomplete" });
    expect(await generateCurrentQuestPack()).toMatchObject({
      ok: false,
      code: "QUEST_OUTPUT_INVALID",
    });
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(mocks.serviceRpc).not.toHaveBeenCalledWith(
      "persist_stage7_quest_pack",
      expect.anything(),
    );
  });
  it.each(["OPENAI_TIMEOUT", "OPENAI_HTTP_429", "network disconnected"])(
    "shows provider failure %s without saving a template",
    async (reason) => {
      mocks.generate.mockRejectedValue(new Error(reason));
      expect(await generateCurrentQuestPack()).toMatchObject({ ok: false });
      expect(mocks.serviceRpc).not.toHaveBeenCalledWith(
        "persist_stage7_quest_pack",
        expect.anything(),
      );
    },
  );
  it("does not spend a generation attempt if AI configuration is unavailable", async () => {
    mocks.env.mockImplementation(() => {
      throw new Error("missing");
    });
    expect(await generateCurrentQuestPack()).toMatchObject({
      ok: false,
      code: "QUEST_PROVIDER_UNAVAILABLE",
    });
    expect(mocks.browserRpc).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("keeps under-18 generation local and validated", async () => {
    mocks.getContext.mockResolvedValue({
      ...context,
      isMinor: true,
      ageBand: "16_17",
    });
    expect(await generateCurrentQuestPack()).toMatchObject({ ok: true });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage7_quest_pack",
      expect.anything(),
    );
  });
  it("records a safe failure when persistence fails", async () => {
    mocks.serviceRpc.mockImplementation(async (name: string) =>
      name === "claim_stage7_quest_request"
        ? { data: true, error: null }
        : name === "persist_stage7_quest_pack"
          ? { data: null, error: new Error("save failed") }
          : { data: true, error: null },
    );

    await expect(generateCurrentQuestPack()).resolves.toMatchObject({
      ok: false,
      code: "QUEST_SAVE_FAILED",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "fail_stage7_quest_request",
      expect.objectContaining({ failure_code_input: "QUEST_SAVE_FAILED" }),
    );
  });
});
