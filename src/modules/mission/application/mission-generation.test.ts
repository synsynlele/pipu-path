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
vi.mock("../infrastructure/gemini-mission-provider", () => ({
  GeminiMissionProvider: class {
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
  time_horizon: "four_weeks",
  success_signal: "Three students use it and give feedback.",
  current_caution: "Start small and use resources already available.",
  profile_evidence_refs: insightIds,
};

describe("mission generation orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.env.mockReturnValue({ model: "gemini-flash", apiKey: "hidden" });
    mocks.getContext.mockResolvedValue(context);
    mocks.getState.mockResolvedValue({
      active: null,
      draft: null,
      attempts: 0,
      requestRunning: false,
    });
    mocks.browserRpc.mockResolvedValue({ data: "request-1", error: null });
    mocks.serviceRpc.mockImplementation(async (name: string) => {
      if (name === "claim_stage5_mission_request")
        return { data: true, error: null };
      if (name === "persist_stage5_mission")
        return { data: "mission-1", error: null };
      return { data: true, error: null };
    });
    mocks.generate.mockResolvedValue(output);
  });

  it("runs profile to Gemini to persisted draft mission", async () => {
    await expect(generateCurrentMission({ kind: "initial" })).resolves.toEqual({
      ok: true,
      missionId: "mission-1",
    });
    expect(mocks.browserRpc).toHaveBeenCalledWith(
      "create_stage5_mission_request",
      expect.objectContaining({ profile_id_input: context.profileId }),
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

  it("uses the fallback when Gemini times out", async () => {
    mocks.generate.mockRejectedValue(new Error("GEMINI_TIMEOUT"));
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

  it("uses the fallback when Gemini configuration is unavailable", async () => {
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
});
