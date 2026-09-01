import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const buildPage = readFileSync("src/app/build/page.tsx", "utf8");

describe("Stage 22 Build access after Path switching", () => {
  it("keeps Build reachable after a Path switch", () => {
    expect(buildPage).toContain("requireAuthenticatedHomeState");
    expect(buildPage).toContain("state.destination.path");
    expect(buildPage).toContain('href="/projects"');
  });

  it("keeps active work routing", () => {
    expect(buildPage).toContain("state.quest?.id");
    expect(buildPage).toContain('state.project.status === "active"');
    expect(buildPage).toContain("`/quests/${state.quest.id}`");
    expect(buildPage).toContain("`/projects/${state.project.id}`");
  });
});
