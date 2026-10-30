import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ service: vi.fn(), generate: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("../infrastructure/client", () => ({ buildServiceClient: m.service }));
vi.mock("../infrastructure/provider", () => ({
  generateBuildTemplate: m.generate,
}));
import { continueBuildForUser } from "./continue-build";
const challenge = {
  title: "Run a focus-session service",
  outcome: "Help a consenting peer focus on one useful task.",
  steps: Array(5).fill("Set up and test a safe focus session with permission."),
  materials: ["Existing timer"],
  evidence: "Record interruptions in actual use.",
  safety: "Ask permission and keep private details out.",
};
const old = {
  id: "previous",
  user_id: "owner",
  template_id: "public-origin",
  topic: "technology",
  minutes: 30,
  focus: "Help peers reduce unplanned scrolling.",
  difficulty: 1,
  challenge,
  draft: {
    evidence: "We ran a ten-minute session but the alarm distracted us.",
    reflection: "A quiet signal would be easier to use.",
    nextChange: "Use a silent timer and test again.",
    outcome: "partly",
    link: "https://private.test/evidence",
  },
  image_path: "owner/private.jpg",
};
const nextChallenge = {
  ...challenge,
  title: "Test a quieter focus-session setup",
  steps: Array(5).fill(
    "Configure a silent timer and test the revised session with permission.",
  ),
};
let results: unknown[], calls: unknown[][];
beforeEach(() => {
  results = [];
  calls = [];
  m.generate.mockReset();
  m.generate.mockResolvedValue(nextChallenge);
  m.service.mockReturnValue({
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
        "order",
        "limit",
        "insert",
        "delete",
      ])
        q[method] = (...args: unknown[]) => {
          calls.push([method, ...args]);
          return q;
        };
      q.maybeSingle = q.single = () => Promise.resolve(result);
      return q;
    },
    rpc: async (...args: unknown[]) => {
      calls.push(["rpc", ...args]);
      return results.shift();
    },
  });
});
function ready(tail: unknown = { data: { id: "next" } }) {
  results = [
    { data: old },
    { data: null },
    { data: null },
    { data: true },
    { data: null },
    { data: "allowed" },
    tail,
    { data: null },
  ];
}
it("generates from owned recorded work and saves a private linked iteration with empty evidence", async () => {
  ready();
  expect(await continueBuildForUser("owner", "previous")).toBe("next");
  expect(calls).toContainEqual(["eq", "user_id", "owner"]);
  expect(calls).toContainEqual(["eq", "status", "recorded"]);
  expect(m.generate.mock.calls[0][3]).toEqual({
    previousSolution: challenge,
    reportedOutcome: "partly",
    whatWasDone: old.draft.evidence,
    whatWasLearned: old.draft.reflection,
    plannedChange: old.draft.nextChange,
  });
  expect(JSON.stringify(m.generate.mock.calls)).not.toMatch(
    /private\.test|private\.jpg|user_id/,
  );
  expect(calls).toContainEqual([
    "insert",
    expect.objectContaining({
      previous_attempt_id: "previous",
      template_id: "public-origin",
      challenge: nextChallenge,
      draft: {
        evidence: "",
        reflection: "",
        nextChange: "",
        outcome: "",
        link: "",
      },
    }),
  ]);
  expect(
    calls
      .filter((c) => c[0] === "from")
      .every((c) => c[1] !== "real_build_templates"),
  ).toBe(true);
  expect(calls).toContainEqual(["delete"]);
});
it("rejects a foreign, missing or unrecorded parent before AI or writes", async () => {
  results = [{ data: null }];
  await expect(continueBuildForUser("owner", "foreign")).rejects.toThrow(
    "BUILD_PREVIOUS_MISSING",
  );
  expect(m.generate).not.toHaveBeenCalled();
  expect(calls.some((c) => c[0] === "insert")).toBe(false);
});
it("reopens active work and an existing successor without another AI charge", async () => {
  results = [{ data: old }, { data: { id: "active" } }];
  expect(await continueBuildForUser("owner", "previous")).toBe("active");
  results = [
    { data: old },
    { data: null },
    { data: { id: "already-continued" } },
  ];
  expect(await continueBuildForUser("owner", "previous")).toBe(
    "already-continued",
  );
  expect(m.generate).not.toHaveBeenCalled();
});
it("respects the shared generation lease and AI allowance", async () => {
  ready();
  results[3] = { data: false };
  await expect(continueBuildForUser("owner", "previous")).rejects.toThrow(
    "BUILD_BUSY",
  );
  ready();
  results[5] = { data: null };
  await expect(continueBuildForUser("owner", "previous")).rejects.toThrow(
    "BUILD_AI_LIMIT",
  );
  expect(m.generate).not.toHaveBeenCalled();
  expect(calls).toContainEqual(["delete"]);
});
it("does not save a repeated or unsafe AI guide and releases the lease", async () => {
  ready();
  m.generate.mockResolvedValue(challenge);
  await expect(continueBuildForUser("owner", "previous")).rejects.toThrow(
    "BUILD_REPEATED",
  );
  ready();
  m.generate.mockResolvedValue({
    ...nextChallenge,
    safety: "Borrow money for a timer.",
  });
  await expect(continueBuildForUser("owner", "previous")).rejects.toThrow(
    "BUILD_UNSAFE",
  );
  expect(calls.some((c) => c[0] === "insert")).toBe(false);
  expect(calls).toContainEqual(["delete"]);
});
it("keeps previous records untouched on AI and save failures", async () => {
  ready();
  m.generate.mockRejectedValue(new Error("OPENAI_TIMEOUT"));
  await expect(continueBuildForUser("owner", "previous")).rejects.toThrow(
    "OPENAI_TIMEOUT",
  );
  ready({ error: { code: "NETWORK" } });
  m.generate.mockResolvedValue(nextChallenge);
  await expect(continueBuildForUser("owner", "previous")).rejects.toThrow(
    "BUILD_SAVE_FAILED",
  );
  expect(calls.some((c) => c[0] === "update")).toBe(false);
});
it("returns the active winner if another request creates a Quest during generation", async () => {
  ready({ error: { code: "23505" } });
  results.splice(7, 0, { data: { id: "winner" } });
  expect(await continueBuildForUser("owner", "previous")).toBe("winner");
});

it("rechecks for a saved successor after acquiring the generation lease", async () => {
  ready();
  results[4] = { data: { id: "saved-in-another-tab" } };
  expect(await continueBuildForUser("owner", "previous")).toBe(
    "saved-in-another-tab",
  );
  expect(m.generate).not.toHaveBeenCalled();
  expect(calls.filter((c) => c[0] === "rpc").map((c) => c[1])).toEqual([
    "claim_real_build_generation",
  ]);
  expect(calls).toContainEqual(["delete"]);
});
