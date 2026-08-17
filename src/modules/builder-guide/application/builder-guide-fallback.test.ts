import { describe, expect, it } from "vitest";
import type { BuilderGuideContext } from "../domain/builder-guide-contract";
import { buildEvidenceBasedBuilderGuide } from "./builder-guide-fallback";

const context: BuilderGuideContext = {
  preferredName: "Builder",
  ageBand: "18_24",
  isMinor: false,
  safeguardingReviewRequired: false,
  baseline: {
    id: "11111111-1111-4111-8111-111111111111",
    summary: "A practical Builder exploring problems through completed action.",
  },
  livingProfile: {
    id: "22222222-2222-4222-8222-222222222222",
    version: 3,
    capabilities: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        label: "Project execution",
        level: "demonstrated",
        evidenceCount: 2,
        totalStrength: 4,
        feedbackType: null,
        evidence: [
          {
            sourceTitle: "Useful project",
            summary: "Completed project proof is recorded.",
            href: "/projects/44444444-4444-4444-8444-444444444444",
          },
        ],
      },
      {
        id: "55555555-5555-4555-8555-555555555555",
        label: "Communication",
        level: "practicing",
        evidenceCount: 1,
        totalStrength: 1,
        feedbackType: null,
        evidence: [],
      },
    ],
  },
  selectedPath: {
    recommendationId: "66666666-6666-4666-8666-666666666666",
    key: "community_builder",
    name: "Community Builder",
    whyItFits:
      "Your recorded evidence points to practical community problem solving.",
    evidenceNeeded:
      "Complete another small project that creates value for a real group of people.",
  },
  current: {
    mission: {
      id: "77777777-7777-4777-8777-777777777777",
      title: "Improve a local experience",
      status: "active",
    },
    journey: {
      id: "88888888-8888-4888-8888-888888888888",
      title: "30-Day Builder Journey",
      status: "active",
    },
    milestone: {
      id: "99999999-9999-4999-8999-999999999999",
      title: "Practice",
      status: "active",
    },
    quest: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      title: "Interview three users",
      status: "active",
    },
    project: null,
    nextStage: "quests",
  },
  availableDestinations: [
    "profile",
    "journey",
    "current_quest",
    "build",
    "connect",
  ],
};

function withCurrent(
  current: Partial<BuilderGuideContext["current"]>,
  availableDestinations: BuilderGuideContext["availableDestinations"] = context.availableDestinations,
): BuilderGuideContext {
  return {
    ...context,
    current: {
      mission: context.current.mission,
      journey: null,
      milestone: null,
      quest: null,
      project: null,
      nextStage: "build",
      ...current,
    },
    availableDestinations,
  };
}

describe("Stage 17 evidence fallback", () => {
  it.each([
    "next_move",
    "improvement",
    "missing_evidence",
    "weekly_focus",
  ] as const)("returns bounded %s guidance", (intent) => {
    const result = buildEvidenceBasedBuilderGuide(context, intent);
    expect(result.schemaVersion).toBe("builder-guide-v1");
    expect(result.intent).toBe(intent);
    expect(result.uncertainty.length).toBeGreaterThan(10);
    expect(context.availableDestinations).toContain(
      result.nextAction.destination,
    );
  });

  it("prioritises the active Quest for the next action", () => {
    const result = buildEvidenceBasedBuilderGuide(context, "next_move");
    expect(result.nextAction.destination).toBe("current_quest");
    expect(result.nextAction.instruction).toContain("Interview three users");
  });

  it("treats weak capability evidence as something to test, not an absent skill", () => {
    const result = buildEvidenceBasedBuilderGuide(context, "missing_evidence");
    expect(result.title).toContain("Communication");
    expect(result.uncertainty).toMatch(
      /does not mean the capability is absent/i,
    );
  });

  it("uses the active Project when no Quest is active", () => {
    const projectContext = withCurrent({
      project: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        title: "Neighbourhood service prototype",
        status: "active",
      },
    });

    const result = buildEvidenceBasedBuilderGuide(projectContext, "next_move");
    expect(result.nextAction.destination).toBe("current_project");
    expect(result.nextAction.instruction).toContain(
      "Neighbourhood service prototype",
    );
    expect(result.nextAction.evidenceToCreate).toContain("Project milestone");
  });

  it("falls back to the Journey when no Quest or Project is active", () => {
    const journeyContext = withCurrent({
      journey: {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        title: "Focused Builder Journey",
        status: "active",
      },
    });

    const result = buildEvidenceBasedBuilderGuide(
      journeyContext,
      "weekly_focus",
    );
    expect(result.nextAction.destination).toBe("journey");
    expect(result.nextAction.instruction).toContain("Focused Builder Journey");
    expect(result.nextAction.evidenceToCreate).toContain("Journey action");
  });

  it("uses Build when no active work exists but Build is available", () => {
    const buildContext = withCurrent({}, ["profile", "build", "connect"]);
    const result = buildEvidenceBasedBuilderGuide(buildContext, "next_move");

    expect(result.nextAction.destination).toBe("build");
    expect(result.nextAction.title).toBe("Create the next proof");
    expect(result.nextAction.instruction).toContain(
      "Choose one useful problem",
    );
  });

  it("falls back to Profile when there is no active work or Build access", () => {
    const profileContext = withCurrent({}, ["profile"]);
    const result = buildEvidenceBasedBuilderGuide(
      profileContext,
      "missing_evidence",
    );

    expect(result.nextAction.destination).toBe("profile");
    expect(result.nextAction.title).toBe("Review your evidence");
    expect(result.nextAction.instruction).toContain("Living Builder Profile");
  });

  it("stays conservative when no capability evidence or selected path exists", () => {
    const sparseContext: BuilderGuideContext = {
      ...withCurrent({}, ["profile"]),
      livingProfile: {
        ...context.livingProfile,
        capabilities: [],
      },
      selectedPath: null,
    };

    const improvement = buildEvidenceBasedBuilderGuide(
      sparseContext,
      "improvement",
    );
    const missing = buildEvidenceBasedBuilderGuide(
      sparseContext,
      "missing_evidence",
    );
    const weekly = buildEvidenceBasedBuilderGuide(
      sparseContext,
      "weekly_focus",
    );
    const next = buildEvidenceBasedBuilderGuide(sparseContext, "next_move");

    expect(improvement.evidenceObservations).toEqual([]);
    expect(improvement.title).toContain("completed action");
    expect(missing.evidenceObservations).toEqual([]);
    expect(missing.title).toBe("Your profile needs more completed evidence");
    expect(weekly.focus.label).toBe("One completed development action");
    expect(next.summary).not.toContain("selected");
  });

  it("uses evidence count to break equal-strength capability ties", () => {
    const tiedContext: BuilderGuideContext = {
      ...context,
      livingProfile: {
        ...context.livingProfile,
        capabilities: [
          {
            ...context.livingProfile.capabilities[0]!,
            id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            label: "Prototype testing",
            totalStrength: 2,
            evidenceCount: 1,
          },
          {
            ...context.livingProfile.capabilities[1]!,
            id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
            label: "User research",
            totalStrength: 2,
            evidenceCount: 3,
          },
        ],
      },
    };

    const result = buildEvidenceBasedBuilderGuide(tiedContext, "improvement");
    expect(result.title).toContain("User research");
  });
});
