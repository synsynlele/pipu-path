import { describe, expect, it } from "vitest";
import { authRateLimitFingerprint } from "./rate-limit-key";

describe("authRateLimitFingerprint", () => {
  it("produces a stable non-reversible key without storing the request identity", () => {
    const identity = "203.0.113.10";
    const first = authRateLimitFingerprint("signin", identity);
    const second = authRateLimitFingerprint("signin", identity);
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain(identity);
    expect(authRateLimitFingerprint("signup", identity)).not.toBe(first);
  });
});
