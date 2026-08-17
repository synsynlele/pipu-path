import { z } from "zod";

export const builderGuideIntents = [
  "next_move",
  "improvement",
  "missing_evidence",
  "weekly_focus",
] as const;

export const builderGuideIntentSchema = z.enum(builderGuideIntents);
export type BuilderGuideIntent = z.infer<typeof builderGuideIntentSchema>;

export const builderGuideDestinations = [
  "profile",
  "journey",
  "current_quest",
  "build",
  "current_project",
  "connect",
] as const;

export const builderGuideDestinationSchema = z.enum(builderGuideDestinations);
export type BuilderGuideDestination = z.infer<
  typeof builderGuideDestinationSchema
>;

export const builderGuideOutputSchema = z.object({
  schemaVersion: z.literal("builder-guide-v1"),
  intent: builderGuideIntentSchema,
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(20).max(900),
  evidenceObservations: z
    .array(
      z.object({
        claimId: z.uuid(),
        observation: z.string().trim().min(12).max(500),
      }),
    )
    .max(3),
  focus: z.object({
    label: z.string().trim().min(3).max(120),
    rationale: z.string().trim().min(20).max(600),
  }),
  nextAction: z.object({
    title: z.string().trim().min(3).max(120),
    instruction: z.string().trim().min(20).max(700),
    evidenceToCreate: z.string().trim().min(12).max(500),
    destination: builderGuideDestinationSchema,
  }),
  challenge: z.string().trim().min(12).max(600).nullable(),
  uncertainty: z.string().trim().min(12).max(500),
});

export type BuilderGuideOutput = z.infer<typeof builderGuideOutputSchema>;

export const builderGuideContextSchema = z.object({
  preferredName: z.string().trim().min(1).max(120),
  ageBand: z.enum([
    "under_13",
    "13_15",
    "16_17",
    "18_24",
    "25_plus",
    "unknown",
  ]),
  isMinor: z.boolean(),
  safeguardingReviewRequired: z.boolean(),
  baseline: z.object({
    id: z.uuid(),
    summary: z.string().trim().min(1).max(1200),
  }),
  livingProfile: z.object({
    id: z.uuid(),
    version: z.number().int().positive(),
    capabilities: z.array(
      z.object({
        id: z.uuid(),
        label: z.string().trim().min(1).max(120),
        level: z.enum([
          "practicing",
          "demonstrated",
          "repeatedly_demonstrated",
        ]),
        evidenceCount: z.number().int().nonnegative(),
        totalStrength: z.number().int().nonnegative(),
        feedbackType: z
          .enum(["accurate", "needs_context", "not_representative"])
          .nullable(),
        evidence: z
          .array(
            z.object({
              sourceTitle: z.string().trim().min(1).max(200),
              summary: z.string().trim().min(1).max(500),
              href: z.string().trim().min(1).max(500),
            }),
          )
          .max(3),
      }),
    ),
  }),
  selectedPath: z
    .object({
      recommendationId: z.uuid(),
      key: z.string().trim().min(3).max(60),
      name: z.string().trim().min(3).max(100),
      whyItFits: z.string().trim().min(20).max(800),
      evidenceNeeded: z.string().trim().min(20).max(500),
    })
    .nullable(),
  current: z.object({
    mission: z
      .object({
        id: z.uuid(),
        title: z.string().trim().min(1).max(200),
        status: z.string().trim().min(1).max(40),
      })
      .nullable(),
    journey: z
      .object({
        id: z.uuid(),
        title: z.string().trim().min(1).max(200),
        status: z.string().trim().min(1).max(40),
      })
      .nullable(),
    milestone: z
      .object({
        id: z.uuid(),
        title: z.string().trim().min(1).max(200),
        status: z.string().trim().min(1).max(40),
      })
      .nullable(),
    quest: z
      .object({
        id: z.uuid(),
        title: z.string().trim().min(1).max(200),
        status: z.string().trim().min(1).max(40),
      })
      .nullable(),
    project: z
      .object({
        id: z.uuid(),
        title: z.string().trim().min(1).max(200),
        status: z.string().trim().min(1).max(40),
        completedMilestones: z.number().int().nonnegative(),
        totalMilestones: z.number().int().nonnegative(),
      })
      .nullable(),
    nextStage: z.string().trim().min(1).max(80),
  }),
  availableDestinations: z.array(builderGuideDestinationSchema).min(1),
});

export type BuilderGuideContext = z.infer<typeof builderGuideContextSchema>;

const fixedIdentity =
  /\b(your destiny is|you were born to|this proves who you are|you are definitely|you will always|perfect career|only path for you)\b/i;
const moneyPromise =
  /\b(get rich|quick money|guaranteed income|guaranteed earnings|instant income|double your money|make millions|passive income guaranteed)\b/i;
const riskyMoney =
  /\b(gambling|betting|casino|sports bet|binary options|day trading|speculative trading|forex trading|crypto trading|borrow money|take out a loan)\b/i;
const unsafeMinorActivity =
  /\b(contact strangers?|meet unknown adults?|adult-only platform|night shift|unsupervised client meeting|door-to-door selling)\b/i;

export function validateBuilderGuideOutput(
  contextInput: BuilderGuideContext,
  intent: BuilderGuideIntent,
  output: unknown,
):
  | { ok: true; value: BuilderGuideOutput }
  | { ok: false; code: "GUIDE_OUTPUT_INVALID" | "GUIDE_OUTPUT_UNSAFE" } {
  const parsedContext = builderGuideContextSchema.safeParse(contextInput);
  const parsedOutput = builderGuideOutputSchema.safeParse(output);
  if (!parsedContext.success || !parsedOutput.success) {
    return { ok: false, code: "GUIDE_OUTPUT_INVALID" };
  }
  if (parsedOutput.data.intent !== intent) {
    return { ok: false, code: "GUIDE_OUTPUT_INVALID" };
  }

  const allowedClaimIds = new Set(
    parsedContext.data.livingProfile.capabilities.map((claim) => claim.id),
  );
  if (
    parsedOutput.data.evidenceObservations.some(
      (observation) => !allowedClaimIds.has(observation.claimId),
    )
  ) {
    return { ok: false, code: "GUIDE_OUTPUT_INVALID" };
  }

  if (
    !parsedContext.data.availableDestinations.includes(
      parsedOutput.data.nextAction.destination,
    )
  ) {
    return { ok: false, code: "GUIDE_OUTPUT_INVALID" };
  }

  const prose = JSON.stringify(parsedOutput.data);
  if (
    fixedIdentity.test(prose) ||
    moneyPromise.test(prose) ||
    riskyMoney.test(prose)
  ) {
    return { ok: false, code: "GUIDE_OUTPUT_UNSAFE" };
  }
  if (parsedContext.data.isMinor && unsafeMinorActivity.test(prose)) {
    return { ok: false, code: "GUIDE_OUTPUT_UNSAFE" };
  }

  return { ok: true, value: parsedOutput.data };
}

export const builderGuideFeedbackSchema = z.object({
  runId: z.uuid(),
  verdict: z.enum(["helpful", "not_helpful"]),
  note: z.string().trim().max(600).optional().default(""),
});

export type BuilderGuideErrorCode =
  | "GUIDE_PROFILE_REQUIRED"
  | "GUIDE_CONSENT_REQUIRED"
  | "GUIDE_UNAVAILABLE"
  | "GUIDE_RATE_LIMITED"
  | "GUIDE_OUTPUT_INVALID"
  | "GUIDE_OUTPUT_UNSAFE"
  | "GUIDE_SAVE_FAILED";
