import { describe, expect, it } from "vitest";
import { realWorldMove } from "./real-world-move";
import { cityInspiration, cityInterests } from "./city-inspiration";
const destination = {
  path: "/onboarding/discovery",
  label: "Begin Discovery",
  description: "Prepare a personal direction.",
};
describe("from play to truthful real-world action", () => {
  it("preserves prerequisites and never exposes a locked Quest", () => {
    expect(
      realWorldMove({
        destination,
        quest: { id: "private", title: "Locked", status: "locked" },
      }).href,
    ).toBe(destination.path);
    expect(realWorldMove({ destination }).href).toBe(destination.path);
  });
  it("continues an actual Quest and prioritises its reflection", () => {
    const quest = {
      id: "owned",
      title: "Improve a shared space",
      status: "active",
    };
    expect(realWorldMove({ destination, quest }).href).toBe("/quests/owned");
    expect(
      realWorldMove({
        destination,
        quest: { ...quest, status: "evidence_submitted" },
      }).label,
    ).toBe("Reflect on my attempt");
    expect(
      realWorldMove({ destination, quest: { ...quest, status: "completed" } })
        .href,
    ).toBe(destination.path);
  });
  it("keeps an active Project and all 14 authored inspirations available", () => {
    expect(
      realWorldMove({
        destination,
        project: { id: "p", title: "Community design", status: "active" },
      }).href,
    ).toBe("/projects/p");
    expect(cityInterests).toHaveLength(14);
    expect(cityInspiration("water")?.idea).toContain(
      "do not test drinking-water safety",
    );
    expect(cityInspiration("https://bad.test")).toBeNull();
    expect(cityInspiration(["water"])).toBeNull();
  });
});
