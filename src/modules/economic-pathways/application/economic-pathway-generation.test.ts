import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildEvidenceBasedEconomicPathways } from "./economic-pathway-fallback";
import type { EconomicPathwayContext } from "../domain/economic-pathway-contract";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  env: vi.fn(),
  getContext: vi.fn(),
  getState: vi.fn(),
  recordEvent: vi.fn(),
  generate: vi.fn(),
  consent: vi.fn(),
  upsert: vi.fn(),
  single: vi.fn(),
  info: vi.fn(),
}));

const consentQuery = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  maybeSingle: mocks.consent,
};
consentQuery.select.mockReturnValue(consentQuery);
consentQuery.eq.mockReturnValue(consentQuery);
consentQuery.order.mockReturnValue(consentQuery);
consentQuery.limit.mockReturnValue(consentQuery);

const serviceQuery = {
  upsert: mocks.upsert,
  select: vi.fn(),
  single: mocks.single,
};
mocks.upsert.mockReturnValue(serviceQuery);
serviceQuery.select.mockReturnValue(serviceQuery);

vi.mock("server-only", () => ({}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mocks.auth,
}));
vi.mock("@/lib/config/env", () => ({ requireOpenAIEnvironment: mocks.env }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    from: vi.fn(() => consentQuery),
  })),
}));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => serviceQuery),
  })),
}));
vi.mock("../infrastructure/economic-pathway-dal", () => ({
  asEconomicPathwayClient: (client: unknown) => client,
  getEconomicPathwayContext: mocks.getContext,
  getCurrentEconomicPathwayState: mocks.getState,
  recordProductEventForUser: mocks.recordEvent,
}));
vi.mock("../infrastructure/openai-economic-pathway-provider", () => ({
  OpenAIEconomicPathwayProvider: class {
    generate = mocks.generate;
  },
}));
vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ info: mocks.info }),
}));

import { generateCurrentEconomicPathways } from "./economic-pathway-generation";

const context: EconomicPathwayContext = {
  profileId: "00000000-0000-4000-8000-000000000099",
  summary:
    "The profile suggests communication, initiative and learning through useful practical work.",
  ageBand: "18_24",
  lifeStage: "student",
  isMinor: false,
  safeguardingReviewRequired: false,
  sections: [
    {
      key: "emerging_strengths",
      insights: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          title: "Clear Communication",
          summary:
            "You often make ideas easier for other people to understand.",
          description:
            "Several responses point toward explaining, organising and communicating ideas clearly in practical settings.",
        },
        {
          id: "00000000-0000-4000-8000-000000000002",
          title: "Practical Initiative",
          summary: "You tend to move from ideas toward small practical action.",
          description:
            "Your evidence suggests you learn more when you make, test and improve something instead of only discussing it.",
        },
      ],
    },
    {
      key: "what_draws_you",
      insights: [
        {
          id: "00000000-0000-4000-8000-000000000003",
          title: "Creative Communication",
          summary:
            "You are drawn toward media, explanation and useful creative work.",
          description:
            "Your interests repeatedly combine communication, creativity and making information useful to other people.",
        },
      ],
    },
    {
      key: "best_next_direction",
      insights: [
        {
          id: "00000000-0000-4000-8000-000000000004",
          title: "Test Communication Through Service",
          summary:
            "A useful next step is to test communication through real service.",
          description:
            "A small real-world test can show whether your communication capability is enjoyable, useful and worth developing further.",
        },
      ],
    },
  ],
};
const output = buildEvidenceBasedEconomicPathways(context);

describe("economic pathway generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consentQuery.select.mockReturnValue(consentQuery);
    consentQuery.eq.mockReturnValue(consentQuery);
    consentQuery.order.mockReturnValue(consentQuery);
    consentQuery.limit.mockReturnValue(consentQuery);
    mocks.upsert.mockReturnValue(serviceQuery);
    serviceQuery.select.mockReturnValue(serviceQuery);
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.getContext.mockResolvedValue(context);
    mocks.getState.mockResolvedValue(null);
    mocks.env.mockReturnValue({ model: "gpt-5-mini", apiKey: "hidden" });
    mocks.consent.mockResolvedValue({
      data: {
        policy_version: "2026-07-24",
        status: "granted",
        withdrawn_at: null,
      },
      error: null,
    });
    mocks.generate.mockResolvedValue(output);
    mocks.single.mockResolvedValue({
      data: { id: "00000000-0000-4000-8000-000000000777" },
      error: null,
    });
    mocks.recordEvent.mockResolvedValue(true);
  });

  it("generates, validates and persists the pathway recommendation", async () => {
    await expect(generateCurrentEconomicPathways()).resolves.toEqual({
      ok: true,
      recommendationId: "00000000-0000-4000-8000-000000000777",
    });
    expect(mocks.generate).toHaveBeenCalledWith(context);
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        human_potential_profile_id: context.profileId,
        possible_paths: output.possiblePaths,
        earn_from_strengths: output.earnFromStrengths,
        provider: "openai",
      }),
      { onConflict: "user_id,human_potential_profile_id" },
    );
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      "user-1",
      "possible_paths_generated",
      expect.objectContaining({ generationMode: "openai" }),
    );
  });

  it("uses the evidence fallback when OpenAI fails", async () => {
    mocks.generate.mockRejectedValue(new Error("OPENAI_HTTP_429"));

    await expect(generateCurrentEconomicPathways()).resolves.toMatchObject({
      ok: true,
    });
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "evidence_fallback",
        model: "evidence-fallback-v1",
      }),
      expect.anything(),
    );
    expect(mocks.info).toHaveBeenCalledWith(
      "economic_pathways_generated",
      expect.objectContaining({ generationMode: "evidence_fallback" }),
    );
  });

  it("uses the fallback when OpenAI configuration is absent", async () => {
    mocks.env.mockImplementation(() => {
      throw new Error("missing");
    });

    await expect(generateCurrentEconomicPathways()).resolves.toMatchObject({
      ok: true,
    });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "evidence_fallback" }),
      expect.anything(),
    );
  });

  it("does not regenerate an existing recommendation for the same profile", async () => {
    mocks.getState.mockResolvedValue({
      id: "existing-recommendation",
      profileId: context.profileId,
    });

    await expect(generateCurrentEconomicPathways()).resolves.toEqual({
      ok: true,
      recommendationId: "existing-recommendation",
    });
    expect(mocks.consent).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("requires current AI processing consent", async () => {
    mocks.consent.mockResolvedValue({
      data: {
        policy_version: "2026-07-24",
        status: "withdrawn",
        withdrawn_at: "2026-08-13T08:00:00.000Z",
      },
      error: null,
    });

    await expect(generateCurrentEconomicPathways()).resolves.toEqual({
      ok: false,
      code: "ECONOMIC_PATHWAYS_CONSENT_REQUIRED",
      message: "Possible Paths require your current AI processing consent.",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("respects an explicit safeguarding restriction", async () => {
    mocks.getContext.mockResolvedValue({
      ...context,
      isMinor: true,
      ageBand: "16_17",
      safeguardingReviewRequired: true,
    });

    await expect(generateCurrentEconomicPathways()).resolves.toEqual({
      ok: false,
      code: "ECONOMIC_PATHWAYS_UNAVAILABLE",
      message:
        "Possible Paths are not available for this account at the moment.",
    });
    expect(mocks.consent).not.toHaveBeenCalled();
  });

  it("returns a safe error when persistence fails", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "failed" },
    });

    await expect(generateCurrentEconomicPathways()).resolves.toEqual({
      ok: false,
      code: "ECONOMIC_PATHWAYS_SAVE_FAILED",
      message: "Your possible paths could not be saved. Please try again.",
    });
  });
});
