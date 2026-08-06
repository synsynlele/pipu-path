import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  env: vi.fn(),
  getContext: vi.fn(),
  getState: vi.fn(),
  authenticatedRpc: vi.fn(),
  serviceRpc: vi.fn(),
  generate: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/env", () => ({ requireOpenAIEnvironment: mocks.env }));
vi.mock("../infrastructure/journey-dal", () => ({
  getJourneyContext: mocks.getContext,
  getCurrentJourneyState: mocks.getState,
}));
vi.mock("@/modules/connect/infrastructure/connect-rpc", () => ({
  callAuthenticatedConnectRpc: mocks.authenticatedRpc,
  callServiceRoleStage11Rpc: mocks.serviceRpc,
}));
vi.mock("../infrastructure/openai-journey-provider", () => ({
  OpenAIJourneyProvider: class {
    generate = mocks.generate;
  },
}));
vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ info: mocks.info, warn: mocks.warn }),
}));

import { generateContinuingJourney } from "./journey-continuation";

const sourceJourneyId = "11111111-1111-4111-8111-111111111111";
const context = {
  missionId: "22222222-2222-4222-8222-222222222222",
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
  id: `milestone-${sequence_order}`,
  title: `Completed Milestone ${sequence_order}`,
  purpose: "Produce one meaningful step toward the active mission.",
  expected_outcome: "A small useful result is ready for review.",
  suggested_duration: "One week",
  capabilities_to_develop: ["Planning"],
  completion_signal: "One clear result has been recorded.",
  resource_note: "Use materials already available.",
  sequence_order,
  status: "completed" as const,
});
const completed = {
  id: sourceJourneyId,
  missionId: context.missionId,
  title: "Build useful study support",
  summary:
    "Build and test one small study support resource with real learners.",
  target_outcome: "Create one tested guide that helps three students.",
  suggested_duration: "four_weeks" as const,
  status: "completed" as const,
  cycleNumber: 1,
  continuesJourneyId: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  completedAt: "2026-08-05T00:00:00.000Z",
  milestones: [1, 2, 3, 4].map(milestone),
};
const nextMilestone = (sequence_order: number) => ({
  title: `Next Milestone ${sequence_order}`,
  purpose: "Deepen one practical part of the mission using completed evidence.",
  expected_outcome: "A stronger useful result is ready for review.",
  suggested_duration: "One week",
  capabilities_to_develop: ["Iteration"],
  completion_signal: "A stronger result and its evidence have been recorded.",
  resource_note: "Use evidence and resources already available.",
  sequence_order,
});
const output = {
  title: "Deepen useful study support",
  summary:
    "Use the completed evidence to improve and test a stronger study support resource.",
  target_outcome:
    "Create a stronger repeatable guide that helps the same learners more clearly.",
  suggested_duration: "four_weeks",
  milestones: [1, 2, 3, 4].map(nextMilestone),
};

function state(overrides: Record<string, unknown> = {}) {
  return {
    active: null,
    draft: null,
    latestCompleted: completed,
    attempts: 1,
    continuationAttempts: 0,
    continuationEligible: true,
    continuationBlocker: null,
    requestRunning: false,
    ...overrides,
  };
}

describe("Journey continuation orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.env.mockReturnValue({ model: "gpt-5-mini", apiKey: "hidden" });
    mocks.getContext.mockResolvedValue(context);
    mocks.getState.mockResolvedValue(state());
    mocks.authenticatedRpc.mockResolvedValue("request-2");
    mocks.serviceRpc.mockImplementation(async (name: string) => {
      if (name === "claim_stage6_journey_request") return true;
      if (name === "persist_stage6_journey") return "journey-2";
      return true;
    });
    mocks.generate.mockResolvedValue(output);
  });

  it("persists an OpenAI-generated next Journey cycle", async () => {
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: true,
      journeyId: "journey-2",
    });
    expect(mocks.authenticatedRpc).toHaveBeenCalledWith(
      "create_stage6_journey_request",
      {
        mission_id_input: context.missionId,
        generation_kind_input: "continue",
        source_journey_id_input: sourceJourneyId,
        refinement_instruction_input: null,
        prompt_version_input: "journey-continuity-openai-v1",
      },
    );
    expect(mocks.generate).toHaveBeenCalledWith(
      expect.objectContaining({ continuation: true }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.objectContaining({ journey_input: output }),
    );
    expect(mocks.info).toHaveBeenCalledWith(
      "journey_continuation_completed",
      expect.objectContaining({ cycleNumber: 2, generationMode: "openai" }),
    );
  });

  it("requires an active Mission", async () => {
    mocks.getContext.mockResolvedValue(null);
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message: "Your active Mission is required.",
    });
    expect(mocks.authenticatedRpc).not.toHaveBeenCalled();
  });

  it("rejects a missing or different completed source", async () => {
    mocks.getState.mockResolvedValue(state({ latestCompleted: null }));
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message: "That completed Journey is no longer available.",
    });
    mocks.getState.mockResolvedValue(
      state({ latestCompleted: { ...completed, id: "different" } }),
    );
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message: "That completed Journey is no longer available.",
    });
  });

  it("does not create a continuation while another cycle exists", async () => {
    mocks.getState.mockResolvedValue(state({ active: { id: "active" } }));
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message: "Your next Journey cycle is already available.",
    });
    mocks.getState.mockResolvedValue(state({ draft: { id: "draft" } }));
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message: "Your next Journey cycle is already available.",
    });
  });

  it("requires a completed Project from the source Journey", async () => {
    mocks.getState.mockResolvedValue(
      state({
        continuationEligible: false,
        continuationBlocker: "project-required",
      }),
    );
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message:
        "Complete one Builder Project from this Journey before creating the next cycle.",
    });
  });

  it("requires the current active Project to finish", async () => {
    mocks.getState.mockResolvedValue(
      state({
        continuationEligible: false,
        continuationBlocker: "active-project",
      }),
    );
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message:
        "Complete your active Builder Project before creating the next Journey cycle.",
    });
  });

  it("returns a safe retry message when request creation fails", async () => {
    mocks.authenticatedRpc.mockRejectedValue(new Error("database unavailable"));
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message:
        "PipuPath could not begin the next Journey cycle. Refresh and try once more.",
    });
  });

  it("stops when another worker already claimed the request", async () => {
    mocks.serviceRpc.mockResolvedValueOnce(false);
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message: "Your next Journey is already being shaped.",
    });
  });

  it("uses the evidence fallback when OpenAI fails", async () => {
    mocks.generate.mockRejectedValue(new Error("OPENAI_TIMEOUT"));
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: true,
      journeyId: "journey-2",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.objectContaining({
        journey_input: expect.objectContaining({
          title: "Deepen the Mission Through a Stronger Second Test",
        }),
      }),
    );
    expect(mocks.info).toHaveBeenCalledWith(
      "journey_continuation_completed",
      expect.objectContaining({
        generationMode: "evidence_fallback",
        fallbackReason: "OPENAI_TIMEOUT",
      }),
    );
  });

  it("uses the fallback when OpenAI is not configured", async () => {
    mocks.env.mockImplementation(() => {
      throw new Error("missing");
    });
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: true,
      journeyId: "journey-2",
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

  it("replaces invalid provider output with a validated fallback", async () => {
    mocks.generate.mockResolvedValue({ title: "Incomplete" });
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: true,
      journeyId: "journey-2",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage6_journey",
      expect.objectContaining({
        journey_input: expect.objectContaining({
          title: "Deepen the Mission Through a Stronger Second Test",
        }),
      }),
    );
  });

  it("marks the request failed when persistence throws", async () => {
    mocks.serviceRpc.mockImplementation(async (name: string) => {
      if (name === "claim_stage6_journey_request") return true;
      if (name === "persist_stage6_journey") throw new Error("persist failed");
      return true;
    });
    await expect(generateContinuingJourney(sourceJourneyId)).resolves.toEqual({
      ok: false,
      message:
        "PipuPath could not safely shape the next Journey. Please try again.",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "fail_stage6_journey_request",
      expect.objectContaining({ failure_code_input: "JOURNEY_SAVE_FAILED" }),
    );
    expect(mocks.warn).toHaveBeenCalledWith("journey_continuation_failed", {
      requestId: "request-2",
    });
  });
});
