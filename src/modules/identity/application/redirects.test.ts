import { describe, expect, it } from "vitest";
import { postAuthDestination, safeNextPath } from "./redirects";

describe("safeNextPath", () => {
  it("allows known internal destinations and nested Builder routes", () => {
    expect(safeNextPath("/onboarding/identity")).toBe("/onboarding/identity");
    expect(safeNextPath("/projects/123?tab=proof")).toBe(
      "/projects/123?tab=proof",
    );
    expect(safeNextPath("/guardian")).toBe("/guardian");
    expect(safeNextPath("/onboarding/guardian")).toBe("/onboarding/guardian");
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
    expect(safeNextPath("/build/play?quest=abc")).toBe("/build/play?quest=abc");
    expect(safeNextPath("/build/adventures")).toBe("/build/adventures");
    expect(safeNextPath("/real-quests?district=power")).toBe(
      "/real-quests?district=power",
    );
    expect(safeNextPath("/build/play/neighbourhood-garden-v1")).toBe(
      "/build/play/neighbourhood-garden-v1",
    );
    expect(safeNextPath("/build/unknown")).toBe("/app");
    expect(safeNextPath("/build/neighbourhood")).toBe("/build/neighbourhood");
    expect(safeNextPath("/build/neighbourhood-evil")).toBe("/app");
  });

  it("rejects external, protocol-relative and unknown redirects", () => {
    expect(safeNextPath("https://example.com")).toBe("/app");
    expect(safeNextPath("//example.com")).toBe("/app");
    expect(safeNextPath("/admin")).toBe("/app");
    expect(safeNextPath("/projects\\evil")).toBe("/app");
  });
});

describe("postAuthDestination", () => {
  it("allows account deletion before onboarding is complete", () => {
    expect(
      postAuthDestination("/onboarding/identity", "/account-deletion"),
    ).toBe("/account-deletion");
    expect(safeNextPath("/account-deletion")).toBe("/account-deletion");
    expect(safeNextPath("/account-deletion-evil")).toBe("/app");
  });
  it("keeps privacy controls available before parent approval", () => {
    expect(
      postAuthDestination("/onboarding/guardian", "/account-privacy"),
    ).toBe("/account-privacy");
  });

  it("lets an adult reach guardian approval after identity without completing their own adventure", () => {
    expect(postAuthDestination("/onboarding/discovery", "/guardian")).toBe(
      "/guardian",
    );
    expect(postAuthDestination("/onboarding/identity", "/guardian")).toBe(
      "/onboarding/identity",
    );
  });

  it("prioritises the next incomplete developmental stage", () => {
    expect(postAuthDestination("/onboarding/identity", "/projects")).toBe(
      "/onboarding/identity",
    );
  });

  it("honours a safe requested route after the developmental loop is ready", () => {
    expect(postAuthDestination("/app", "/portfolio")).toBe("/portfolio");
    expect(postAuthDestination("/app", "/real-quests")).toBe("/real-quests");
    expect(postAuthDestination("/app", "/build/adventures")).toBe(
      "/build/adventures",
    );
    expect(
      postAuthDestination("/app", "/build/play/neighbourhood-garden-v1"),
    ).toBe("/build/play/neighbourhood-garden-v1");
  });

  it("allows a verified recovery callback to reach password reset", () => {
    expect(
      postAuthDestination("/onboarding/discovery", "/reset-password"),
    ).toBe("/reset-password");
  });
});
