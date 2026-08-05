import { describe, expect, it } from "vitest";
import { postAuthDestination, safeNextPath } from "./redirects";

describe("safeNextPath", () => {
  it("allows known internal destinations and nested Builder routes", () => {
    expect(safeNextPath("/onboarding/identity")).toBe("/onboarding/identity");
    expect(safeNextPath("/projects/123?tab=proof")).toBe(
      "/projects/123?tab=proof",
    );
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
  });

  it("rejects external, protocol-relative and unknown redirects", () => {
    expect(safeNextPath("https://example.com")).toBe("/app");
    expect(safeNextPath("//example.com")).toBe("/app");
    expect(safeNextPath("/admin")).toBe("/app");
    expect(safeNextPath("/projects\\evil")).toBe("/app");
  });
});

describe("postAuthDestination", () => {
  it("prioritises the next incomplete developmental stage", () => {
    expect(postAuthDestination("/onboarding/identity", "/projects")).toBe(
      "/onboarding/identity",
    );
  });

  it("honours a safe requested route after the developmental loop is ready", () => {
    expect(postAuthDestination("/app", "/portfolio")).toBe("/portfolio");
  });

  it("allows a verified recovery callback to reach password reset", () => {
    expect(
      postAuthDestination("/onboarding/discovery", "/reset-password"),
    ).toBe("/reset-password");
  });
});
