import { z } from "zod";
import { humanPotentialProfileSectionKeys } from "@/modules/human-potential/domain/profile-contract";

const pathwayKeySchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{2,59}$/);

export const possiblePathSchema = z.object({
  key: pathwayKeySchema,
  pathName: z.string().trim().min(3).max(100),
  observedPattern: z.string().trim().min(20).max(500),
  possibleInterpretation: z.string().trim().min(20).max(600),
  whyItFits: z.string().trim().min(20).max(800),
  skillsNeeded: z.array(z.string().trim().min(2).max(80)).min(2).max(6),
  howToTest: z.string().trim().min(20).max(600),
  valueOrIncome: z.array(z.string().trim().min(10).max(280)).min(1).max(4),
  evidenceNeeded: z.string().trim().min(20).max(500),
  profileEvidenceRefs: z.array(z.uuid()).min(2).max(6),
});

export const earnFromStrengthSchema = z.object({
  key: pathwayKeySchema,
  title: z.string().trim().min(3).max(100),
  whatYouCouldOffer: z.string().trim().min(20).max(500),
  whoMayNeedIt: z.string().trim().min(10).max(400),
  learnFirst: z.string().trim().min(10).max(400),
  firstExperiment: z.string().trim().min(20).max(600),
  evidenceOfImprovement: z.string().trim().min(20).max(500),
  profileEvidenceRefs: z.array(z.uuid()).min(1).max(4),
});

export const economicPathwayOutputSchema = z.object({
  schemaVersion: z.literal("economic-pathways-v1"),
  possiblePaths: z.array(possiblePathSchema).min(3).max(5),
  earnFromStrengths: z.array(earnFromStrengthSchema).min(3).max(5),
});

export const economicPathwayContextSchema = z.object({
  profileId: z.uuid(),
  summary: z.string().trim().min(1).max(1200),
  ageBand: z.enum([
    "under_13",
    "13_15",
    "16_17",
    "18_24",
    "25_plus",
    "unknown",
  ]),
  lifeStage: z.string().trim().max(120).nullable(),
  isMinor: z.boolean(),
  safeguardingReviewRequired: z.boolean(),
  sections: z.array(
    z.object({
      key: z.enum(humanPotentialProfileSectionKeys),
      insights: z.array(
        z.object({
          id: z.uuid(),
          title: z.string().min(1).max(120),
          summary: z.string().min(1).max(320),
          description: z.string().min(1).max(1200),
        }),
      ),
    }),
  ),
});

export type PossiblePath = z.infer<typeof possiblePathSchema>;
export type EarnFromStrength = z.infer<typeof earnFromStrengthSchema>;
export type EconomicPathwayOutput = z.infer<typeof economicPathwayOutputSchema>;
export type EconomicPathwayContext = z.infer<
  typeof economicPathwayContextSchema
>;

export type EconomicPathwayErrorCode =
  | "ECONOMIC_PATHWAYS_PROFILE_REQUIRED"
  | "ECONOMIC_PATHWAYS_CONSENT_REQUIRED"
  | "ECONOMIC_PATHWAYS_UNAVAILABLE"
  | "ECONOMIC_PATHWAYS_OUTPUT_INVALID"
  | "ECONOMIC_PATHWAYS_OUTPUT_UNSAFE"
  | "ECONOMIC_PATHWAYS_SAVE_FAILED"
  | "ECONOMIC_PATHWAYS_NOT_FOUND"
  | "ECONOMIC_PATHWAYS_SELECTION_LOCKED";

const fixedIdentity =
  /\b(your destiny is|you were born to|perfect career|guaranteed career|permanent career|only path for you)\b/i;
const moneyPromise =
  /\b(get rich|quick money|guaranteed income|guaranteed earnings|instant income|double your money|fixed earnings|make millions|passive income guaranteed)\b/i;
const riskyMoney =
  /\b(gambling|betting|casino|sports bet|binary options|day trading|speculative trading|forex trading|crypto trading|borrow money|take out a loan)\b/i;
const unsafeMinorActivity =
  /\b(contact strangers?|meet unknown adults?|adult-only platform|night shift|unsupervised client meeting|door-to-door selling)\b/i;

function uniqueKeys(values: Array<{ key: string }>) {
  return new Set(values.map((value) => value.key)).size === values.length;
}

export function validateEconomicPathwayOutput(
  context: EconomicPathwayContext,
  output: unknown,
):
  | { ok: true; value: EconomicPathwayOutput }
  | {
      ok: false;
      code:
        "ECONOMIC_PATHWAYS_OUTPUT_INVALID" | "ECONOMIC_PATHWAYS_OUTPUT_UNSAFE";
    } {
  const parsedContext = economicPathwayContextSchema.safeParse(context);
  const parsed = economicPathwayOutputSchema.safeParse(output);
  if (!parsedContext.success || !parsed.success) {
    return { ok: false, code: "ECONOMIC_PATHWAYS_OUTPUT_INVALID" };
  }

  if (
    !uniqueKeys(parsed.data.possiblePaths) ||
    !uniqueKeys(parsed.data.earnFromStrengths)
  ) {
    return { ok: false, code: "ECONOMIC_PATHWAYS_OUTPUT_INVALID" };
  }

  const allowedEvidence = new Set(
    parsedContext.data.sections.flatMap((section) =>
      section.insights.map((insight) => insight.id),
    ),
  );
  const refs = [
    ...parsed.data.possiblePaths.flatMap((path) => path.profileEvidenceRefs),
    ...parsed.data.earnFromStrengths.flatMap(
      (item) => item.profileEvidenceRefs,
    ),
  ];
  if (refs.some((reference) => !allowedEvidence.has(reference))) {
    return { ok: false, code: "ECONOMIC_PATHWAYS_OUTPUT_INVALID" };
  }

  const prose = JSON.stringify(parsed.data);
  if (
    fixedIdentity.test(prose) ||
    moneyPromise.test(prose) ||
    riskyMoney.test(prose)
  ) {
    return { ok: false, code: "ECONOMIC_PATHWAYS_OUTPUT_UNSAFE" };
  }
  if (parsedContext.data.isMinor && unsafeMinorActivity.test(prose)) {
    return { ok: false, code: "ECONOMIC_PATHWAYS_OUTPUT_UNSAFE" };
  }

  return { ok: true, value: parsed.data };
}
