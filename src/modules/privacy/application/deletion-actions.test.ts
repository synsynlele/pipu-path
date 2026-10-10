import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestAccountDeletion,
  reviewDeletionRequest,
  fulfilAccountDeletion,
  takeOverDeletionReviewAction,
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
  fulfil: vi.fn(),
  takeover: vi.fn(),
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
vi.mock("../infrastructure/deletion-fulfilment", () => ({
  fulfilDeletionRequest: mocks.fulfil,
  takeOverDeletionReview: mocks.takeover,
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
    vi.stubEnv("PRIVACY_FULFILMENT_ENABLED", "true");
    mocks.fulfil.mockResolvedValue(undefined);
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

describe("deletion fulfilment authorisation", () => {
  function approval() {
    const data = new FormData();
    data.set("request_id", "10000000-0000-4000-8000-000000000001");
    data.set("confirm_request_id", "10000000-0000-4000-8000-000000000001");
    data.set("review_complete", "on");
    data.set("operator_id", "forged-operator");
    return data;
  }
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = "operator";
    mocks.enabled = true;
    mocks.user = { id: "owner-account", email_confirmed_at: "2026-01-01" };
    vi.stubEnv("PRIVACY_FULFILMENT_ENABLED", "true");
    mocks.fulfil.mockResolvedValue(undefined);
  });
  it.each([null, "moderator", "analyst"])(
    "blocks %s before processing",
    async (role) => {
      mocks.role = role;
      expect(
        (await fulfilAccountDeletion({ status: "idle" }, approval())).status,
      ).toBe("error");
      expect(mocks.fulfil).not.toHaveBeenCalled();
    },
  );
  it("requires the rollout gate", async () => {
    vi.stubEnv("PRIVACY_FULFILMENT_ENABLED", "false");
    expect(
      (await fulfilAccountDeletion({ status: "idle" }, approval())).status,
    ).toBe("error");
    expect(mocks.fulfil).not.toHaveBeenCalled();
  });
  it.each(["confirm_request_id", "review_complete"])(
    "requires %s",
    async (field) => {
      const data = approval();
      data.delete(field);
      expect(
        (await fulfilAccountDeletion({ status: "idle" }, data)).status,
      ).toBe("error");
      expect(mocks.fulfil).not.toHaveBeenCalled();
    },
  );
  it("uses the verified operator rather than form identity", async () => {
    expect(
      (await fulfilAccountDeletion({ status: "idle" }, approval())).status,
    ).toBe("success");
    expect(mocks.fulfil).toHaveBeenCalledWith(
      "10000000-0000-4000-8000-000000000001",
      "owner-account",
    );
  });
  it("requires verified sign-in", async () => {
    mocks.user = null;
    expect(
      (await fulfilAccountDeletion({ status: "idle" }, approval())).status,
    ).toBe("error");
    expect(mocks.fulfil).not.toHaveBeenCalled();
  });
  it("never reports fulfilment when processing fails", async () => {
    mocks.fulfil.mockRejectedValue(new Error("partial"));
    const result = await fulfilAccountDeletion({ status: "idle" }, approval());
    expect(result.status).toBe("error");
    expect(result.message).toContain("not confirmed");
  });
  it("lets a verified backup take over using their session identity", async () => {
    await takeOverDeletionReviewAction(approval());
    expect(mocks.takeover).toHaveBeenCalledWith(
      "10000000-0000-4000-8000-000000000001",
      "owner-account",
    );
  });
  it("blocks unauthorised handover", async () => {
    mocks.role = "analyst";
    await expect(takeOverDeletionReviewAction(approval())).rejects.toThrow(
      "FORBIDDEN",
    );
    expect(mocks.takeover).not.toHaveBeenCalled();
  });
});
