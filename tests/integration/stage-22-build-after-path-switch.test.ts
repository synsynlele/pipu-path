import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const buildPage = readFileSync("src/app/build/page.tsx", "utf8");

describe("Stage 22 Build access after Path switching", () => {
  it(
    "keeps Build reachable when a Path switch leaves no current Mission or Journey",
    () => {
      expect(buildPage).toContain('redirect("/projects")');
      expect(buildPage).not.toContain("state.destination.path");
    },
  );

  it("still routes active work directly to the current Project or Quests", () => {
    expect(buildPage).toContain("state.snapshot.activeProjectId");
    expect(buildPage).toContain(
      "redirect(`/projects/${state.snapshot.activeProjectId}`)",
    );
    expect(buildPage).toContain(
      'state.quest || state.snapshot.journeyStatus === "active"',
    );
    expect(buildPage).toContain('redirect("/quests")');
  });
});
