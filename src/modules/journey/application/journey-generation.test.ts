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
vi.mock("../infrastructure/journey-dal", () => ({
  getJourneyContext: mocks.getContext,
  getCurrentJourneyState: mocks.getState,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ rpc: mocks.browserRpc })),
}));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: vi.fn(() => ({ rpc: mocks.serviceRpc })),
}));
vi.mock("../infrastructure/openai-journey-provider", () => ({
  OpenAIJourneyProvider: class {
    generate = mocks.generate;
  },
}));
vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ info: mocks.info, warn: mocks.warn }),
}));

import { generateCurrentJourney } from "./journey-generation";

const context = {
  missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  title: "Support student study",
  missionStatement: "Test a useful study support idea with three students.",
  whoThisHelps: "Three students",
  firstMeaningfulOutcome: "Create and test one useful study guide.",
  successSignal: "Three students use it and respond.",
  currentCaution: "Use trusted people and existing resources.",
  ageBand: "18_24",
  isMinor: false,
  generalResourceConstraints: ["No spending required"],
};
const milestone = (sequence_order: number) => ({
  title: `Milestone ${sequence_order}`,
  purpose: "Produce one meaningful step toward the active mission.",
  expected_outcome: "A small useful result is ready for review.",
  suggested_duration: "One week",
  capabilities_to_develop: ["Planning"],
  completion_signal: "One clear result has been recorded.",
  resource_note: "Use materials already available.",
  sequence_order,
});
const output = {
  title: "Build useful study support",
  summary:
    "Build and test one small study support resource with real learners.",
  target_outcome: "Create one tested guide that helps three students.",
  suggested_duration: "four_weeks",
  milestones: [1, 2, 3, 4].map(milestone),
};

describe("Journey generation orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.env.mockReturnValue({ model: "gpt-5-mini", apiKey: "hidden" });
    mocks.getContext.mockResolvedValue(context);
    mocks.getState.mockResolvedValue({
      active: null,
      draft: null,
      completed: null,
      completedProject: null,
      continuationAvailable: false,
      nextCycleNumber: null,
      attempts: 0,
      requestRunning: false,
    });
    mocks.browserRpc.mockResolvedValue({ data: "request-1", error: null });
    mocks.serviceRpc.mockImplementation(async (name: string) =>
      name === "claim_stage6_journey_request"
        ? { data: true, error: null }
        : name === "persist_stage6_journey"
          ? { data: "journey-1", error: null }
          : { data: true, error: null },
    );
    mocks.generate.mockResolvedValue(output);
  });

  it("runs active mission to OpenAI to persisted draft Journey", async () => {
    await expect(generateCurrentJourney({ kind: "initial" })).resolves.toEqual({
      ok: true,
      journeyId: "journey-1",
    });
    expect(mocks.browserRpc).toHaveBeenCalledWith(
      "create_stage6_journey_request",
      expect.objectContaining({
        mission_id_input: context.missionId,
        prompt_version_input: "journey-plain-v3",
      }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "claim_stage6_journey_request",
      expect.objectContaining({
        provider_input: "openai",
        model_input: "gpt-5-mini",
      }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.objectContaining({ journey_input: output }),
    );
  });

  it("repairs invalid output once, then persists only the validated AI result", async () => {
    mocks.generate
      .mockResolvedValueOnce({ title: "Incomplete" })
      .mockResolvedValueOnce(output);
    expect(await generateCurrentJourney({ kind: "initial" })).toMatchObject({
      ok: true,
    });
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(mocks.generate).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ timeoutMs: expect.any(Number) }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.anything(),
    );
  });
  it("keeps invalid retries out of saved work", async () => {
    mocks.generate.mockResolvedValue({ title: "Incomplete" });
    expect(await generateCurrentJourney({ kind: "initial" })).toMatchObject({
      ok: false,
      code: "JOURNEY_OUTPUT_INVALID",
    });
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(mocks.serviceRpc).not.toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.anything(),
    );
  });
  it.each(["OPENAI_TIMEOUT", "OPENAI_HTTP_429", "network disconnected"])(
    "shows provider failure %s without saving a template",
    async (reason) => {
      mocks.generate.mockRejectedValue(new Error(reason));
      expect(await generateCurrentJourney({ kind: "initial" })).toMatchObject({
        ok: false,
      });
      expect(mocks.serviceRpc).not.toHaveBeenCalledWith(
        "persist_stage6_journey",
        expect.anything(),
      );
    },
  );
  it("does not spend a generation attempt if AI configuration is unavailable", async () => {
    mocks.env.mockImplementation(() => {
      throw new Error("missing");
    });
    expect(await generateCurrentJourney({ kind: "initial" })).toMatchObject({
      ok: false,
      code: "JOURNEY_PROVIDER_UNAVAILABLE",
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
    expect(await generateCurrentJourney({ kind: "initial" })).toMatchObject({
      ok: true,
    });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.anything(),
    );
  });
});
