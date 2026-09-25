import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const rpc = vi.fn();
const requireAuthenticatedIdentity = vi.fn();
const getStage4DiscoveryHandoff = vi.fn();
const normalizeCompletedDiscoveryHandoff = vi.fn();
const supersedePriorDiscoveryEvidence = vi.fn();

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
vi.mock("../infrastructure/evidence-lifecycle-dal", () => ({
  supersedePriorDiscoveryEvidence,
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
    getStage4DiscoveryHandoff.mockResolvedValue({
      sessionId: "session",
      responses: [{ sourceId: "response-1" }, { sourceId: "response-2" }],
    });
    normalizeCompletedDiscoveryHandoff.mockReturnValue([{}, {}]);
    supersedePriorDiscoveryEvidence.mockResolvedValue(0);
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
    expect(supersedePriorDiscoveryEvidence).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000001",
      ["response-1", "response-2"],
    );
  });

  it("fails safely if prior Discovery evidence cannot be superseded", async () => {
    rpc.mockResolvedValueOnce({ data: 2, error: null });
    supersedePriorDiscoveryEvidence.mockRejectedValueOnce(
      new Error("lifecycle unavailable"),
    );

    await expect(normalizeCurrentDiscoveryEvidence()).resolves.toEqual({
      ok: false,
      code: "HPI_EVIDENCE_SNAPSHOT_FAILED",
      message:
        "PipuPath could not prepare your latest Discovery evidence. Please try again.",
    });
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
