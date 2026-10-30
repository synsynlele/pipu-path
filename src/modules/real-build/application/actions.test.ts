vi.mock("server-only", () => ({}));
import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  service: vi.fn(),
  start: vi.fn(),
  continue: vi.fn(),
  revalidate: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: m.auth,
}));
vi.mock("../infrastructure/client", () => ({ buildServiceClient: m.service }));
vi.mock("./start-build", () => ({ startBuildForUser: m.start }));
vi.mock("./continue-build", () => ({ continueBuildForUser: m.continue }));
vi.mock("../infrastructure/provider", () => ({
  generateBuildTemplate: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
import {
  saveRealBuild,
  startRealBuild,
  improveRealBuild,
  tailorReviewedBuild,
} from "./actions";
const id = "10000000-0000-4000-8000-000000000001";
let calls: unknown[][], results: unknown[];
function form(intent = "save") {
  const f = new FormData();
  Object.entries({
    id,
    version: "1",
    intent,
    evidence:
      "I tested a paper tracker and my classmate found one label confusing.",
    link: "",
    reflection: "The labels needed a worked example.",
    nextChange: "I will add one example.",
    outcome: "not_yet",
  }).forEach(([k, v]) => f.set(k, v));
  return f;
}
beforeEach(() => {
  calls = [];
  results = [];
  m.auth.mockResolvedValue({ user: { id: "owner" } });
  m.service.mockImplementation(() => ({
    from: (table: string) => {
      calls.push(["from", table]);
      const result = results.shift();
      const q: Record<string, unknown> = {};
      for (const method of ["select", "eq", "update", "insert"]) {
        q[method] = (...args: unknown[]) => {
          calls.push([method, ...args]);
          return q;
        };
      }
      q.maybeSingle = () => Promise.resolve(result);
      q.single = () => Promise.resolve(result);
      return q;
    },
  }));
  m.redirect.mockImplementation(() => {
    throw new Error("REDIRECT");
  });
  m.start.mockReset();
  m.continue.mockReset();
  m.redirect.mockClear();
});
it("requires identity authorization before any mutation", async () => {
  m.auth.mockRejectedValue(new Error("AUTH_REQUIRED"));
  await expect(
    saveRealBuild({ ok: false, message: "" }, form()),
  ).rejects.toThrow("AUTH_REQUIRED");
  expect(calls).toHaveLength(0);
});
it("keeps incomplete evidence from being recorded", async () => {
  const f = form("record");
  f.set("evidence", "nothing");
  expect((await saveRealBuild({ ok: false, message: "" }, f)).ok).toBe(false);
  expect(calls).toHaveLength(0);
});
it("saves private notes with ownership and version guards and no XP write", async () => {
  results = [
    { data: { status: "active", version: 1, image_path: null } },
    { data: { id } },
  ];
  const result = await saveRealBuild({ ok: false, message: "" }, form());
  expect(result).toEqual({ ok: true, message: expect.any(String), version: 2 });
  expect(calls).toContainEqual(["eq", "user_id", "owner"]);
  expect(calls).toContainEqual(["eq", "version", 1]);
  expect(calls).toContainEqual([
    "update",
    expect.objectContaining({ status: "active", version: 2 }),
  ]);
  expect(
    calls
      .filter((c) => c[0] === "from")
      .every((c) => c[1] === "real_build_attempts"),
  ).toBe(true);
});
it("rejects stale or foreign attempts without overwriting the record", async () => {
  results = [{ data: { status: "active", version: 2 } }];
  expect(
    (await saveRealBuild({ ok: false, message: "" }, form())).message,
  ).toContain("another tab");
  expect(calls.some((c) => c[0] === "update")).toBe(false);
  results = [{ data: null }];
  expect((await saveRealBuild({ ok: false, message: "" }, form())).ok).toBe(
    false,
  );
});
it("records an honest unsuccessful attempt only after saving evidence and reflection", async () => {
  results = [
    { data: { status: "active", version: 1, image_path: null } },
    { data: { id } },
  ];
  await expect(
    saveRealBuild({ ok: false, message: "" }, form("record")),
  ).rejects.toThrow("REDIRECT");
  expect(calls).toContainEqual([
    "update",
    expect.objectContaining({
      status: "recorded",
      draft: expect.objectContaining({ outcome: "not_yet" }),
    }),
  ]);
});
it("does not forward extra prose to the template generator", async () => {
  m.start.mockResolvedValue(id);
  const f = new FormData();
  f.set("topic", "school");
  f.set("minutes", "30");
  f.set("focus", "I want to make homework reminders clearer.");
  f.set("private_answers", "private student text");
  await expect(startRealBuild({ ok: false, message: "" }, f)).rejects.toThrow(
    "REDIRECT",
  );
  expect(m.start).toHaveBeenCalledWith("owner", {
    topic: "school",
    minutes: 30,
    focus: "I want to make homework reminders clearer.",
  });
});

it("requires explicit use of saved notes before requesting a continuation", async () => {
  const f = new FormData();
  f.set("id", id);
  expect((await improveRealBuild({ ok: false, message: "" }, f)).ok).toBe(
    false,
  );
  expect(m.continue).not.toHaveBeenCalled();
  f.set("useNotes", "yes");
  m.continue.mockResolvedValue("next");
  await expect(improveRealBuild({ ok: false, message: "" }, f)).rejects.toThrow(
    "REDIRECT",
  );
  expect(m.continue).toHaveBeenCalledWith("owner", id);
  expect(m.redirect).toHaveBeenCalledWith("/real-quests/next");
});
it("keeps continuation failures recoverable without exposing provider details", async () => {
  const f = new FormData();
  f.set("id", id);
  f.set("useNotes", "yes");
  m.continue.mockRejectedValue(new Error("OPENAI_TIMEOUT"));
  const answer = await improveRealBuild({ ok: false, message: "" }, f);
  expect(answer.ok).toBe(false);
  expect(answer.message).toContain("notes are safe");
  expect(m.redirect).not.toHaveBeenCalled();
});

it("protects an existing reviewed Quest with saved evidence from silent AI replacement", async () => {
  results = [
    {
      data: {
        id,
        user_id: "owner",
        source: "reviewed",
        status: "active",
        topic: "technology",
        minutes: 30,
        focus: "I want to reduce unplanned social-media scrolling.",
        difficulty: 1,
        version: 1,
        draft: {
          evidence: "I have already worked on this routine.",
          reflection: "",
          nextChange: "",
          link: "",
        },
      },
    },
  ];
  const request = new FormData();
  request.set("id", id);
  const result = await tailorReviewedBuild({ ok: false, message: "" }, request);
  expect(result.ok).toBe(false);
  expect(result.message).toContain("evidence");
  expect(calls.some((call) => call[0] === "insert")).toBe(false);
});

it("validates adaptive discovery at the server boundary and forwards only selected options", async () => {
  const request = new FormData();
  for (const [key, value] of Object.entries({
    topic: "school",
    minutes: "30",
    focus: "I want to help classmates learn useful skills.",
    kind: "community",
    setting: "school",
    obstacle: "automatic",
    resources: "support",
    private_notes: "never forward me",
  }))
    request.set(key, value);
  const invalid = await startRealBuild({ ok: false, message: "" }, request);
  expect(invalid.ok).toBe(false);
  expect(m.start).not.toHaveBeenCalled();
  request.set("obstacle", "coordination");
  m.start.mockResolvedValue(id);
  await expect(
    startRealBuild({ ok: false, message: "" }, request),
  ).rejects.toThrow("REDIRECT");
  expect(m.start).toHaveBeenCalledWith("owner", {
    topic: "school",
    minutes: 30,
    focus: "I want to help classmates learn useful skills.",
    discovery: {
      kind: "community",
      setting: "school",
      obstacle: "coordination",
      resources: "support",
    },
  });
});
