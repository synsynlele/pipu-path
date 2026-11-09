vi.mock("server-only", () => ({}));
import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  auth: vi.fn(),
  service: vi.fn(),
  revalidate: vi.fn(),
  redirect: vi.fn(),
  goalKey: vi.fn(() => "reviewed-finance-goal"),
}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mock.auth,
}));
vi.mock("@/modules/real-build/infrastructure/client", () => ({
  buildServiceClient: mock.service,
}));
vi.mock("@/modules/real-build/infrastructure/goal-key", () => ({
  buildGoalKey: mock.goalKey,
}));
vi.mock("next/cache", () => ({ revalidatePath: mock.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mock.redirect }));

import { startFinancialQuestAction } from "./financial-actions";

type DbResult = { data: unknown; error: null | { code?: string } };
let results: DbResult[];
let calls: Array<[string, ...unknown[]]>;
function request(stage: string) {
  const form = new FormData();
  form.set("stage", stage);
  return form;
}

beforeEach(() => {
  results = [];
  calls = [];
  mock.auth.mockReset();
  mock.auth.mockResolvedValue({
    user: { id: "owner-1" },
    profile: { age_band: "under_13" },
  });
  mock.redirect.mockReset();
  mock.redirect.mockImplementation(() => {
    throw new Error("REDIRECT");
  });
  mock.revalidate.mockClear();
  mock.service.mockImplementation(() => ({
    from: (table: string) => {
      calls.push(["from", table]);
      const query: Record<string, unknown> = {};
      for (const method of [
        "select",
        "eq",
        "in",
        "filter",
        "insert",
        "order",
        "limit",
      ]) {
        query[method] = (...args: unknown[]) => {
          calls.push([method, ...args]);
          return query;
        };
      }
      query.maybeSingle = () => Promise.resolve(results.shift());
      query.single = () => Promise.resolve(results.shift());
      query.then = (resolve: (item: DbResult | undefined) => unknown) =>
        Promise.resolve(results.shift()).then(resolve);
      return query;
    },
  }));
});
describe("Financial Intelligence reviewed Quest action", () => {
  it("rejects unknown stage without identity or database access", async () => {
    const result = await startFinancialQuestAction(
      { status: "idle" },
      request("made_up"),
    );
    expect(result.status).toBe("error");
    expect(mock.auth).not.toHaveBeenCalled();
    expect(calls).toHaveLength(0);
  });

  it("checks age before service-role access", async () => {
    const result = await startFinancialQuestAction(
      { status: "idle" },
      request("responsible_borrowing"),
    );
    expect(result).toEqual({
      status: "error",
      message: "This stage is not available for your age group.",
    });
    expect(calls).toHaveLength(0);
  });

  it("preserves any existing active real Quest instead of replacing it", async () => {
    results = [{ data: { id: "existing-quest" }, error: null }];
    await expect(
      startFinancialQuestAction({ status: "idle" }, request("needs_wants")),
    ).rejects.toThrow("REDIRECT");
    expect(mock.redirect).toHaveBeenCalledWith("/real-quests/existing-quest");
    expect(calls.some(([name]) => name === "insert")).toBe(false);
  });

  it("creates a reviewed and private actor-owned attempt without AI or XP writes", async () => {
    results = [
      { data: null, error: null },
      { data: null, error: null },
      { data: { id: "shared-template" }, error: null },
      { data: { id: "new-attempt" }, error: null },
    ];
    await expect(
      startFinancialQuestAction({ status: "idle" }, request("needs_wants")),
    ).rejects.toThrow("REDIRECT");
    const inserts = calls.filter(([name]) => name === "insert");
    expect(inserts).toHaveLength(2);
    expect(inserts[0]?.[1]).toMatchObject({ source: "reviewed" });
    expect(inserts[1]?.[1]).toMatchObject({
      source: "reviewed",
      user_id: "owner-1",
      template_id: "shared-template",
      difficulty: 1,
    });
    expect(mock.redirect).toHaveBeenCalledWith("/real-quests/new-attempt");
    expect(
      calls.some(
        ([name, target]) =>
          name === "from" &&
          (target === "product_events" || target === "builder_xp"),
      ),
    ).toBe(false);
  });

  it("does not unlock a later stage based on a city choice alone", async () => {
    results = [
      { data: null, error: null },
      { data: [], error: null },
    ];
    const result = await startFinancialQuestAction(
      { status: "idle" },
      request("budgeting"),
    );
    expect(result.status).toBe("error");
    expect(calls.some(([name]) => name === "insert")).toBe(false);
  });
});
