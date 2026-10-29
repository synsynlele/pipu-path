import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { realWorldMove } from "../../src/modules/city/domain/real-world-move";

const buildPage = readFileSync("src/app/build/page.tsx", "utf8");
const questsPage = readFileSync("src/app/real-quests/page.tsx", "utf8");
const currentQuestPage = readFileSync("src/app/quests/page.tsx", "utf8");

describe("Stage 22 real-work access after Path switching", () => {
  it("redirects old Build bookmarks to a single authenticated Quest hub", () => {
    expect(buildPage).toContain('redirect("/real-quests")');
    expect(questsPage).toContain("requireAuthenticatedHomeState");
    expect(questsPage).toContain('href="/profile"');
    expect(questsPage).toContain("realWorldMove(state)");
    const destination = {
      path: "/journey",
      label: "Activate Journey",
      description: "Next required step",
    };
    expect(realWorldMove({ destination }).href).toBe("/journey");
  });

  it("retains active owned Quests and projects as real-work routes", () => {
    const destination = {
      path: "/onboarding/identity",
      label: "Identity",
      description: "Required",
    };
    expect(
      realWorldMove({
        destination,
        quest: { id: "locked", title: "Locked", status: "locked" },
      }).href,
    ).toBe(destination.path);
    expect(
      realWorldMove({
        destination,
        quest: { id: "owned", title: "Own work", status: "active" },
      }).href,
    ).toBe("/quests/owned");
    expect(
      realWorldMove({
        destination,
        project: { id: "owned", title: "Own build", status: "active" },
      }).href,
    ).toBe("/projects/owned");
    expect(currentQuestPage).toContain("getQuestContext");
    expect(currentQuestPage).toContain("getCurrentQuestState");
    expect(currentQuestPage).toContain("getCurrentJourneyState");
  });
});
