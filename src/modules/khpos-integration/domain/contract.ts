import { z } from "zod";

export const KHPOS_CONTRACT_VERSION = "1.0" as const;
export const KHPOS_REPORTING_MINIMUM = 5;

export const bootstrapRequestSchema = z.object({
  pairingToken: z.string().trim().min(32).max(200),
  organisationName: z.string().trim().min(2).max(160),
  contractVersion: z.literal(KHPOS_CONTRACT_VERSION),
});

export const syncRequestSchema = z.object({
  syncToken: z.string().trim().min(32).max(200),
  externalCohortId: z.uuid(),
  contractVersion: z.literal(KHPOS_CONTRACT_VERSION),
});

export const joinRequestSchema = z.object({
  joinToken: z.string().trim().min(32).max(200),
});

export const aggregateSchema = z
  .object({
    reportingEligible: z.boolean(),
    cohortMemberCount: z.number().int().nonnegative(),
    activeProfileCount: z.number().int().nonnegative(),
    pathSelectedCount: z.number().int().nonnegative(),
    questParticipantCount: z.number().int().nonnegative(),
    evidenceBackedQuestParticipantCount: z.number().int().nonnegative(),
    projectParticipantCount: z.number().int().nonnegative(),
    projectCompletionParticipantCount: z.number().int().nonnegative(),
    continuationEligibleCount: z.number().int().nonnegative(),
    continuingCycleParticipantCount: z.number().int().nonnegative(),
  })
  .superRefine((value, ctx) => {
    const detailed = [
      value.cohortMemberCount,
      value.activeProfileCount,
      value.pathSelectedCount,
      value.questParticipantCount,
      value.evidenceBackedQuestParticipantCount,
      value.projectParticipantCount,
      value.projectCompletionParticipantCount,
      value.continuationEligibleCount,
      value.continuingCycleParticipantCount,
    ];
    if (!value.reportingEligible && detailed.some((count) => count !== 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Suppressed cohorts must expose zero detailed counts.",
      });
    }
    if (value.reportingEligible) {
      if (value.cohortMemberCount < KHPOS_REPORTING_MINIMUM) {
        ctx.addIssue({
          code: "custom",
          message: "Reporting requires at least five active cohort members.",
        });
      }
      if (
        value.activeProfileCount > value.cohortMemberCount ||
        value.pathSelectedCount > value.activeProfileCount
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Potential-direction counters are inconsistent.",
        });
      }
      if (
        value.questParticipantCount > value.cohortMemberCount ||
        value.evidenceBackedQuestParticipantCount > value.questParticipantCount
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Capability-practice counters are inconsistent.",
        });
      }
      if (
        value.projectParticipantCount > value.cohortMemberCount ||
        value.projectCompletionParticipantCount > value.projectParticipantCount
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Value-creation counters are inconsistent.",
        });
      }
      if (
        value.continuationEligibleCount > value.cohortMemberCount ||
        value.continuingCycleParticipantCount > value.continuationEligibleCount
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Development-continuity counters are inconsistent.",
        });
      }
    }
  });

export type CohortAggregate = z.infer<typeof aggregateSchema>;

export interface KhposSignalPayload extends CohortAggregate {
  contractVersion: "1.0";
  externalCohortId: string;
  sourceGeneratedAt: string;
  windowStart: string;
  windowEnd: string;
}

export function suppressedAggregate(): CohortAggregate {
  return {
    reportingEligible: false,
    cohortMemberCount: 0,
    activeProfileCount: 0,
    pathSelectedCount: 0,
    questParticipantCount: 0,
    evidenceBackedQuestParticipantCount: 0,
    projectParticipantCount: 0,
    projectCompletionParticipantCount: 0,
    continuationEligibleCount: 0,
    continuingCycleParticipantCount: 0,
  };
}
