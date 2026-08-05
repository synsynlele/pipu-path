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
vi.mock("../infrastructure/mission-dal", () => ({
  getMissionProfileContext: mocks.getContext,
  getCurrentMissionState: mocks.getState,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ rpc: mocks.browserRpc })),
}));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: vi.fn(() => ({ rpc: mocks.serviceRpc })),
}));
vi.mock("../infrastructure/openai-mission-provider", () => ({
  OpenAIMissionProvider: class {
    generate = mocks.generate;
  },
}));
vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ info: mocks.info, warn: mocks.warn }),
}));

import { generateCurrentMission } from "./mission-generation";

const insightIds = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
];
const context = {
  profileId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  summary: "A completed profile.",
  ageBand: "18_24" as const,
  lifeStage: "student",
  isMinor: false,
  generalResourceConstraints: ["Use current resources"],
  sections: [
    {
      key: "emerging_strengths" as const,
      insights: insightIds.map((id) => ({
        id,
        title: "Organising",
        summary: "An emerging pattern",
        description: "Supported by profile evidence",
      })),
    },
  ],
};
const output = {
  title: "Help Students Study Better",
  mission_statement:
    "Explore how you can organise simple study support for three students.",
  why_this_fits:
    "Your profile connects organising with an interest in helping students learn.",
  who_this_helps: "Three students",
  first_meaningful_outcome: "Test one useful study guide with three students.",
  time_horizon: "four_weeks" as const,
  success_signal: "Three students use it and give feedback.",
  current_caution: "Start small and use resources already available.",
  profile_evidence_refs: insightIds,
};
const draft = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  profileId: context.profileId,
  ...output,
  status: "draft" as const,
  createdAt: "2026-08-05T12:00:00.000Z",
};

function useDefaultServiceRpc() {
  mocks.serviceRpc.mockImplementation(async (name: string) => {
    if (name === "claim_stage5_mission_request")
      return { data: true, error: null };
    if (name === "persist_stage5_mission")
      return { data: "mission-1", error: null };
    return { data: true, error: null };
  });
}

describe("mission generation orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.env.mockReturnValue({ model: "gpt-5-mini", apiKey: "hidden" });
    mocks.getContext.mockResolvedValue(context);
    mocks.getState.mockResolvedValue({
      active: null,
      draft: null,
      attempts: 0,
      requestRunning: false,
    });
    mocks.browserRpc.mockResolvedValue({ data: "request-1", error: null });
    useDefaultServiceRpc();
    mocks.generate.mockResolvedValue(output);
  });

  it("runs profile to OpenAI to persisted draft mission", async () => {
    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: true,
      missionId: "mission-1",
    });
    expect(mocks.browserRpc).toHaveBeenCalledWith(
      "create_stage5_mission_request",
      expect.objectContaining({
        profile_id_input: context.profileId,
        prompt_version_input: "mission-openai-v1",
      }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "claim_stage5_mission_request",
      expect.objectContaining({
        provider_input: "openai",
        model_input: "gpt-5-mini",
      }),
    );
    expect(mocks.generate).toHaveBeenCalledWith(
      expect.objectContaining({ context }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage5_mission",
      expect.objectContaining({ mission_input: output }),
    );
  });

  it("replaces invalid provider output with a validated fallback mission", async () => {
    mocks.generate.mockResolvedValue({ title: "Incomplete" });
    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: true,
      missionId: "mission-1",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage5_mission",
      expect.objectContaining({
        mission_input: expect.objectContaining({
          title: "Test One Useful Improvement",
          profile_evidence_refs: insightIds,
        }),
      }),
    );
    expect(mocks.serviceRpc).not.toHaveBeenCalledWith(
      "fail_stage5_mission_request",
      expect.anything(),
    );
  });

  it("uses the fallback when OpenAI times out", async () => {
    mocks.generate.mockRejectedValue(new Error("OPENAI_TIMEOUT"));
    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: true,
      missionId: "mission-1",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage5_mission",
      expect.objectContaining({
        mission_input: expect.objectContaining({
          title: "Test One Useful Improvement",
        }),
      }),
    );
  });

  it("uses the fallback for a non-standard provider failure", async () => {
    mocks.generate.mockRejectedValue(new Error("network disconnected"));
    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: true,
      missionId: "mission-1",
    });
    expect(mocks.info).toHaveBeenCalledWith(
      "mission_generation_completed",
      expect.objectContaining({
        generationMode: "evidence_fallback",
        fallbackReason: "OPENAI_PROVIDER_FAILURE",
      }),
    );
  });

  it("uses the fallback when OpenAI configuration is unavailable", async () => {
    mocks.env.mockImplementation(() => {
      throw new Error("missing");
    });
    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: true,
      missionId: "mission-1",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "claim_stage5_mission_request",
      expect.objectContaining({
        provider_input: "evidence_fallback",
        model_input: "evidence-fallback-v1",
      }),
    );
  });

  it("requires a completed profile before creating a request", async () => {
    mocks.getContext.mockResolvedValue(null);

    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: false,
      code: "MISSION_PROFILE_REQUIRED",
      message: "Complete your Human Potential Profile first.",
    });
    expect(mocks.env).not.toHaveBeenCalled();
    expect(mocks.browserRpc).not.toHaveBeenCalled();
  });

  it("rejects an invalid refinement before creating a request", async () => {
    await expect(
      generateCurrentMission({
        kind: "refine",
        sourceMissionId: draft.id,
        refinementInstruction: "{}",
      }),
    ).resolves.toMatchObject({
      ok: false,
      code: "MISSION_OUTPUT_INVALID",
    });
    expect(mocks.browserRpc).not.toHaveBeenCalled();
  });

  it("preserves a valid draft when refinement falls back", async () => {
    mocks.getState.mockResolvedValue({
      active: null,
      draft,
      attempts: 1,
      requestRunning: false,
    });
    mocks.generate.mockRejectedValue(new Error("OPENAI_HTTP_429"));

    await expect(
      generateCurrentMission({
        kind: "refine",
        sourceMissionId: draft.id,
        refinementInstruction: "Keep it practical and smaller",
      }),
    ).resolves.toEqual({ ok: true, missionId: "mission-1" });
    expect(mocks.browserRpc).toHaveBeenCalledWith(
      "create_stage5_mission_request",
      expect.objectContaining({
        source_mission_id_input: draft.id,
        refinement_instruction_input: "Keep it practical and smaller",
      }),
    );
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "persist_stage5_mission",
      expect.objectContaining({
        mission_input: expect.objectContaining({
          title: draft.title,
          current_caution:
            "Keep the scope small, use resources already available and confirm the next step through real feedback.",
        }),
      }),
    );
  });

  it("returns the database request limit error", async () => {
    mocks.browserRpc.mockResolvedValue({
      data: null,
      error: new Error("MISSION_GENERATION_LIMIT_REACHED"),
    });

    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: false,
      code: "MISSION_GENERATION_LIMIT_REACHED",
      message:
        "You have used the three mission attempts available for this profile.",
    });
    expect(mocks.serviceRpc).not.toHaveBeenCalled();
  });

  it("stops when the generation request cannot be claimed", async () => {
    mocks.serviceRpc.mockResolvedValue({ data: false, error: null });

    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: false,
      code: "MISSION_REQUEST_ALREADY_RUNNING",
      message: "Your mission is already being shaped. Please wait and refresh.",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("records a safe save failure when persistence fails", async () => {
    mocks.serviceRpc.mockImplementation(async (name: string) => {
      if (name === "claim_stage5_mission_request")
        return { data: true, error: null };
      if (name === "persist_stage5_mission")
        return { data: null, error: new Error("database failure") };
      return { data: true, error: null };
    });

    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: false,
      code: "MISSION_SAVE_FAILED",
      message: "Your mission could not be saved. Please try again.",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "fail_stage5_mission_request",
      expect.objectContaining({
        failure_code_input: "MISSION_SAVE_FAILED",
      }),
    );
  });

  it("records profile insufficiency when no valid fallback can be built", async () => {
    mocks.getContext.mockResolvedValue({
      ...context,
      sections: [
        {
          key: "emerging_strengths",
          insights: [context.sections[0].insights[0]],
        },
      ],
    });
    mocks.generate.mockRejectedValue(new Error("OPENAI_HTTP_429"));

    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: false,
      code: "MISSION_PROFILE_REQUIRED",
      message: "Complete your Human Potential Profile first.",
    });
    expect(mocks.serviceRpc).toHaveBeenCalledWith(
      "fail_stage5_mission_request",
      expect.objectContaining({
        failure_code_input: "MISSION_PROFILE_REQUIRED",
      }),
    );
  });
});
