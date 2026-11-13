vi.mock("server-only", () => ({}));
import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  identity: vi.fn(),
  client: vi.fn(),
}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mock.identity,
}));
vi.mock("@/modules/real-build/infrastructure/client", () => ({
  buildServerClient: mock.client,
}));
import { getPrivateFinancialAttemptSummaries } from "./financial-dal";

const calls: unknown[][] = [];
let response: { data: unknown[]; error: null | { message: string } };
beforeEach(() => {
  calls.length = 0;
  mock.identity.mockReset();
  mock.identity.mockResolvedValue({ user: { id: "current-builder" } });
  response = { data: [], error: null };
  mock.client.mockImplementation(async () => ({
    from: (table: string) => {
      calls.push(["from", table]);
      const query: Record<string, unknown> = {};
      for (const key of ["select", "eq", "in", "order", "limit"]) {
        query[key] = (...args: unknown[]) => {
          calls.push([key, ...args]);
          return query;
        };
      }
      query.then = (fn: (result: typeof response) => unknown) =>
        Promise.resolve(response).then(fn);
      return query;
    },
  }));
});

it("uses authenticated owner-scoped, recorded and reviewed evidence only", async () => {
  response = {
    data: [
      {
        id: "private-attempt-1",
        challenge: { title: "Financial Intelligence 01 — Put needs before wants" },
        recorded_at: "2026-11-11T10:00:00Z",
      },
      { id: "other", challenge: { title: "Not a finance Quest" }, recorded_at: null },
    ],
    error: null,
  };
  const attempts = await getPrivateFinancialAttemptSummaries();
  expect(attempts).toEqual([
    {
      id: "private-attempt-1",
      stageTitle: "Needs and wants",
      recordedAt: "2026-11-11T10:00:00Z",
    },
  ]);
  expect(calls).toContainEqual(["eq", "user_id", "current-builder"]);
  expect(calls).toContainEqual(["eq", "status", "recorded"]);
  expect(calls).toContainEqual(["eq", "source", "reviewed"]);
  expect(calls).not.toContainEqual(["from", "builder_project_portfolios"]);
  expect(calls).not.toContainEqual(["from", "builder_projects"]);
});

it("fails closed without guardian-authorized identity or an owner-scoped DB read", async () => {
  mock.identity.mockRejectedValueOnce(new Error("GUARDIAN_AUTH_REQUIRED"));
  await expect(getPrivateFinancialAttemptSummaries()).rejects.toThrow(
    "GUARDIAN_AUTH_REQUIRED",
  );
  expect(calls).toHaveLength(0);
});
