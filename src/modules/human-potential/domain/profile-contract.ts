import { z } from "zod";
import {
  interpretationInsightSchema,
  interpretationOutputSchema,
  validateInterpretationOutput,
  type HpiDomainErrorCode,
  type interpretationInputSchema,
} from "./contracts";

export const humanPotentialProfileSectionKeys = [
  "emerging_strengths",
  "what_draws_you",
  "problems_you_care_about",
  "how_you_can_contribute",
  "current_constraints",
  "best_next_direction",
] as const;

export type HumanPotentialProfileSectionKey =
  (typeof humanPotentialProfileSectionKeys)[number];

const profileInsightSchema = interpretationInsightSchema.extend({
  profileSection: z.enum(humanPotentialProfileSectionKeys),
});

export const humanPotentialProfileOutputSchema = z.object({
  schemaVersion: z.literal("hpi-profile-v1"),
  summary: z.string().min(1).max(1200),
  insights: z.array(profileInsightSchema).min(7).max(20),
});

const permanentIdentityClaim =
  /\b(you (?:definitely|certainly|are) (?:a|an)|your (?:purpose|destiny) is|you were born to|always will be|never will be|permanent career)\b/i;

const unsafeConstraintLanguage =
  /\b(lazy|broken|failure|deficient|you should be ashamed|nothing is wrong with you)\b/i;

export function validateHumanPotentialProfileOutput(
  input: z.infer<typeof interpretationInputSchema>,
  output: unknown,
):
  | { ok: true; value: z.infer<typeof humanPotentialProfileOutputSchema> }
  | { ok: false; code: HpiDomainErrorCode } {
  const parsed = humanPotentialProfileOutputSchema.safeParse(output);
  if (!parsed.success) return { ok: false, code: "HPI_OUTPUT_INVALID" };

  const perSection = new Map<HumanPotentialProfileSectionKey, number>();
  for (const insight of parsed.data.insights) {
    perSection.set(
      insight.profileSection,
      (perSection.get(insight.profileSection) ?? 0) + 1,
    );
  }

  if (
    (perSection.get("emerging_strengths") ?? 0) < 2 ||
    (perSection.get("emerging_strengths") ?? 0) > 4 ||
    humanPotentialProfileSectionKeys.some(
      (section) =>
        section !== "emerging_strengths" && (perSection.get(section) ?? 0) < 1,
    )
  ) {
    return { ok: false, code: "HPI_OUTPUT_INVALID" };
  }

  const base = validateInterpretationOutput(input, {
    schemaVersion: parsed.data.schemaVersion,
    insights: parsed.data.insights,
  });
  if (!base.ok) return base;

  const prose = [
    parsed.data.summary,
    ...parsed.data.insights.flatMap((insight) => [
      insight.title,
      insight.summary,
      insight.explanation,
    ]),
  ].join(" ");
  if (permanentIdentityClaim.test(prose) || unsafeConstraintLanguage.test(prose)) {
    return { ok: false, code: "HPI_OUTPUT_INVALID" };
  }

  return { ok: true, value: parsed.data };
}

export function profileSectionsFromOutput(
  output: z.infer<typeof humanPotentialProfileOutputSchema>,
) {
  return humanPotentialProfileSectionKeys.map((key) => ({
    key,
    insights: output.insights.filter((insight) => insight.profileSection === key),
  }));
}

export const profileOutputForPersistence = (
  output: z.infer<typeof humanPotentialProfileOutputSchema>,
) => ({
  summary: output.summary,
  metadata: {
    profile_schema_version: output.schemaVersion,
    sections: humanPotentialProfileSectionKeys,
  },
  insights: output.insights,
});
