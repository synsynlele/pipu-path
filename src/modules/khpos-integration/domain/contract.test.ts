import { describe, expect, it } from "vitest";
import { aggregateSchema, suppressedAggregate } from "./contract";

describe("Stage 13 KHP-OS cohort aggregate contract", () => {
  it("suppresses every detailed count below the privacy threshold", () => {
    expect(aggregateSchema.safeParse(suppressedAggregate()).success).toBe(true);
    expect(aggregateSchema.safeParse({ ...suppressedAggregate(), cohortMemberCount: 1 }).success).toBe(false);
  });

  it("accepts a consistent five-member institutional aggregate", () => {
    expect(aggregateSchema.safeParse({
      reportingEligible: true,
      cohortMemberCount: 5,
      activeProfileCount: 4,
      pathSelectedCount: 3,
      questParticipantCount: 4,
      evidenceBackedQuestParticipantCount: 3,
      projectParticipantCount: 3,
      projectCompletionParticipantCount: 2,
      continuationEligibleCount: 2,
      continuingCycleParticipantCount: 1,
    }).success).toBe(true);
  });

  it("rejects aggregate relationships that could not be true", () => {
    expect(aggregateSchema.safeParse({
      reportingEligible: true,
      cohortMemberCount: 5,
      activeProfileCount: 4,
      pathSelectedCount: 5,
      questParticipantCount: 4,
      evidenceBackedQuestParticipantCount: 3,
      projectParticipantCount: 3,
      projectCompletionParticipantCount: 2,
      continuationEligibleCount: 2,
      continuingCycleParticipantCount: 1,
    }).success).toBe(false);
  });
});
