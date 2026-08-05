import "server-only";

import { createHash } from "node:crypto";
import type { Stage4DiscoveryHandoff } from "@/modules/discovery/domain/discovery";
import type { z } from "zod";
import { normalizedEvidenceSchema } from "../domain/contracts";

export type NormalizedEvidence = z.infer<typeof normalizedEvidenceSchema>;

const categoryForQuestion = (
  category: string,
): NormalizedEvidence["category"] => {
  const map: Record<string, NormalizedEvidence["category"]> = {
    current_reality: "current_reality",
    what_draws_me: "interest",
    comes_naturally: "capability",
    what_has_shaped_me: "experience",
    what_matters: "value",
    conditions_for_growth: "environment",
    readiness: "readiness",
  };
  return map[category] ?? "constraint";
};

function stableValue(value: string | string[] | number | null): string {
  if (Array.isArray(value)) return JSON.stringify([...value].sort());
  return JSON.stringify(value);
}

export function evidenceContentHash(input: {
  userId: string;
  sourceId: string;
  sourceVersion: number;
  sourceKey: string;
  responseType: string;
  value: string | string[] | number | null;
}): string {
  return createHash("sha256")
    .update(
      [
        input.userId,
        input.sourceId,
        input.sourceVersion,
        input.sourceKey,
        input.responseType,
        stableValue(input.value),
      ].join("\u0000"),
    )
    .digest("hex");
}

export function normalizeCompletedDiscoveryHandoff(
  userId: string,
  handoff: Stage4DiscoveryHandoff,
): Omit<NormalizedEvidence, "id">[] {
  if (handoff.processingStatus !== "ready_for_stage_4")
    throw new Error("HPI_DISCOVERY_INCOMPLETE");

  return handoff.responses
    .filter((response) => !response.skipped && response.value !== null)
    .map((response) => ({
      sourceId: response.sourceId,
      sourceVersion: handoff.questionSet.version,
      sourceKey: response.questionKey,
      category: categoryForQuestion(response.category),
      responseType: response.responseType,
      // Sensitive source values affect the fingerprint but never leave this
      // server-side normalization boundary as interpretation content.
      value: response.sensitivity === "sensitive" ? null : response.value,
      sensitivity: response.sensitivity,
      contentHash: evidenceContentHash({
        userId,
        sourceId: response.sourceId,
        sourceVersion: handoff.questionSet.version,
        sourceKey: response.questionKey,
        responseType: response.responseType,
        value: response.value,
      }),
    }));
}
