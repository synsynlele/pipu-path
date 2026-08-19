import { describe, expect, it } from "vitest";
import {
  builderGuideOutputSchema,
  validateBuilderGuideOutput,
  type BuilderGuideContext,
  type BuilderGuideOutput,
} from "./builder-guide-contract";

const claimId = "11111111-1111-4111-8111-111111111111";

function context(
  overrides: Partial<BuilderGuideContext> = {},
): BuilderGuideContext {
  return {
    preferredName: "Builder",
    ageBand: "18_24",
    isMinor: false,
    safeguardingReviewRequired: false,
    baseline: {
      id: "22222222-2222-4222-8222-222222222222",
      summary:
        "You are exploring practical ways to create value through action.",
    },
    livingProfile: {
      id: "33333333-3333-4333-8333-333333333333",
      version: 2,
      capabilities: [
        {
          id: claimId,
          label: "Project execution",
          level: "demonstrated",
          evidenceCount: 2,
          totalStrength: 4,
          feedbackType: null,
          evidence: [
            {
              sourceTitle: "Community project",
              summary: "Completed project evidence is available.",
              href: "/projects/44444444-4444-4444-8444-444444444444",
            },
          ],
        },
      ],
    },
    selectedPath: null,
    current: {
      mission: null,
      journey: null,
      milestone: null,
      quest: null,
      project: null,
      nextStage: "Build",
    },
    availableDestinations: ["profile", "build", "connect"],
    ...overrides,
  };
}

function output(): BuilderGuideOutput {
  return {
    schemaVersion: "builder-guide-v1",
    intent: "next_move",
    title: "Turn proof into the next experiment",
    summary:
      "Your completed project gives you useful evidence. The next move is to create another small proof rather than make a larger identity claim.",
    evidenceObservations: [
      {
        claimId,
        observation:
          "Project execution is demonstrated by more than one completed evidence record.",
      },
    ],
    focus: {
      label: "Repeat useful execution",
      rationale:
        "A second focused build can show whether this capability remains useful in a different context.",
    },
    nextAction: {
      title: "Start a focused build",
      instruction:
        "Choose one useful problem you can address this week and build a small, observable result.",
      evidenceToCreate:
        "A completed project milestone and a short reflection on what changed.",
      destination: "build",
    },
    growthPack: [],
    challenge:
      "Keep the next experiment small enough to finish instead of expanding the idea before you have proof.",
    uncertainty:
      "PipuPath has evidence of completed action, but it cannot know how transferable that capability is until you test it again.",
  };
}

describe("Stage 17 Builder Guide contract", () => {
  it("accepts bounded evidence-grounded guidance", () => {
    expect(
      validateBuilderGuideOutput(context(), "next_move", output()).ok,
    ).toBe(true);
  });

  it("keeps historical Builder Guide advice readable when Growth Pack did not exist", () => {
    const legacy = output() as Record<string, unknown>;
    delete legacy.growthPack;
    const parsed = builderGuideOutputSchema.parse(legacy);
    expect(parsed.growthPack).toEqual([]);
  });

  it("accepts a bounded contextual Growth Pack", () => {
    const candidate: BuilderGuideOutput = {
      ...output(),
      intent: "growth_support",
      growthPack: [
        {
          kind: "book",
          title: "A real practical book",
          source: "Known Author",
          whyNow:
            "This supports the Builder's current evidence gap without replacing real-world action.",
          howToUse:
            "Read the section relevant to the current challenge, choose one idea, and test it in the active Build.",
          verificationNote:
            "Verify the exact title, author and edition before obtaining the book.",
        },
      ],
    };
    expect(
      validateBuilderGuideOutput(context(), "growth_support", candidate).ok,
    ).toBe(true);
  });

  it("rejects evidence references that are not in the Living Builder Profile", () => {
    const candidate = output();
    candidate.evidenceObservations[0]!.claimId =
      "55555555-5555-4555-8555-555555555555";
    expect(
      validateBuilderGuideOutput(context(), "next_move", candidate),
    ).toEqual({
      ok: false,
      code: "GUIDE_OUTPUT_INVALID",
    });
  });

  it("rejects destinations that are not currently available", () => {
    const candidate = output();
    candidate.nextAction.destination = "current_quest";
    expect(
      validateBuilderGuideOutput(context(), "next_move", candidate),
    ).toEqual({
      ok: false,
      code: "GUIDE_OUTPUT_INVALID",
    });
  });

  it("rejects fixed identity and guaranteed money claims", () => {
    const candidate = output();
    candidate.summary =
      "Your destiny is entrepreneurship and this will give you guaranteed income quickly.";
    expect(
      validateBuilderGuideOutput(context(), "next_move", candidate),
    ).toEqual({
      ok: false,
      code: "GUIDE_OUTPUT_UNSAFE",
    });
  });

  it("rejects unsafe contact advice for minors", () => {
    const candidate = output();
    candidate.nextAction.instruction =
      "Contact strangers and meet unknown adults to test whether someone will buy the service from you.";
    expect(
      validateBuilderGuideOutput(
        context({ ageBand: "16_17", isMinor: true }),
        "next_move",
        candidate,
      ),
    ).toEqual({ ok: false, code: "GUIDE_OUTPUT_UNSAFE" });
  });

  it("requires the output intent to match the selected Guide question", () => {
    expect(
      validateBuilderGuideOutput(context(), "weekly_focus", output()),
    ).toEqual({
      ok: false,
      code: "GUIDE_OUTPUT_INVALID",
    });
  });
});
