import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const rpc = vi.fn();
const requireAuthenticatedIdentity = vi.fn();
const getStage4DiscoveryHandoff = vi.fn();
const normalizeCompletedDiscoveryHandoff = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ rpc })),
}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity,
}));
vi.mock("@/modules/discovery/infrastructure/discovery-dal", () => ({
  getStage4DiscoveryHandoff,
}));
vi.mock("./evidence-normalization", () => ({
  normalizeCompletedDiscoveryHandoff,
}));

const {
  createCurrentInterpretationRequest,
  normalizeCurrentDiscoveryEvidence,
} = await import("./interpretation-requests");

describe("Stage 4.1 interpretation requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedIdentity.mockResolvedValue({
      user: { id: "00000000-0000-4000-8000-000000000001" },
    });
    getStage4DiscoveryHandoff.mockResolvedValue({ sessionId: "session" });
    normalizeCompletedDiscoveryHandoff.mockReturnValue([{}, {}]);
  });

  it("returns a safe prerequisite error without making a write", async () => {
    getStage4DiscoveryHandoff.mockResolvedValue(null);

    await expect(normalizeCurrentDiscoveryEvidence()).resolves.toEqual({
      ok: false,
      code: "HPI_DISCOVERY_INCOMPLETE",
      message: "Complete Discovery before preparing interpretation.",
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("normalizes through the controlled RPC and exposes only counts", async () => {
    rpc.mockResolvedValueOnce({ data: 2, error: null });

    await expect(normalizeCurrentDiscoveryEvidence()).resolves.toEqual({
      ok: true,
      value: { normalizedCount: 2, localEvidenceCount: 2 },
    });
    expect(rpc).toHaveBeenCalledWith("normalize_stage4_discovery_evidence");
  });

  it("creates a request only after successful normalization", async () => {
    rpc.mockResolvedValueOnce({ data: 2, error: null }).mockResolvedValueOnce({
      data: "00000000-0000-4000-8000-000000000020",
      error: null,
    });

    await expect(createCurrentInterpretationRequest()).resolves.toEqual({
      ok: true,
      value: { requestId: "00000000-0000-4000-8000-000000000020" },
    });
    expect(rpc).toHaveBeenLastCalledWith(
      "create_stage4_interpretation_request",
      expect.objectContaining({
        interpretation_schema_version_input: "hpi-output-v1",
        prompt_version_input: "placeholder-v1",
      }),
    );
  });

  it("maps controlled RPC errors to safe application messages", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "HPI_CONSENT_REQUIRED" },
    });

    await expect(normalizeCurrentDiscoveryEvidence()).resolves.toEqual({
      ok: false,
      code: "HPI_CONSENT_REQUIRED",
      message: "Human Potential interpretation requires your consent.",
    });
  });
});
