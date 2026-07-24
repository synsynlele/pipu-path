import { beforeEach, describe, expect, it } from "vitest";
import { allowAttempt, clearRateLimitsForTests } from "./rate-limit";

describe("allowAttempt", () => {
  beforeEach(clearRateLimitsForTests);

  it("limits repeated attempts and recovers after the window", () => {
    expect(allowAttempt("a", 2, 100, 0)).toBe(true);
    expect(allowAttempt("a", 2, 100, 1)).toBe(true);
    expect(allowAttempt("a", 2, 100, 2)).toBe(false);
    expect(allowAttempt("a", 2, 100, 101)).toBe(true);
  });
});
