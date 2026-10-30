import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  service: vi.fn(),
  start: vi.fn(),
  revalidate: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: m.auth,
}));
vi.mock("../infrastructure/client", () => ({ buildServiceClient: m.service }));
vi.mock("./start-build", () => ({ startBuildForUser: m.start }));
vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
import { saveRealBuild, startRealBuild, improveRealBuild } from "./actions";
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

it("opens a fresh improvement attempt without copying old evidence or calling AI", async () => {
  results = [
    {
      data: {
        id,
        template_id: "template",
        topic: "school",
        minutes: 30,
        focus: "I want to make homework reminders clearer.",
        difficulty: 1,
        challenge: { title: "A useful tracker" },
      },
    },
    { data: null },
    { data: { id: "next" } },
  ];
  const f = new FormData();
  f.set("id", id);
  await expect(improveRealBuild({ ok: false, message: "" }, f)).rejects.toThrow(
    "REDIRECT",
  );
  expect(calls).toContainEqual([
    "insert",
    expect.objectContaining({
      previous_attempt_id: id,
      user_id: "owner",
      focus: "I want to make homework reminders clearer.",
      draft: {
        evidence: "",
        link: "",
        reflection: "",
        nextChange: "",
        outcome: "",
      },
    }),
  ]);
  expect(m.start).not.toHaveBeenCalled();
});
