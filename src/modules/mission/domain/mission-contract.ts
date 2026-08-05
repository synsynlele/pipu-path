import { z } from "zod";

export const missionTimeHorizons = [
  "two_weeks",
  "four_weeks",
  "six_weeks",
  "eight_weeks",
] as const;

export const missionGenerationKinds = [
  "initial",
  "regenerate",
  "refine",
] as const;

export const missionOutputSchema = z.object({
  title: z.string().trim().min(3).max(100),
  mission_statement: z.string().trim().min(12).max(320),
  why_this_fits: z.string().trim().min(20).max(1000),
  who_this_helps: z.string().trim().min(3).max(200),
  first_meaningful_outcome: z.string().trim().min(10).max(400),
  time_horizon: z.enum(missionTimeHorizons),
  success_signal: z.string().trim().min(8).max(400),
  current_caution: z.string().trim().min(8).max(400),
  profile_evidence_refs: z.array(z.uuid()).min(2).max(12),
});

export const missionProfileContextSchema = z.object({
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
  generalResourceConstraints: z.array(z.string().max(320)).max(8),
  sections: z.array(
    z.object({
      key: z.enum([
        "emerging_strengths",
        "what_draws_you",
        "problems_you_care_about",
        "how_you_can_contribute",
        "current_constraints",
        "best_next_direction",
      ]),
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

export type MissionOutput = z.infer<typeof missionOutputSchema>;
export type MissionProfileContext = z.infer<typeof missionProfileContextSchema>;

export type MissionErrorCode =
  | "MISSION_PROFILE_REQUIRED"
  | "MISSION_CONSENT_REQUIRED"
  | "MISSION_GENERATION_DISABLED"
  | "MISSION_REQUEST_ALREADY_RUNNING"
  | "MISSION_GENERATION_LIMIT_REACHED"
  | "MISSION_PROVIDER_UNAVAILABLE"
  | "MISSION_PROVIDER_TIMEOUT"
  | "MISSION_OUTPUT_INVALID"
  | "MISSION_OUTPUT_UNSAFE"
  | "MISSION_SAVE_FAILED"
  | "MISSION_NOT_FOUND"
  | "MISSION_ACCESS_DENIED";

const permanentPurposeClaim =
  /\b(your (?:life )?purpose is|you were born to|your destiny is|perfect career|definitely (?:are|should)|permanent (?:purpose|career))\b/i;
const inflatedScope =
  /\b(entire (?:world|africa|country|nation|industry|education system)|everyone in the world|millions of people|global transformation)\b/i;
const unsafeMinorAdvice =
  /\b(meet (?:an )?unknown adult|contact strangers?|keep (?:this )?secret|hide (?:this )?from (?:your )?(?:parent|guardian)|invest money|borrow money|adult job)\b/i;
const diagnosis = /\b(diagnos(?:e|is|tic)|disorder|mental illness)\b/i;

export function validateMissionOutput(
  context: MissionProfileContext,
  output: unknown,
): { ok: true; value: MissionOutput } | { ok: false; code: MissionErrorCode } {
  const parsedContext = missionProfileContextSchema.safeParse(context);
  const parsed = missionOutputSchema.safeParse(output);
  if (!parsedContext.success || !parsed.success) {
    return { ok: false, code: "MISSION_OUTPUT_INVALID" };
  }

  const allowedEvidence = new Set(
    parsedContext.data.sections.flatMap((section) =>
      section.insights.map((insight) => insight.id),
    ),
  );
  if (
    parsed.data.profile_evidence_refs.some((id) => !allowedEvidence.has(id))
  ) {
    return { ok: false, code: "MISSION_OUTPUT_INVALID" };
  }

  const prose = [
    parsed.data.title,
    parsed.data.mission_statement,
    parsed.data.why_this_fits,
    parsed.data.who_this_helps,
    parsed.data.first_meaningful_outcome,
    parsed.data.success_signal,
    parsed.data.current_caution,
  ].join(" ");

  if (permanentPurposeClaim.test(prose) || inflatedScope.test(prose)) {
    return { ok: false, code: "MISSION_OUTPUT_INVALID" };
  }
  if (
    diagnosis.test(prose) ||
    (parsedContext.data.isMinor && unsafeMinorAdvice.test(prose))
  ) {
    return { ok: false, code: "MISSION_OUTPUT_UNSAFE" };
  }
  return { ok: true, value: parsed.data };
}

export function canRequestMission(input: {
  successfulAttempts: number;
  requestRunning: boolean;
  hasActiveMission: boolean;
}) {
  if (input.hasActiveMission)
    return { ok: false as const, code: "MISSION_GENERATION_DISABLED" as const };
  if (input.requestRunning)
    return {
      ok: false as const,
      code: "MISSION_REQUEST_ALREADY_RUNNING" as const,
    };
  if (input.successfulAttempts >= 3)
    return {
      ok: false as const,
      code: "MISSION_GENERATION_LIMIT_REACHED" as const,
    };
  return { ok: true as const };
}

export const refinementInstructionSchema = z
  .string()
  .trim()
  .min(3)
  .max(240)
  .refine((value) => !/[{}<>]|system prompt|ignore previous/i.test(value));
