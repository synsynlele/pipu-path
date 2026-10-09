import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestAccountDeletion,
  reviewDeletionRequest,
} from "./deletion-actions";

const mocks = vi.hoisted(() => ({
  enabled: true,
  role: "operator" as string | null,
  user: { id: "owner-account", email_confirmed_at: "2026-01-01" } as {
    id: string;
    email_confirmed_at: string;
  } | null,
  save: vi.fn(),
  claim: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: mocks.user }, error: null }),
    },
  }),
}));
vi.mock("@/modules/admin/infrastructure/admin-dal", () => ({
  getCurrentPlatformAdminRole: async () => mocks.role,
}));
vi.mock("../infrastructure/privacy-config", () => ({
  privacyOperationsConfig: () => ({ enabled: mocks.enabled }),
}));
vi.mock("../infrastructure/deletion-requests", () => ({
  saveDeletionRequest: mocks.save,
  claimDeletionRequest: mocks.claim,
}));

function form(confirmed = true) {
  const data = new FormData();
  if (confirmed) data.set("confirm", "on");
  data.set("user_id", "somebody-else");
  return data;
}
describe("privacy request boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enabled = true;
    mocks.role = "operator";
    mocks.user = { id: "owner-account", email_confirmed_at: "2026-01-01" };
    mocks.save.mockResolvedValue({ id: "request-1" });
    mocks.claim.mockResolvedValue(undefined);
  });
  it("saves only the authenticated account, ignoring a forged target", async () => {
    const result = await requestAccountDeletion({ status: "idle" }, form());
    expect(mocks.save).toHaveBeenCalledWith("owner-account");
    expect(result.status).toBe("success");
    expect(result.message).toContain("has not been deleted");
  });
  it("requires explicit confirmation", async () => {
    expect(
      (await requestAccountDeletion({ status: "idle" }, form(false))).status,
    ).toBe("error");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it.each([null, { id: "unverified", email_confirmed_at: "" }])(
    "rejects an absent or unverified session",
    async (user) => {
      mocks.user = user;
      expect(
        (await requestAccountDeletion({ status: "idle" }, form())).status,
      ).toBe("error");
      expect(mocks.save).not.toHaveBeenCalled();
    },
  );
  it("does not save when operations are disabled", async () => {
    mocks.enabled = false;
    expect(
      (await requestAccountDeletion({ status: "idle" }, form())).status,
    ).toBe("error");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("never claims success after persistence fails", async () => {
    mocks.save.mockRejectedValue(new Error("database unavailable"));
    expect(
      (await requestAccountDeletion({ status: "idle" }, form())).status,
    ).toBe("error");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it.each([null, "analyst", "moderator"])(
    "denies review to %s",
    async (role) => {
      mocks.role = role;
      await expect(reviewDeletionRequest(form())).rejects.toThrow("FORBIDDEN");
      expect(mocks.claim).not.toHaveBeenCalled();
    },
  );
  it("lets an operator claim a request using their real identity", async () => {
    const data = form();
    data.set("request_id", "10000000-0000-4000-8000-000000000001");
    await reviewDeletionRequest(data);
    expect(mocks.claim).toHaveBeenCalledWith(
      "10000000-0000-4000-8000-000000000001",
      "owner-account",
    );
  });
  it("rejects malformed identifiers", async () => {
    await expect(reviewDeletionRequest(form())).rejects.toThrow(
      "INVALID_REQUEST",
    );
    expect(mocks.claim).not.toHaveBeenCalled();
  });
  it("rejects review while operations are disabled", async () => {
    mocks.enabled = false;
    await expect(reviewDeletionRequest(form())).rejects.toThrow(
      "PRIVACY_OPERATIONS_DISABLED",
    );
  });
});
