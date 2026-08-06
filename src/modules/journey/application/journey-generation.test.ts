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
        prompt_version_input: "journey-openai-v2",
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

  it("replaces invalid provider output with a validated fallback Journey", async () => {
    mocks.generate.mockResolvedValue({ title: "Incomplete" });
    await expect(generateCurrentJourney({ kind: "initial" })).resolves.toEqual({
      ok: true,
      journeyId: "journey-1",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.objectContaining({
        journey_input: expect.objectContaining({
          title: "Build Evidence Through One Practical Test",
          milestones: expect.arrayContaining([
            expect.objectContaining({ sequence_order: 1 }),
            expect.objectContaining({ sequence_order: 4 }),
          ]),
        }),
      }),
    );
    expect(mocks.serviceRpc).not.toHaveBeenCalledWith(
      "fail_stage6_journey_request",
      expect.anything(),
    );
  });

  it("uses the fallback when OpenAI times out", async () => {
    mocks.generate.mockRejectedValue(new Error("OPENAI_TIMEOUT"));
    await expect(generateCurrentJourney({ kind: "initial" })).resolves.toEqual({
      ok: true,
      journeyId: "journey-1",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.objectContaining({
        journey_input: expect.objectContaining({
          title: "Build Evidence Through One Practical Test",
        }),
      }),
    );
  });

  it("uses the fallback when OpenAI configuration is unavailable", async () => {
    mocks.env.mockImplementation(() => {
      throw new Error("missing");
    });
    await expect(generateCurrentJourney({ kind: "initial" })).resolves.toEqual({
      ok: true,
      journeyId: "journey-1",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "claim_stage6_journey_request",
      expect.objectContaining({
        provider_input: "evidence_fallback",
        model_input: "evidence-fallback-v1",
      }),
    );
  });
});
