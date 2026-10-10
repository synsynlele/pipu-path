import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDeletionInventory } from "./deletion-preflight";
vi.mock("server-only", () => ({}));
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: () => ({ rpc }),
}));
const id = "10000000-0000-4000-8000-000000000001";
const inventory = {
  requestId: id,
  status: "pending",
  accountPresent: true,
  storageObjects: 2,
  relations: [
    {
      table: "builder_passport_versions",
      column: "user_id",
      count: 1,
      rule: "restrict",
    },
  ],
  scope: "direct_identity_dependencies_only",
  deleted: false,
  readyToDelete: false,
};
describe("read-only deletion inventory", () => {
  beforeEach(() => rpc.mockReset());
  it("passes only the request identifier to the service-only inventory", async () => {
    rpc.mockResolvedValue({ data: inventory, error: null });
    expect(await getDeletionInventory(id)).toEqual(inventory);
    expect(rpc).toHaveBeenCalledWith("account_deletion_preflight", {
      request_id_input: id,
    });
  });
  it("rejects invalid identifiers without contacting the database", async () => {
    await expect(getDeletionInventory("bad")).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("fails closed on database errors", async () => {
    rpc.mockResolvedValue({ data: inventory, error: { code: "denied" } });
    await expect(getDeletionInventory(id)).rejects.toThrow(
      "PRIVACY_PREFLIGHT_UNAVAILABLE",
    );
  });
  it.each([
    { ...inventory, readyToDelete: true },
    { ...inventory, deleted: true },
    { ...inventory, requestId: "10000000-0000-4000-8000-000000000002" },
    { ...inventory, storageObjects: -1 },
    null,
  ])("refuses malformed, mismatched or misleading results", async (data) => {
    rpc.mockResolvedValue({ data, error: null });
    await expect(getDeletionInventory(id)).rejects.toThrow(
      "PRIVACY_PREFLIGHT_UNAVAILABLE",
    );
  });
});
