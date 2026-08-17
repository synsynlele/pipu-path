import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BuilderGuideContext } from "../domain/builder-guide-contract";
import { buildEvidenceBasedBuilderGuide } from "./builder-guide-fallback";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  env: vi.fn(),
  getContext: vi.fn(),
  fingerprint: vi.fn(),
  findReusable: vi.fn(),
  countRecent: vi.fn(),
  save: vi.fn(),
  generate: vi.fn(),
  consent: vi.fn(),
  recordEvent: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
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

vi.mock("server-only", () => ({}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mocks.auth,
}));
vi.mock("@/lib/config/env", () => ({
  requireOpenAIEnvironment: mocks.env,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    from: vi.fn(() => consentQuery),
  })),
}));
vi.mock("@/modules/analytics/infrastructure/product-events", () => ({
  recordProductEventForUser: mocks.recordEvent,
}));
vi.mock("../infrastructure/builder-guide-dal", () => ({
  getBuilderGuideContext: mocks.getContext,
  builderGuideContextFingerprint: mocks.fingerprint,
  findReusableBuilderGuideRun: mocks.findReusable,
  countRecentBuilderGuideRuns: mocks.countRecent,
  saveBuilderGuideRun: mocks.save,
}));
vi.mock("../infrastructure/openai-builder-guide-provider", () => ({
  OpenAIBuilderGuideProvider: class {
    generate = mocks.generate;
  },
}));
vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ info: mocks.info, error: mocks.error }),
}));

import { generateBuilderGuide } from "./builder-guide-generation";

const context: BuilderGuideContext = {
  preferredName: "Builder",
  ageBand: "18_24",
  isMinor: false,
  safeguardingReviewRequired: false,
  baseline: {
    id: "11111111-1111-4111-8111-111111111111",
    summary: "A practical Builder exploring problems through completed action.",
  },
  livingProfile: {
    id: "22222222-2222-4222-8222-222222222222",
    version: 3,
    capabilities: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        label: "Project execution",
        level: "demonstrated",
        evidenceCount: 2,
        totalStrength: 4,
        feedbackType: null,
        evidence: [
          {
            sourceTitle: "Useful project",
            summary: "Completed project proof is recorded.",
            href: "/projects/44444444-4444-4444-8444-444444444444",
          },
        ],
      },
    ],
  },
  selectedPath: null,
  current: {
    mission: null,
    journey: {
      id: "55555555-5555-4555-8555-555555555555",
      title: "30-Day Builder Journey",
      status: "active",
    },
    milestone: null,
    quest: {
      id: "66666666-6666-4666-8666-666666666666",
      title: "Interview three users",
      status: "active",
    },
    project: null,
    nextStage: "quests",
  },
  availableDestinations: [
    "profile",
    "journey",
    "current_quest",
    "build",
    "connect",
  ],
};

const validOutput = buildEvidenceBasedBuilderGuide(context, "next_move");

function grantedConsent() {
  return {
    data: {
      policy_version: "2026-07-24",
      status: "granted",
      withdrawn_at: null,
    },
    error: null,
  };
}

describe("Stage 17 Builder Guide generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consentQuery.select.mockReturnValue(consentQuery);
    consentQuery.eq.mockReturnValue(consentQuery);
    consentQuery.order.mockReturnValue(consentQuery);
    consentQuery.limit.mockReturnValue(consentQuery);
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.getContext.mockResolvedValue(context);
    mocks.fingerprint.mockReturnValue("f".repeat(64));
    mocks.findReusable.mockResolvedValue(null);
    mocks.countRecent.mockResolvedValue(0);
    mocks.env.mockReturnValue({ apiKey: "hidden", model: "gpt-5-mini" });
    mocks.consent.mockResolvedValue(grantedConsent());
    mocks.generate.mockResolvedValue(validOutput);
    mocks.save.mockResolvedValue({ id: "run-1" });
    mocks.recordEvent.mockResolvedValue(true);
  });

  it("requires a Living Builder Profile context", async () => {
    mocks.getContext.mockResolvedValue(null);
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: false,
      code: "GUIDE_PROFILE_REQUIRED",
    });
    expect(mocks.consent).not.toHaveBeenCalled();
  });

  it("respects an explicit safeguarding restriction", async () => {
    mocks.getContext.mockResolvedValue({
      ...context,
      safeguardingReviewRequired: true,
    });
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: false,
      code: "GUIDE_UNAVAILABLE",
    });
    expect(mocks.consent).not.toHaveBeenCalled();
  });

  it("requires current AI processing consent", async () => {
    mocks.consent.mockResolvedValue({
      data: {
        policy_version: "2026-07-24",
        status: "withdrawn",
        withdrawn_at: "2026-08-17T18:00:00.000Z",
      },
      error: null,
    });
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: false,
      code: "GUIDE_CONSENT_REQUIRED",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("reuses recent guidance when intent and development context are unchanged", async () => {
    mocks.findReusable.mockResolvedValue({ id: "reused-run" });
    await expect(generateBuilderGuide("next_move")).resolves.toEqual({
      ok: true,
      runId: "reused-run",
      reused: true,
    });
    expect(mocks.countRecent).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.info).toHaveBeenCalledWith(
      "builder_guide_reused",
      expect.objectContaining({ runId: "reused-run" }),
    );
  });

  it("rate-limits new Guide generations", async () => {
    mocks.countRecent.mockResolvedValue(12);
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: false,
      code: "GUIDE_RATE_LIMITED",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("generates, validates, persists and records privacy-safe telemetry", async () => {
    await expect(generateBuilderGuide("next_move")).resolves.toEqual({
      ok: true,
      runId: "run-1",
      reused: false,
    });
    expect(mocks.generate).toHaveBeenCalledWith(context, "next_move");
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        intent: "next_move",
        provider: "openai",
        model: "gpt-5-mini",
        consentPolicyVersion: "2026-07-24",
        advice: validOutput,
      }),
    );
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      "user-1",
      "builder_guide_generated",
      expect.objectContaining({
        runId: "run-1",
        intent: "next_move",
        provider: "openai",
        livingProfileVersion: 3,
      }),
    );
  });

  it("uses deterministic evidence fallback when OpenAI fails", async () => {
    mocks.generate.mockRejectedValue(new Error("OPENAI_HTTP_429"));
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: true,
      runId: "run-1",
    });
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "evidence_fallback",
        model: "evidence-fallback-v1",
      }),
    );
    expect(mocks.info).toHaveBeenCalledWith(
      "builder_guide_generated",
      expect.objectContaining({ fallbackReason: "OPENAI_HTTP_429" }),
    );
  });

  it("uses deterministic fallback when OpenAI configuration is absent", async () => {
    mocks.env.mockImplementation(() => {
      throw new Error("missing");
    });
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: true,
      runId: "run-1",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "evidence_fallback" }),
    );
  });

  it("falls back when provider output cannot be grounded in current evidence", async () => {
    mocks.generate.mockResolvedValue({
      ...validOutput,
      evidenceObservations: [
        {
          claimId: "77777777-7777-4777-8777-777777777777",
          observation:
            "Unknown evidence should be rejected and replaced safely.",
        },
      ],
    });
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: true,
      runId: "run-1",
    });
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "evidence_fallback" }),
    );
  });

  it("returns a safe error when persistence fails", async () => {
    mocks.save.mockRejectedValue(new Error("db failed"));
    await expect(generateBuilderGuide("next_move")).resolves.toMatchObject({
      ok: false,
      code: "GUIDE_SAVE_FAILED",
    });
    expect(mocks.error).toHaveBeenCalledWith(
      "builder_guide_save_failed",
      expect.objectContaining({ intent: "next_move" }),
    );
  });
});
