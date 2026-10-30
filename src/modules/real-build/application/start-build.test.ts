import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ service: vi.fn(), generate: vi.fn() }));
vi.mock("../infrastructure/client", () => ({ buildServiceClient: m.service }));
vi.mock("../infrastructure/provider", () => ({
  generateBuildTemplate: m.generate,
}));
vi.mock("server-only", () => ({}));
import { startBuildForUser } from "./start-build";
import { createHash } from "node:crypto";
const challenge = {
  title: "Introduce a working homework reminder",
  outcome: "Make one genuine homework reminder easier to follow.",
  steps: Array(5).fill("Set up and test a safe working reminder with permission."),
  materials: ["Existing phone reminder"],
  evidence: "Describe the working reminder and actual result.",
  safety: "Ask permission and keep names private.",
};
const choice = {
  topic: "school",
  minutes: 30,
  focus: "I want to help students track homework more clearly.",
};
const focusKey = createHash("sha256")
  .update("hands-on-v2:" + choice.focus.toLowerCase())
  .digest("hex");
const template = {
  id: "template",
  challenge,
  topic: "school",
  minutes: 30,
  difficulty: 1,
  focus_key: focusKey,
  source: "openai",
};
let results: unknown[], calls: unknown[][];
function service() {
  return {
    from: (table: string) => {
      calls.push(["from", table]);
      const result = results.shift();
      const q: Record<string, unknown> = {
        then: (resolve: (v: unknown) => void) =>
          Promise.resolve(result).then(resolve),
      };
      for (const method of [
        "select",
        "eq",
        "neq",
        "order",
        "limit",
        "insert",
        "delete",
      ]) {
        q[method] = (...args: unknown[]) => {
          calls.push([method, ...args]);
          return q;
        };
      }
      q.maybeSingle = () => Promise.resolve(result);
      q.single = () => Promise.resolve(result);
      return q;
    },
    rpc: vi.fn(async (...args: unknown[]) => {
      calls.push(["rpc", ...args]);
      return results.shift();
    }),
  };
}
beforeEach(() => {
  results = [];
  calls = [];
  m.service.mockImplementation(service);
  m.generate.mockReset();
});
it("returns the owned current attempt without invoking AI", async () => {
  results = [{ data: { id: "existing" } }];
  expect(await startBuildForUser("owner", choice)).toBe("existing");
  expect(calls).toContainEqual(["eq", "user_id", "owner"]);
  expect(m.generate).not.toHaveBeenCalled();
});
it("reuses an unseen validated public template with a new private attempt", async () => {
  results = [
    { data: null },
    { data: 1 },
    { data: [template] },
    { data: { id: "new" } },
  ];
  expect(await startBuildForUser("owner", choice)).toBe("new");
  expect(m.generate).not.toHaveBeenCalled();
  expect(calls).toContainEqual([
    "insert",
    expect.objectContaining({
      user_id: "owner",
      focus: choice.focus,
      template_id: "template",
      source: "openai",
    }),
  ]);
});
it("excludes previously tried templates and releases the lease if AI fails", async () => {
  results = [
    { data: null },
    { data: 1 },
    { data: [] },
    { data: [template] },
    { data: true },
    { data: "request" },
    { data: null },
  ];
  m.generate.mockRejectedValue(new Error("OPENAI_TIMEOUT"));
  await expect(startBuildForUser("owner", choice)).rejects.toThrow(
    "OPENAI_TIMEOUT",
  );
  expect(calls).toContainEqual(["from", "real_build_generation_leases"]);
  expect(calls.filter((c) => c[0] === "insert")).toHaveLength(0);
});
it("avoids duplicate provider work when another request holds the authoring lease", async () => {
  results = [
    { data: null },
    { data: 1 },
    { data: [] },
    { data: [] },
    { data: false },
  ];
  await expect(startBuildForUser("owner", choice)).rejects.toThrow(
    "BUILD_BUSY",
  );
  expect(m.generate).not.toHaveBeenCalled();
});
it("resolves a concurrent active-attempt insert by returning the winning owned row", async () => {
  results = [
    { data: null },
    { data: 1 },
    { data: [template] },
    { error: { code: "23505" } },
    { data: { id: "winner" } },
  ];
  expect(await startBuildForUser("owner", choice)).toBe("winner");
});
it("never persists an unsafe cached template", async () => {
  results = [
    { data: null },
    { data: 1 },
    {
      data: [
        {
          ...template,
          challenge: {
            ...challenge,
            evidence: "Invent a result if necessary.",
          },
        },
      ],
    },
  ];
  await expect(startBuildForUser("owner", choice)).rejects.toThrow(
    "BUILD_UNSAFE",
  );
  expect(calls.filter((c) => c[0] === "insert")).toHaveLength(0);
});

it("matches cache and new attempts to a higher, server-computed level", async () => {
  results = [
    { data: null },
    { data: 3 },
    { data: [{ ...template, difficulty: 3 }] },
    { data: { id: "higher" } },
  ];
  await expect(startBuildForUser("owner", choice)).resolves.toBe("higher");
  expect(calls).toContainEqual([
    "rpc",
    "next_real_build_difficulty",
    {
      user_input: "owner",
      topic_input: "school",
    },
  ]);
  expect(calls).toContainEqual([
    "rpc",
    "find_unseen_real_build_template_for_goal",
    {
      user_input: "owner",
      topic_input: "school",
      minutes_input: 30,
      difficulty_input: 3,
      focus_key_input: focusKey,
    },
  ]);
  expect(calls).toContainEqual([
    "insert",
    expect.objectContaining({ difficulty: 3 }),
  ]);
});

it("rejects an unexpectedly different cached difficulty before saving progress", async () => {
  results = [{ data: null }, { data: 4 }, { data: [template] }];
  await expect(startBuildForUser("owner", choice)).rejects.toThrow(
    "BUILD_LOAD_FAILED",
  );
  expect(calls.filter((c) => c[0] === "insert")).toHaveLength(0);
});
