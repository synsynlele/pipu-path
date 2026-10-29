import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const buildPage = readFileSync("src/app/build/page.tsx", "utf8");
const questsPage = readFileSync("src/app/real-quests/page.tsx", "utf8");
const currentQuestPage = readFileSync("src/app/quests/page.tsx", "utf8");

describe("Stage 22 real-work access after Path switching", () => {
  it("redirects old Build bookmarks to a single authenticated Quest hub", () => {
    expect(buildPage).toContain('redirect("/real-quests")');
    expect(questsPage).toContain("requireAuthenticatedHomeState");
    expect(questsPage).toContain('href="/profile"');
    expect(questsPage).toContain("/journey");
  });

  it("retains active owned Quests and projects as real-work routes", () => {
    expect(questsPage).toContain('state.quest?.status === "locked"');
    expect(questsPage).toContain("quest.id");
    expect(questsPage).toContain("/quests");
    expect(currentQuestPage).toContain("getQuestContext");
    expect(currentQuestPage).toContain("getCurrentQuestState");
    expect(currentQuestPage).toContain("getCurrentJourneyState");
  });
});
