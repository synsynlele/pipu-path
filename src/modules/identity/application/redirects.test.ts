import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirects";

describe("safeNextPath", () => {
  it("allows known internal destinations", () => {
    expect(safeNextPath("/onboarding/identity")).toBe("/onboarding/identity");
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
  });

  it("rejects external and unknown redirects", () => {
    expect(safeNextPath("https://example.com")).toBe("/app");
    expect(safeNextPath("//example.com")).toBe("/app");
    expect(safeNextPath("/admin")).toBe("/app");
  });
});
