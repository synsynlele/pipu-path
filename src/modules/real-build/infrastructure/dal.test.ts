import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  service: vi.fn(),
  sign: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: m.auth,
}));
vi.mock("./client", () => ({
  buildServerClient: m.client,
  buildServiceClient: m.service,
}));
import { getOwnedBuild } from "./dal";
let result: unknown, calls: unknown[][];
beforeEach(() => {
  calls = [];
  m.auth.mockResolvedValue({ user: { id: "owner" } });
  m.sign.mockReset();
  m.service.mockReturnValue({
    storage: { from: () => ({ createSignedUrl: m.sign }) },
  });
  m.client.mockResolvedValue({
    from: () => {
      const q: Record<string, unknown> = {};
      for (const method of ["select", "eq"]) {
        q[method] = (...args: unknown[]) => {
          calls.push([method, ...args]);
          return q;
        };
      }
      q.maybeSingle = () => Promise.resolve(result);
      return q;
    },
  });
});
it("does not sign a photo for a missing or foreign owned row", async () => {
  result = { data: null };
  expect(await getOwnedBuild("foreign")).toBeNull();
  expect(calls).toContainEqual(["eq", "user_id", "owner"]);
  expect(m.sign).not.toHaveBeenCalled();
});
it("signs a short-lived private photo only after validating the owned saved record", async () => {
  const challenge = {
    title: "A useful paper tracker",
    outcome: "Test whether a classmate finds a paper tracker useful.",
    steps: Array(5).fill("Draw and test a paper tracker with permission."),
    materials: [],
    evidence: "Describe your test and what changed.",
    safety: "Keep names private and ask permission.",
  };
  result = {
    data: {
      id: "owned",
      challenge,
      draft: {
        evidence: "",
        reflection: "",
        nextChange: "",
        link: "",
        outcome: "",
      },
      image_path: "owner/owned/photo.png",
      previous_attempt_id: null,
    },
  };
  m.sign.mockResolvedValue({
    data: { signedUrl: "https://example.test/private-short-lived" },
  });
  const detail = await getOwnedBuild("owned");
  expect(detail?.imageUrl).toBe("https://example.test/private-short-lived");
  expect(m.sign).toHaveBeenCalledWith("owner/owned/photo.png", 300);
});
