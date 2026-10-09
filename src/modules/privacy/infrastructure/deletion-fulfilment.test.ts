import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  runDeletionJob,
  fulfilDeletionRequest,
  type DeletionClient,
} from "./deletion-fulfilment";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  ban: vi.fn(),
  removeUser: vi.fn(),
  removeFiles: vi.fn(),
}));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: () => client,
}));
const client: DeletionClient = {
  rpc: mocks.rpc,
  auth: { admin: { updateUserById: mocks.ban, deleteUser: mocks.removeUser } },
  storage: { from: () => ({ remove: mocks.removeFiles }) },
};
const requestId = "10000000-0000-4000-8000-000000000001";
const operatorId = "10000000-0000-4000-8000-000000000002";
const userId = "10000000-0000-4000-8000-000000000003";
const leaseToken = "10000000-0000-4000-8000-000000000004";
describe("verified retryable account deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockImplementation(async (name) => ({
      data:
        name === "claim_account_deletion_job"
          ? { userId, leaseToken }
          : name === "account_deletion_storage_batch"
            ? []
            : null,
      error: null,
    }));
    mocks.ban.mockResolvedValue({ data: null, error: null });
    mocks.removeUser.mockResolvedValue({ data: null, error: null });
    mocks.removeFiles.mockResolvedValue({ data: null, error: null });
  });
  it("fulfils only after suspension, database purge, empty storage and Auth removal", async () => {
    await runDeletionJob(requestId, operatorId, client);
    expect(mocks.ban).toHaveBeenCalledWith(userId, { ban_duration: "876000h" });
    expect(mocks.rpc.mock.calls.map((x) => x[0])).toEqual([
      "claim_account_deletion_job",
      "purge_account_deletion_data",
      "account_deletion_storage_batch",
      "finish_account_deletion_job",
    ]);
    expect(mocks.removeUser).toHaveBeenCalledWith(userId);
    expect(mocks.removeUser.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.rpc.mock.invocationCallOrder[3],
    );
  });
  it("removes files through Storage and rechecks rather than deleting metadata", async () => {
    let batches = 0;
    mocks.rpc.mockImplementation(async (name) => ({
      data:
        name === "claim_account_deletion_job"
          ? { userId, leaseToken }
          : name === "account_deletion_storage_batch"
            ? batches++ === 0
              ? [
                  { bucket: "quest-evidence", path: "owned/a.png" },
                  { bucket: "quest-evidence", path: "owned/b.png" },
                ]
              : []
            : null,
      error: null,
    }));
    await runDeletionJob(requestId, operatorId, client);
    expect(mocks.removeFiles).toHaveBeenCalledWith([
      "owned/a.png",
      "owned/b.png",
    ]);
    expect(batches).toBe(2);
  });
  it("does not touch an account when claim fails or another worker owns it", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: {} });
    await expect(
      runDeletionJob(requestId, operatorId, client),
    ).rejects.toThrow();
    expect(mocks.ban).not.toHaveBeenCalled();
    expect(mocks.removeUser).not.toHaveBeenCalled();
  });
  it.each([
    "purge_account_deletion_data",
    "account_deletion_storage_batch",
    "finish_account_deletion_job",
  ])(
    "records failure without confirming completion after %s fails",
    async (failed) => {
      const original = mocks.rpc.getMockImplementation()!;
      mocks.rpc.mockImplementation(async (name, ...args) =>
        name === failed ? { data: null, error: {} } : original(name, ...args),
      );
      await expect(
        runDeletionJob(requestId, operatorId, client),
      ).rejects.toThrow("PRIVACY_DELETION_NOT_CONFIRMED");
      expect(mocks.rpc).toHaveBeenCalledWith("fail_account_deletion_job", {
        request_id_input: requestId,
        lease_token_input: leaseToken,
      });
      if (failed !== "finish_account_deletion_job")
        expect(mocks.removeUser).not.toHaveBeenCalled();
    },
  );
  it("retains a failed job when Storage removal fails", async () => {
    const original = mocks.rpc.getMockImplementation()!;
    mocks.rpc.mockImplementation(async (name, ...args) =>
      name === "account_deletion_storage_batch"
        ? {
            data: [{ bucket: "quest-evidence", path: "owned/a.png" }],
            error: null,
          }
        : original(name, ...args),
    );
    mocks.removeFiles.mockResolvedValue({ data: null, error: {} });
    await expect(
      runDeletionJob(requestId, operatorId, client),
    ).rejects.toThrow();
    expect(mocks.removeUser).not.toHaveBeenCalled();
    expect(
      mocks.rpc.mock.calls.some((x) => x[0] === "finish_account_deletion_job"),
    ).toBe(false);
  });
  it("can verify an interrupted run whose Auth user is already absent", async () => {
    mocks.ban.mockResolvedValue({ data: null, error: { status: 404 } });
    mocks.removeUser.mockResolvedValue({ data: null, error: { status: 404 } });
    await runDeletionJob(requestId, operatorId, client);
    expect(mocks.rpc.mock.calls.at(-1)?.[0]).toBe(
      "finish_account_deletion_job",
    );
  });
  it.each(["ban", "removeUser"])(
    "does not complete after %s fails",
    async (failed) => {
      mocks[failed as "ban" | "removeUser"].mockResolvedValue({
        data: null,
        error: { status: 500 },
      });
      await expect(
        runDeletionJob(requestId, operatorId, client),
      ).rejects.toThrow();
      expect(
        mocks.rpc.mock.calls.some(
          (x) => x[0] === "finish_account_deletion_job",
        ),
      ).toBe(false);
    },
  );
  it("remains disabled until deliberately enabled", async () => {
    vi.stubEnv("PRIVACY_FULFILMENT_ENABLED", "false");
    await expect(fulfilDeletionRequest(requestId, operatorId)).rejects.toThrow(
      "PRIVACY_FULFILMENT_DISABLED",
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
