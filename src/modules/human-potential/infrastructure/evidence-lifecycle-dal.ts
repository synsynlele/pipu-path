import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export async function supersedePriorDiscoveryEvidence(
  userId: string,
  currentSourceIds: string[],
): Promise<number> {
  if (currentSourceIds.length === 0) {
    throw new Error("HPI_EVIDENCE_SNAPSHOT_FAILED");
  }

  const service = createServiceRoleSupabaseClient();
  const { data: eligibleEvidence, error } = await service
    .from("evidence_records")
    .select("id,source_id")
    .eq("user_id", userId)
    .eq("source_type", "discovery_response")
    .eq("evidence_status", "eligible");

  if (error) throw new Error("HPI_EVIDENCE_SNAPSHOT_FAILED");

  const current = new Set(currentSourceIds);
  const staleIds = (eligibleEvidence ?? [])
    .filter((evidence) => !current.has(evidence.source_id))
    .map((evidence) => evidence.id);

  if (staleIds.length === 0) return 0;

  const { error: updateError } = await service
    .from("evidence_records")
    .update({
      evidence_status: "superseded",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("source_type", "discovery_response")
    .in("id", staleIds);

  if (updateError) throw new Error("HPI_EVIDENCE_SNAPSHOT_FAILED");
  return staleIds.length;
}
