import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import {
  evidenceContentHash,
  normalizeCompletedDiscoveryHandoff,
} from "./evidence-normalization";

const handoff = {
  sessionId: "00000000-0000-4000-8000-000000000010",
  questionSet: { stableKey: "discovery-v1", version: 1 },
  completedAt: "2026-07-30T00:00:00.000Z",
  processingStatus: "ready_for_stage_4" as const,
  responses: [
    {
      sourceId: "00000000-0000-4000-8000-000000000011",
      category: "what_draws_me",
      questionKey: "making_things",
      responseType: "multi_select" as const,
      value: ["Design", "Making"],
      skipped: false,
      sensitivity: "standard" as const,
    },
    {
      sourceId: "00000000-0000-4000-8000-000000000012",
      category: "what_has_shaped_me",
      questionKey: "private_context",
      responseType: "reflection" as const,
      value: "Sensitive personal context",
      skipped: false,
      sensitivity: "sensitive" as const,
    },
    {
      sourceId: "00000000-0000-4000-8000-000000000013",
      category: "readiness",
      questionKey: "skipped_answer",
      responseType: "scale" as const,
      value: 4,
      skipped: true,
      sensitivity: "standard" as const,
    },
  ],
};

describe("Stage 4.1 evidence normalization", () => {
  it("is stable for unordered option selections", () => {
    const base = {
      userId: "00000000-0000-4000-8000-000000000001",
      sourceId: handoff.responses[0].sourceId,
      sourceVersion: 1,
      sourceKey: "making_things",
      responseType: "multi_select",
    };
    expect(evidenceContentHash({ ...base, value: ["Design", "Making"] })).toBe(
      evidenceContentHash({ ...base, value: ["Making", "Design"] }),
    );
  });

  it("normalizes only answered responses and redacts sensitive content", () => {
    const normalized = normalizeCompletedDiscoveryHandoff(
      "00000000-0000-4000-8000-000000000001",
      handoff,
    );

    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toMatchObject({
      category: "interest",
      value: ["Design", "Making"],
    });
    expect(normalized[1]).toMatchObject({
      category: "experience",
      sensitivity: "sensitive",
      value: null,
    });
    expect(normalized[1].contentHash).not.toBe(
      evidenceContentHash({
        userId: "00000000-0000-4000-8000-000000000001",
        sourceId: handoff.responses[1].sourceId,
        sourceVersion: 1,
        sourceKey: "private_context",
        responseType: "reflection",
        value: null,
      }),
    );
  });

  it("rejects a handoff that is not ready for Stage 4", () => {
    expect(() =>
      normalizeCompletedDiscoveryHandoff("user", {
        ...handoff,
        processingStatus: "not_ready" as never,
      }),
    ).toThrow("HPI_DISCOVERY_INCOMPLETE");
  });
});
