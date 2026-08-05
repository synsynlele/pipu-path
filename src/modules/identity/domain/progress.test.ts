import { describe, expect, it } from "vitest";
import {
  progressDestination,
  type AuthenticatedProgressSnapshot,
} from "./progress";

const complete: AuthenticatedProgressSnapshot = {
  authenticated: true,
  identityComplete: true,
  discoveryStatus: "completed",
  hasHumanPotentialProfile: true,
  missionStatus: "active",
  journeyStatus: "completed",
  activeProjectId: null,
  completedProjectId: "project-1",
  portfolioStatus: "published",
};

describe("authenticated progress destination", () => {
  it("routes a new Google or email user to identity setup", () => {
    expect(
      progressDestination({
        ...complete,
        identityComplete: false,
        discoveryStatus: null,
        hasHumanPotentialProfile: false,
        missionStatus: null,
        journeyStatus: null,
        completedProjectId: null,
        portfolioStatus: null,
      }).path,
    ).toBe("/onboarding/identity");
  });

  it("routes a Discovery review session to review rather than restarting", () => {
    expect(
      progressDestination({ ...complete, discoveryStatus: "review" }).path,
    ).toBe("/onboarding/discovery/review");
  });

  it("routes an active Journey to Quests", () => {
    expect(
      progressDestination({
        ...complete,
        journeyStatus: "active",
        completedProjectId: null,
        portfolioStatus: null,
      }).path,
    ).toBe("/quests");
  });

  it("routes an active Project directly to its command centre", () => {
    expect(
      progressDestination({
        ...complete,
        journeyStatus: "active",
        activeProjectId: "project-active",
        completedProjectId: null,
        portfolioStatus: null,
      }).path,
    ).toBe("/projects/project-active");
  });

  it("routes a completed Project without a publication to Portfolio", () => {
    expect(
      progressDestination({
        ...complete,
        journeyStatus: "active",
        portfolioStatus: "withdrawn",
      }).path,
    ).toBe("/portfolio");
  });

  it("routes a completed MVP user to authenticated Home", () => {
    expect(progressDestination(complete).path).toBe("/app");
  });
});
