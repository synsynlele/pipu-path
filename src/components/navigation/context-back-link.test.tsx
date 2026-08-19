import { describe, expect, it } from "vitest";
import { parentNavigationForPath } from "./context-back-link";

describe("parentNavigationForPath", () => {
  it.each([
    ["/quests/quest-1", "/quests"],
    ["/quests/quest-1/complete", "/quests/quest-1"],
    ["/projects/new", "/projects"],
    ["/projects/project-1", "/projects"],
    ["/portfolio/project-1", "/portfolio"],
    ["/portfolio/project-1/preview", "/portfolio/project-1"],
    ["/opportunities/opportunity-1", "/opportunities"],
    ["/opportunities/opportunity-1/apply", "/opportunities/opportunity-1"],
    ["/connect/builders/a-builder", "/connect"],
    ["/connect/collaborations/collab-1", "/connect/collaborations"],
    ["/profile/verification", "/profile"],
    ["/growth", "/profile"],
    ["/passport/preview", "/passport"],
  ])("maps %s to a deterministic parent", (pathname, href) => {
    expect(parentNavigationForPath(pathname)?.href).toBe(href);
  });

  it("does not add redundant back controls on top-level primary destinations", () => {
    expect(parentNavigationForPath("/app")).toBeNull();
    expect(parentNavigationForPath("/journey")).toBeNull();
    expect(parentNavigationForPath("/connect")).toBeNull();
  });
});
