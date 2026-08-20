import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const buildPage = readFileSync("src/app/build/page.tsx", "utf8");

describe("Stage 22 Build access after Path switching", () => {
  it("keeps Build reachable after a Path switch", () => {
    expect(buildPage).toContain(`redirect("/projects")`);
    expect(buildPage).not.toContain("state.destination.path");
  });

  it("keeps active work routing", () => {
    expect(buildPage).toContain("state.snapshot.activeProjectId");
    expect(buildPage).toContain("state.snapshot.journeyStatus");
    expect(buildPage).toContain(`redirect("/quests")`);
  });
});
