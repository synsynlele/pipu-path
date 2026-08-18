import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  issue: vi.fn(),
  revoke: vi.fn(),
  createShare: vi.fn(),
  revokeShare: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("../infrastructure/passport-dal", () => ({
  issueBuilderPassport: mocks.issue,
  revokeBuilderPassport: mocks.revoke,
  createBuilderPassportShare: mocks.createShare,
  revokeBuilderPassportShare: mocks.revokeShare,
}));

import {
  createPassportShareAction,
  issuePassportAction,
  revokePassportAction,
  revokePassportShareAction,
} from "./passport-actions";

const passportId = "33333333-3333-4333-8333-333333333333";
const claimId = "11111111-1111-4111-8111-111111111111";
const evidenceId = "22222222-2222-4222-8222-222222222222";
const shareId = "44444444-4444-4444-8444-444444444444";

function issueForm() {
  const form = new FormData();
  form.set("publicSummary", "Builder working on community systems.");
  form.set("selectedPathName", "Community systems");
  form.append("claimIds", claimId);
  form.append("evidenceIds", evidenceId);
  form.set("consentPolicyVersion", "builder-passport-v1");
  return form;
}

describe("Passport server actions", () => {
  beforeEach(() => {
    mocks.issue.mockReset();
    mocks.revoke.mockReset();
    mocks.createShare.mockReset();
    mocks.revokeShare.mockReset();
    mocks.redirect.mockClear();
  });

  it("returns validation feedback without issuing an invalid Passport", async () => {
    const result = await issuePassportAction({ error: null }, new FormData());
    expect(result.error).toBeTruthy();
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("issues a valid Passport then redirects to the private workspace", async () => {
    mocks.issue.mockResolvedValue(passportId);
    await expect(
      issuePassportAction({ error: null }, issueForm()),
    ).rejects.toThrow("REDIRECT:/passport?issued=1");
    expect(mocks.issue).toHaveBeenCalledWith(
      expect.objectContaining({
        claimIds: [claimId],
        evidenceIds: [evidenceId],
      }),
    );
  });

  it("returns a safe issue error when persistence fails", async () => {
    mocks.issue.mockRejectedValue(new Error("db detail"));
    const result = await issuePassportAction({ error: null }, issueForm());
    expect(result.error).toContain("could not issue");
  });

  it("rejects invalid Passport revocation and handles bounded RPC failure", async () => {
    await expect(revokePassportAction(new FormData())).rejects.toThrow(
      "REDIRECT:/passport?error=passport_revoke_invalid",
    );

    const form = new FormData();
    form.set("passportId", passportId);
    mocks.revoke.mockRejectedValue(new Error("denied"));
    await expect(revokePassportAction(form)).rejects.toThrow(
      "REDIRECT:/passport?error=passport_revoke_failed",
    );
  });

  it("revokes a valid Passport and redirects to confirmation", async () => {
    const form = new FormData();
    form.set("passportId", passportId);
    mocks.revoke.mockResolvedValue(undefined);
    await expect(revokePassportAction(form)).rejects.toThrow(
      "REDIRECT:/passport?revoked=1",
    );
  });

  it("validates share creation before calling persistence", async () => {
    const result = await createPassportShareAction(
      { error: null, relativeUrl: null },
      new FormData(),
    );
    expect(result.relativeUrl).toBeNull();
    expect(result.error).toBeTruthy();
    expect(mocks.createShare).not.toHaveBeenCalled();
  });

  it("returns the one-time relative share URL after creation", async () => {
    const form = new FormData();
    form.set("passportId", passportId);
    form.set("label", "Scholarship");
    form.set("expiresInDays", "7");
    mocks.createShare.mockResolvedValue({
      shareId,
      secret: `ppsp_${"A".repeat(43)}`,
      relativeUrl: `/passport/share/${shareId}#ppsp_${"A".repeat(43)}`,
    });

    const result = await createPassportShareAction(
      { error: null, relativeUrl: null },
      form,
    );
    expect(result.error).toBeNull();
    expect(result.relativeUrl).toContain(`/passport/share/${shareId}#ppsp_`);
  });

  it("does not leak persistence details when share creation fails", async () => {
    const form = new FormData();
    form.set("passportId", passportId);
    form.set("label", "Scholarship");
    form.set("expiresInDays", "7");
    mocks.createShare.mockRejectedValue(new Error("secret db detail"));

    const result = await createPassportShareAction(
      { error: null, relativeUrl: null },
      form,
    );
    expect(result.error).toContain("could not create");
    expect(result.error).not.toContain("secret db detail");
  });

  it("validates, revokes and confirms one Passport share", async () => {
    await expect(revokePassportShareAction(new FormData())).rejects.toThrow(
      "REDIRECT:/passport?error=share_revoke_invalid",
    );

    const form = new FormData();
    form.set("shareId", shareId);
    mocks.revokeShare.mockResolvedValue(undefined);
    await expect(revokePassportShareAction(form)).rejects.toThrow(
      "REDIRECT:/passport?share_revoked=1",
    );
  });

  it("returns a safe route when share revocation persistence fails", async () => {
    const form = new FormData();
    form.set("shareId", shareId);
    mocks.revokeShare.mockRejectedValue(new Error("db detail"));
    await expect(revokePassportShareAction(form)).rejects.toThrow(
      "REDIRECT:/passport?error=share_revoke_failed",
    );
  });
});
