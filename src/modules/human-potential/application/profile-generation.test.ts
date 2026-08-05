import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const requireAuthenticatedIdentity = vi.fn();
const createCurrentInterpretationRequest = vi.fn();
const requireOpenAIEnvironment = vi.fn();
const rpc = vi.fn();
const from = vi.fn();
const interpret = vi.fn();
const recordUsage = vi.fn();
const validateHumanPotentialProfileOutput = vi.fn();
const profileOutputForPersistence = vi.fn();

vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity,
}));
vi.mock("@/lib/config/env", () => ({ requireOpenAIEnvironment }));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: () => ({ rpc, from }),
}));
vi.mock("./interpretation-requests", () => ({
  createCurrentInterpretationRequest,
}));
vi.mock("../infrastructure/openai-provider", () => ({
  OpenAIInterpretationProvider: class {
    interpret = interpret;
    recordUsage = recordUsage;
  },
}));
vi.mock("../domain/profile-contract", () => ({
  validateHumanPotentialProfileOutput,
  profileOutputForPersistence,
}));
vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn() }),
}));

const { generateCurrentHumanPotentialProfile, projectStructuredEvidenceValue } =
  await import("./profile-generation");

function requestQuery() {
  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              interpretation_schema_version: "hpi-profile-v1",
              prompt_version: "hpi-openai-v1",
              question_set_version: 1,
              age_band: "18_24",
              is_minor: false,
              safeguarding_review_required: false,
            },
            error: null,
          }),
        }),
      }),
    }),
  };
}

function linksQuery() {
  return {
    select: () => ({
      eq: async () => ({
        data: [
          {
            evidence_record_id: "11111111-1111-4111-8111-111111111111",
          },
        ],
        error: null,
      }),
    }),
  };
}

function evidenceQuery() {
  return {
    select: () => ({
      eq: () => ({
        in: async () => ({
          data: [
            {
              id: "11111111-1111-4111-8111-111111111111",
              source_id: "22222222-2222-4222-8222-222222222222",
              source_version: 1,
              source_key: "discovery_interest",
              category: "interest",
              metadata: { response_type: "reflection" },
              structured_value: {
                response_type: "reflection",
                text: "Teaching",
              },
              sensitivity_level: "standard",
              content_hash: "a".repeat(64),
            },
          ],
          error: null,
        }),
      }),
    }),
  };
}

describe("persisted evidence projection", () => {
  it.each([
    [{ response_type: "reflection", text: "Teaching" }, "Teaching"],
    [
      {
        response_type: "multi_select",
        selected_options: ["Building", "Leading"],
      },
      ["Building", "Leading"],
    ],
    [{ response_type: "scale", numeric: 4 }, 4],
    [{ response_type: "reflection", redacted: true }, null],
    [null, null],
  ])("projects %j into the provider value", (stored, expected) => {
    expect(projectStructuredEvidenceValue(stored)).toEqual(expected);
  });
});

describe("Stage 4 profile generation orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedIdentity.mockResolvedValue({
      user: { id: "33333333-3333-4333-8333-333333333333" },
    });
    requireOpenAIEnvironment.mockReturnValue({
      apiKey: "not-used-by-double",
      model: "gpt-5-mini",
    });
    createCurrentInterpretationRequest.mockResolvedValue({
      ok: true,
      value: { requestId: "44444444-4444-4444-8444-444444444444" },
    });
    rpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({
        data: "55555555-5555-4555-8555-555555555555",
        error: null,
      });
    from.mockImplementation((table: string) => {
      if (table === "interpretation_requests") return requestQuery();
      if (table === "interpretation_request_evidence") return linksQuery();
      return evidenceQuery();
    });
    interpret.mockResolvedValue({ provider: "structured-output" });
    validateHumanPotentialProfileOutput.mockReturnValue({
      ok: true,
      value: { summary: "A provisional profile", insights: [] },
    });
    profileOutputForPersistence.mockReturnValue({
      summary: "A provisional profile",
      metadata: { profile_schema_version: "hpi-profile-v1" },
      insights: [],
    });
  });

  it("moves authenticated Discovery evidence through OpenAI validation into persistence", async () => {
    await expect(generateCurrentHumanPotentialProfile()).resolves.toEqual({
      ok: true,
      profileId: "55555555-5555-4555-8555-555555555555",
    });
    expect(createCurrentInterpretationRequest).toHaveBeenCalledWith({
      schemaVersion: "hpi-profile-v1",
      promptVersion: "hpi-openai-v1",
    });
    expect(rpc).toHaveBeenNthCalledWith(
      1,
      "claim_stage4_interpretation_request",
      expect.objectContaining({
        provider_input: "openai",
        model_input: "gpt-5-mini",
      }),
    );
    expect(interpret).toHaveBeenCalledOnce();
    expect(interpret).toHaveBeenCalledWith(
      expect.objectContaining({
        evidence: [
          expect.objectContaining({
            responseType: "reflection",
            value: "Teaching",
          }),
        ],
      }),
    );
    expect(validateHumanPotentialProfileOutput).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "persist_stage4_human_potential_profile",
      expect.objectContaining({
        profile_summary_input: "A provisional profile",
      }),
    );
    expect(recordUsage).toHaveBeenCalledWith({
      requestId: "44444444-4444-4444-8444-444444444444",
      provider: "openai",
      model: "gpt-5-mini",
    });
  });

  it("does not call OpenAI when authentication fails", async () => {
    requireAuthenticatedIdentity.mockRejectedValue(new Error("AUTH_REQUIRED"));
    await expect(generateCurrentHumanPotentialProfile()).rejects.toThrow(
      "AUTH_REQUIRED",
    );
    expect(interpret).not.toHaveBeenCalled();
  });

  it("generates a validated fallback when OpenAI configuration is missing", async () => {
    requireOpenAIEnvironment.mockImplementation(() => {
      throw new Error("missing");
    });

    await expect(generateCurrentHumanPotentialProfile()).resolves.toEqual({
      ok: true,
      profileId: "55555555-5555-4555-8555-555555555555",
    });
    expect(createCurrentInterpretationRequest).toHaveBeenCalledOnce();
    expect(interpret).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenNthCalledWith(
      1,
      "claim_stage4_interpretation_request",
      expect.objectContaining({
        provider_input: "evidence_fallback",
        model_input: "evidence-fallback-v1",
      }),
    );
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "persist_stage4_human_potential_profile",
      expect.objectContaining({
        profile_metadata_input: expect.objectContaining({
          generation_mode: "evidence_fallback",
          fallback_reason: "OPENAI_ENVIRONMENT_UNAVAILABLE",
        }),
      }),
    );
  });

  it("generates a validated fallback after a privacy-safe OpenAI failure", async () => {
    interpret.mockRejectedValue(new Error("OPENAI_HTTP_403"));

    await expect(generateCurrentHumanPotentialProfile()).resolves.toEqual({
      ok: true,
      profileId: "55555555-5555-4555-8555-555555555555",
    });
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "persist_stage4_human_potential_profile",
      expect.objectContaining({
        profile_metadata_input: expect.objectContaining({
          generation_mode: "evidence_fallback",
          fallback_reason: "OPENAI_HTTP_403",
        }),
      }),
    );
    expect(rpc).not.toHaveBeenCalledWith(
      "fail_stage4_interpretation_request",
      expect.anything(),
    );
  });
});
