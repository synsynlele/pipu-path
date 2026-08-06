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
  completedProjectId: "11111111-1111-4111-8111-111111111111",
  portfolioStatus: "published",
};

describe("authenticated progression", () => {
  it("routes anonymous users to sign in", () => {
    expect(
      progressDestination({
        ...complete,
        authenticated: false,
        identityComplete: false,
        discoveryStatus: null,
        hasHumanPotentialProfile: false,
        missionStatus: null,
        journeyStatus: null,
        completedProjectId: null,
        portfolioStatus: null,
      }).path,
    ).toBe("/login");
  });

  it("keeps discovery review explicit", () => {
    expect(
      progressDestination({ ...complete, discoveryStatus: "review" }).path,
    ).toBe("/onboarding/discovery/review");
  });

  it("prioritizes an active Project over an active Journey", () => {
    expect(
      progressDestination({
        ...complete,
        journeyStatus: "active",
        activeProjectId: "22222222-2222-4222-8222-222222222222",
        completedProjectId: null,
        portfolioStatus: null,
      }).path,
    ).toBe("/projects/22222222-2222-4222-8222-222222222222");
  });

  it("routes an active Journey to Quests", () => {
    expect(
      progressDestination({
        ...complete,
        journeyStatus: "active",
        activeProjectId: null,
        completedProjectId: null,
        portfolioStatus: null,
      }).path,
    ).toBe("/quests");
  });

  it("opens a fresh Journey cycle after a completed Project", () => {
    expect(
      progressDestination({
        ...complete,
        portfolioStatus: null,
      }),
    ).toMatchObject({ stage: "journey", path: "/journey" });
  });

  it("keeps Portfolio optional after publication", () => {
    expect(progressDestination(complete).path).toBe("/journey");
  });
});
