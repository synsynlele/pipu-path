import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  claimDeletionRequest,
  getOwnDeletionRequest,
  listOpenDeletionRequests,
  saveDeletionRequest,
} from "./deletion-requests";
vi.mock("server-only", () => ({}));

const mock = vi.hoisted(() => ({
  single: vi.fn(),
  result: { data: [] as unknown, error: null as { code?: string } | null },
  eq: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleSupabaseClient: () => {
    const query = {
      select: () => query,
      eq: (...args: unknown[]) => {
        mock.eq(...args);
        return query;
      },
      insert: (...args: unknown[]) => {
        mock.insert(...args);
        return query;
      },
      update: (...args: unknown[]) => {
        mock.update(...args);
        return query;
      },
      in: () => query,
      order: () => query,
      limit: () => query,
      maybeSingle: mock.single,
      then: (resolve: (result: typeof mock.result) => unknown) =>
        Promise.resolve(resolve(mock.result)),
    };
    return { from: () => query };
  },
}));

const request = {
  id: "r1",
  user_id: "u1",
  status: "pending",
  created_at: "2026-10-09",
};
describe("deletion request persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.result = { data: [], error: null };
  });
  it("filters private reads to the requester", async () => {
    mock.single.mockResolvedValue({ data: request, error: null });
    expect(await getOwnDeletionRequest("u1")).toEqual(request);
    expect(mock.eq).toHaveBeenCalledWith("user_id", "u1");
  });
  it("reuses an existing request", async () => {
    mock.single.mockResolvedValue({ data: request, error: null });
    expect(await saveDeletionRequest("u1")).toEqual(request);
    expect(mock.insert).not.toHaveBeenCalled();
  });
  it("returns a persisted new request", async () => {
    mock.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: request, error: null });
    expect(await saveDeletionRequest("u1")).toEqual(request);
    expect(mock.insert).toHaveBeenCalledWith({ user_id: "u1" });
  });
  it("recovers a concurrent duplicate using the unique owner constraint", async () => {
    mock.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: { code: "23505" } })
      .mockResolvedValueOnce({ data: request, error: null });
    expect(await saveDeletionRequest("u1")).toEqual(request);
  });
  it("fails closed on read errors", async () => {
    mock.single.mockResolvedValue({ data: null, error: { code: "network" } });
    await expect(getOwnDeletionRequest("u1")).rejects.toThrow(
      "PRIVACY_REQUEST_READ_FAILED",
    );
  });
  it("does not return a request on insert failure", async () => {
    mock.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: { code: "offline" } });
    await expect(saveDeletionRequest("u1")).rejects.toThrow(
      "PRIVACY_REQUEST_SAVE_FAILED",
    );
  });
  it("reads the queue and rejects a failed query", async () => {
    mock.result.data = [request];
    expect(await listOpenDeletionRequests()).toEqual([request]);
    mock.result.error = { code: "offline" };
    await expect(listOpenDeletionRequests()).rejects.toThrow(
      "PRIVACY_QUEUE_READ_FAILED",
    );
  });
  it("claims only pending requests and records the operator", async () => {
    mock.single.mockResolvedValue({ data: { id: "r1" }, error: null });
    await claimDeletionRequest("r1", "operator1");
    expect(mock.eq).toHaveBeenCalledWith("status", "pending");
    expect(mock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "reviewing",
        reviewed_by: "operator1",
      }),
    );
  });
  it("does not report a claim when another operator already claimed it", async () => {
    mock.single.mockResolvedValue({ data: null, error: null });
    await expect(claimDeletionRequest("r1", "operator1")).rejects.toThrow(
      "PRIVACY_REQUEST_CLAIM_FAILED",
    );
  });
});
