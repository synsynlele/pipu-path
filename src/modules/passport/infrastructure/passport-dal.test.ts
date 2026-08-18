import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  serverRpc: vi.fn(),
  serviceRpc: vi.fn(),
  secret: `ppsp_${"A".repeat(43)}`,
  secretHash: "a".repeat(64),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ rpc: mocks.serverRpc })),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: vi.fn(() => ({ rpc: mocks.serviceRpc })),
}));

vi.mock("./passport-security", () => ({
  generatePassportShareSecret: vi.fn(() => mocks.secret),
  hashPassportShareSecret: vi.fn(() => mocks.secretHash),
}));

import {
  consumePassportShareRateLimit,
  createBuilderPassportShare,
  getBuilderPassportWorkspace,
  issueBuilderPassport,
  resolveBuilderPassportShare,
  revokeBuilderPassport,
  revokeBuilderPassportShare,
} from "./passport-dal";

const claimId = "11111111-1111-4111-8111-111111111111";
const evidenceId = "22222222-2222-4222-8222-222222222222";
const passportId = "33333333-3333-4333-8333-333333333333";
const shareId = "44444444-4444-4444-8444-444444444444";
const profileVersionId = "55555555-5555-4555-8555-555555555555";
const postgresTimestamp = "2026-08-18T10:00:00.123456+00:00";

const workspace = {
  adultEligible: true,
  profile: { displayName: "Ada Builder" },
  activeProfileVersionId: profileVersionId,
  eligibleCapabilities: [
    {
      claimId,
      capabilityKey: "systems-thinking",
      capabilityLabel: "Systems thinking",
      capabilityLevel: "demonstrated",
    },
  ],
  eligibleEvidence: [
    {
      evidenceId,
      claimId,
      capabilityKey: "systems-thinking",
      sourceType: "project",
      sourceTitle: "Community map",
      evidenceSummary:
        "Mapped a community problem and tested a practical response.",
      verification: "pipupath_action",
      occurredAt: postgresTimestamp,
    },
  ],
  eligibleInstitutionVerifications: [],
  eligiblePortfolioProofs: [],
  passports: [
    {
      id: passportId,
      version: 1,
      status: "issued",
      displayName: "Ada Builder",
      publicSummary: "Builder working on useful community systems.",
      selectedPathName: "Community systems",
      issuedAt: postgresTimestamp,
      supersededAt: null,
      revokedAt: null,
    },
  ],
  shares: [
    {
      id: shareId,
      passportId,
      label: "Current share",
      expiresAt: "2099-08-25T10:00:00.123456+00:00",
      lastAccessedAt: null,
      accessCount: 0,
      revokedAt: null,
      createdAt: postgresTimestamp,
    },
    {
      id: "66666666-6666-4666-8666-666666666666",
      passportId,
      label: "Expired share",
      expiresAt: "2000-08-25T10:00:00.123456+00:00",
      lastAccessedAt: "2000-08-20T10:00:00.123456+00:00",
      accessCount: 2,
      revokedAt: null,
      createdAt: "2000-08-18T10:00:00.123456+00:00",
    },
  ],
};

const issueInput = {
  publicSummary: "Builder working on useful community systems.",
  selectedPathName: "Community systems",
  claimIds: [claimId],
  evidenceIds: [evidenceId],
  institutionVerificationIds: [],
  portfolioIds: [],
  consentPolicyVersion: "builder-passport-v1" as const,
};

const publicPassport = {
  schemaVersion: "builder-passport.v1" as const,
  passportId,
  version: 1,
  issuedAt: postgresTimestamp,
  builder: {
    displayName: "Ada Builder",
    publicSummary: "Builder working on useful community systems.",
    selectedPathName: "Community systems",
  },
  capabilities: [
    {
      capabilityKey: "systems-thinking",
      capabilityLabel: "Systems thinking",
      capabilityLevel: "demonstrated",
    },
  ],
  evidence: [
    {
      capabilityKey: "systems-thinking",
      sourceType: "project",
      sourceTitle: "Community map",
      evidenceSummary:
        "Mapped a community problem and tested a practical response.",
      verification: "pipupath_action",
      occurredAt: postgresTimestamp,
    },
  ],
  institutionVerifications: [],
  portfolioProofs: [],
  integrity: {
    state: "current" as const,
    checkedAt: "2026-08-18T11:00:00.123456+00:00",
    notices: [],
  },
  share: { expiresAt: "2026-08-25T10:00:00.123456+00:00" },
};

describe("passport DAL", () => {
  beforeEach(() => {
    mocks.serverRpc.mockReset();
    mocks.serviceRpc.mockReset();
  });

  it("parses Supabase offset timestamps in the owner workspace and derives active share state server-side", async () => {
    mocks.serverRpc.mockResolvedValueOnce({ data: workspace, error: null });

    const result = await getBuilderPassportWorkspace();

    expect(mocks.serverRpc).toHaveBeenCalledWith(
      "get_stage21_builder_passport_workspace",
    );
    expect(result.eligibleEvidence[0]?.occurredAt).toBe(postgresTimestamp);
    expect(result.shares[0]?.active).toBe(true);
    expect(result.shares[1]?.active).toBe(false);
  });

  it("fails closed when the workspace RPC errors or returns an invalid projection", async () => {
    mocks.serverRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "database unavailable" },
    });
    await expect(getBuilderPassportWorkspace()).rejects.toThrow(
      "database unavailable",
    );

    mocks.serverRpc.mockResolvedValueOnce({
      data: { adultEligible: true },
      error: null,
    });
    await expect(getBuilderPassportWorkspace()).rejects.toThrow(
      "PASSPORT_WORKSPACE_INVALID",
    );
  });

  it("issues only the validated selected snapshot through the owner RPC", async () => {
    mocks.serverRpc.mockResolvedValueOnce({ data: passportId, error: null });

    await expect(issueBuilderPassport(issueInput)).resolves.toBe(passportId);
    expect(mocks.serverRpc).toHaveBeenCalledWith(
      "issue_stage21_builder_passport",
      expect.objectContaining({
        claim_ids_input: [claimId],
        evidence_ids_input: [evidenceId],
        consent_policy_version_input: "builder-passport-v1",
      }),
    );
  });

  it("rejects malformed issue input before calling Supabase", async () => {
    await expect(
      issueBuilderPassport({ ...issueInput, claimIds: [] }),
    ).rejects.toThrow();
    expect(mocks.serverRpc).not.toHaveBeenCalled();
  });

  it("surfaces issue and revoke RPC failures", async () => {
    mocks.serverRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "issue denied" },
    });
    await expect(issueBuilderPassport(issueInput)).rejects.toThrow(
      "issue denied",
    );

    mocks.serverRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "revoke denied" },
    });
    await expect(revokeBuilderPassport(passportId)).rejects.toThrow(
      "revoke denied",
    );
  });

  it("creates a share using only the server-generated secret hash at the RPC boundary", async () => {
    mocks.serverRpc.mockResolvedValueOnce({ data: shareId, error: null });

    const result = await createBuilderPassportShare({
      passportId,
      label: "Scholarship",
      expiresInDays: 7,
    });

    expect(mocks.serverRpc).toHaveBeenCalledWith(
      "create_stage21_passport_share",
      {
        passport_id_input: passportId,
        secret_hash_input: mocks.secretHash,
        label_input: "Scholarship",
        expires_in_days_input: 7,
      },
    );
    expect(JSON.stringify(mocks.serverRpc.mock.calls[0])).not.toContain(
      mocks.secret,
    );
    expect(result).toEqual({
      shareId,
      secret: mocks.secret,
      relativeUrl: `/passport/share/${shareId}#${mocks.secret}`,
    });
  });

  it("fails share creation when the RPC does not return a valid share id", async () => {
    mocks.serverRpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(
      createBuilderPassportShare({
        passportId,
        label: "Scholarship",
        expiresInDays: 7,
      }),
    ).rejects.toThrow("PASSPORT_SHARE_CREATE_FAILED");
  });

  it("revokes one owner share through the bounded RPC", async () => {
    mocks.serverRpc.mockResolvedValueOnce({ data: true, error: null });
    await revokeBuilderPassportShare(shareId);
    expect(mocks.serverRpc).toHaveBeenCalledWith(
      "revoke_stage21_passport_share",
      { share_id_input: shareId },
    );
  });

  it("returns durable service-role rate-limit decisions and fails closed on RPC errors", async () => {
    mocks.serviceRpc.mockResolvedValueOnce({ data: true, error: null });
    await expect(consumePassportShareRateLimit("b".repeat(64))).resolves.toBe(
      true,
    );

    mocks.serviceRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "unavailable" },
    });
    await expect(consumePassportShareRateLimit("b".repeat(64))).resolves.toBe(
      false,
    );
  });

  it("accepts offset-aware public Passport timestamps and rejects invalid projections", async () => {
    mocks.serviceRpc.mockResolvedValueOnce({
      data: publicPassport,
      error: null,
    });
    await expect(
      resolveBuilderPassportShare(shareId, mocks.secretHash),
    ).resolves.toEqual(publicPassport);

    mocks.serviceRpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(
      resolveBuilderPassportShare(shareId, mocks.secretHash),
    ).resolves.toBeNull();

    mocks.serviceRpc.mockResolvedValueOnce({
      data: { ...publicPassport, schemaVersion: "unexpected" },
      error: null,
    });
    await expect(
      resolveBuilderPassportShare(shareId, mocks.secretHash),
    ).resolves.toBeNull();
  });
});
