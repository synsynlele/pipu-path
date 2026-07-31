import { z } from "zod";

export const confidenceLevels = [
  "low",
  "emerging",
  "moderate",
  "strong",
] as const;
export const insightTypes = [
  "strength_pattern",
  "interest_pattern",
  "value_pattern",
  "capability_pattern",
  "environmental_preference",
  "problem_orientation",
  "contribution_orientation",
  "growth_need",
  "constraint",
  "motivation_pattern",
  "readiness_pattern",
] as const;

export type HpiDomainErrorCode =
  | "HPI_DISCOVERY_INCOMPLETE"
  | "HPI_CONSENT_REQUIRED"
  | "HPI_INTERPRETATION_NOT_ALLOWED"
  | "HPI_EVIDENCE_NOT_FOUND"
  | "HPI_EVIDENCE_INVALID"
  | "HPI_EVIDENCE_VERSION_MISMATCH"
  | "HPI_EVIDENCE_SNAPSHOT_FAILED"
  | "HPI_REQUEST_ALREADY_EXISTS"
  | "HPI_REQUEST_INVALID_STATE"
  | "HPI_REQUEST_NOT_FOUND"
  | "HPI_OUTPUT_INVALID"
  | "HPI_OUTPUT_UNSUPPORTED_INSIGHT"
  | "HPI_OUTPUT_UNKNOWN_EVIDENCE"
  | "HPI_OUTPUT_MISSING_PROVENANCE"
  | "HPI_CONFIDENCE_INVALID"
  | "HPI_INSIGHT_NOT_FOUND"
  | "HPI_FEEDBACK_INVALID"
  | "HPI_PROFILE_VERSION_CONFLICT"
  | "HPI_ACCESS_DENIED"
  | "HPI_SAFEGUARDING_RESTRICTION";

export const normalizedEvidenceSchema = z.object({
  id: z.uuid(),
  sourceId: z.uuid(),
  sourceVersion: z.number().int().positive(),
  sourceKey: z.string().regex(/^[a-z][a-z0-9_]{2,49}$/),
  category: z.enum([
    "current_reality",
    "interest",
    "capability",
    "experience",
    "value",
    "environment",
    "constraint",
    "motivation",
    "readiness",
  ]),
  responseType: z.enum([
    "reflection",
    "single_select",
    "multi_select",
    "scale",
  ]),
  value: z.union([
    z.string().max(1200),
    z.array(z.string().max(160)).max(12),
    z.number(),
    z.null(),
  ]),
  sensitivity: z.enum(["standard", "sensitive"]),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export const interpretationInputSchema = z.object({
  requestId: z.uuid(),
  schemaVersion: z.string().min(1).max(64),
  promptVersion: z.string().min(1).max(64),
  questionSetVersion: z.number().int().positive(),
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
  prohibitedInferenceCategories: z.array(z.string()).min(1),
  evidence: z.array(normalizedEvidenceSchema).min(1).max(100),
});

const evidenceReferenceSchema = z.object({
  evidenceId: z.uuid(),
  supportType: z.enum(["supporting", "contradicting", "context"]),
  explanation: z.string().min(1).max(500),
  weight: z.number().gt(0).max(1),
});

export const interpretationInsightSchema = z.object({
        insightType: z.enum(insightTypes),
        insightKey: z.string().regex(/^[a-z][a-z0-9_]{2,79}$/),
        title: z.string().min(1).max(120),
        summary: z.string().min(1).max(320),
        explanation: z.string().min(1).max(1200),
        confidenceLevel: z.enum(confidenceLevels),
        confidenceScore: z.number().min(0).max(1),
        confidenceFactors: z.array(z.string().min(1).max(160)).min(1).max(8),
        evidence: z.array(evidenceReferenceSchema).max(20),
        uncertainties: z
          .array(
            z.object({
              type: z.enum([
                "insufficient_examples",
                "conflicting_evidence",
                "low_response_detail",
                "age_or_life_stage",
                "context_specific",
                "outdated_evidence",
                "possible_response_bias",
              ]),
              description: z.string().min(1).max(400),
            }),
          )
          .min(1)
          .max(8),
        confirmationQuestion: z.string().min(1).max(400),
        sensitivity: z.enum(["standard", "sensitive"]),
        ageAppropriate: z.boolean(),
      });

export const interpretationOutputSchema = z.object({
  schemaVersion: z.string().min(1).max(64),
  insights: z.array(interpretationInsightSchema).max(20),
});

const prohibitedClaim =
  /\b(diagnos(?:e|is|tic)|definitely your purpose|certainly your purpose|you are destined|the perfect career|guaranteed career|fixed purpose|your destiny)\b/i;

const minorSafeguardingClaim =
  /\b(adult relationship|unknown adult|contact (?:an )?adult|meet (?:an )?adult|adult employment|adult job|financial investment|invest money|legal action|legal advice|keep (?:this )?secret|don't tell (?:your )?(?:parent|guardian)|hide (?:this )?from (?:your )?(?:parent|guardian))\b/i;

export function validateInterpretationOutput(
  input: z.infer<typeof interpretationInputSchema>,
  output: unknown,
):
  | { ok: true; value: z.infer<typeof interpretationOutputSchema> }
  | { ok: false; code: HpiDomainErrorCode } {
  const parsed = interpretationOutputSchema.safeParse(output);
  if (!parsed.success) return { ok: false, code: "HPI_OUTPUT_INVALID" };
  const evidenceIds = new Set(input.evidence.map((evidence) => evidence.id));
  for (const insight of parsed.data.insights) {
    if (!insight.evidence.length)
      return { ok: false, code: "HPI_OUTPUT_MISSING_PROVENANCE" };
    if (insight.evidence.some((link) => !evidenceIds.has(link.evidenceId)))
      return { ok: false, code: "HPI_OUTPUT_UNKNOWN_EVIDENCE" };
    const prose = [insight.title, insight.summary, insight.explanation].join(
      " ",
    );
    if (prohibitedClaim.test(prose))
      return { ok: false, code: "HPI_OUTPUT_INVALID" };
    if (
      input.isMinor &&
      (!insight.ageAppropriate || minorSafeguardingClaim.test(prose))
    )
      return { ok: false, code: "HPI_SAFEGUARDING_RESTRICTION" };
  }
  return { ok: true, value: parsed.data };
}

export interface InterpretationProvider {
  interpret(input: z.infer<typeof interpretationInputSchema>): Promise<unknown>;
  validateOutput(
    output: unknown,
  ): ReturnType<typeof interpretationOutputSchema.safeParse>;
  mapProviderError(error: unknown): HpiDomainErrorCode;
  recordUsage(metadata: {
    requestId: string;
    provider: string;
    model: string | null;
  }): Promise<void>;
}
