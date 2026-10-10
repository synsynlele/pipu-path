import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "./page";
const mocks = vi.hoisted(() => ({
  role: "operator" as string | null,
  inventory: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("@/modules/admin/infrastructure/admin-dal", () => ({
  getCurrentPlatformAdminRole: async () => mocks.role,
}));
vi.mock("@/modules/privacy/infrastructure/deletion-preflight", () => ({
  getDeletionInventory: mocks.inventory,
}));
const requestId = "10000000-0000-4000-8000-000000000001";
describe("private deletion inventory route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = "operator";
    mocks.inventory.mockResolvedValue({
      requestId,
      accountPresent: true,
      storageObjects: 0,
      relations: [],
    });
  });
  it.each([null, "analyst", "moderator"])(
    "denies %s before any private read",
    async (role) => {
      mocks.role = role;
      await expect(
        Page({ params: Promise.resolve({ requestId }) }),
      ).rejects.toThrow("NOT_FOUND");
      expect(mocks.inventory).not.toHaveBeenCalled();
    },
  );
  it("rejects malformed request IDs without a private read", async () => {
    await expect(
      Page({ params: Promise.resolve({ requestId: "bad" }) }),
    ).rejects.toThrow("NOT_FOUND");
    expect(mocks.inventory).not.toHaveBeenCalled();
  });
  it.each(["owner", "operator"])(
    "allows %s to inspect a valid request",
    async (role) => {
      mocks.role = role;
      await Page({ params: Promise.resolve({ requestId }) });
      expect(mocks.inventory).toHaveBeenCalledWith(requestId);
    },
  );
});
