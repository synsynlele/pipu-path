import "server-only";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { buildServerClient } from "@/modules/real-build/infrastructure/client";
import { financialIntelligencePathway } from "../domain/financial-pathway";

/** Read only the actor's recorded real-world attempts, not city practice state. */
export async function getFinancialPathwayState() {
  const { user, profile } = await requireAuthenticatedIdentity();
  const client = await buildServerClient();
  const titles = financialIntelligencePathway.stages.map(
    (stage) => stage.quest.challenge.title,
  );
  const [attempts, active] = await Promise.all([
    client
      .from("real_build_attempts")
      .select("id,challenge,status")
      .eq("user_id", user.id)
      .eq("status", "recorded")
      .eq("source", "reviewed")
      .in("challenge->>title", titles)
      .limit(500),
    client
      .from("real_build_attempts")
      .select("id,challenge,status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);
  if (attempts.error || active.error)
    throw new Error("FINANCIAL_PATHWAY_LOAD_FAILED");
  const recordedTitles = new Set(
    (attempts.data ?? []).map((item) => item.challenge.title),
  );
  return {
    ageBand: profile.age_band as string,
    recordedCodes: financialIntelligencePathway.stages
      .filter((stage) => recordedTitles.has(stage.quest.challenge.title))
      .map((stage) => stage.code),
    current: active.data
      ? { id: active.data.id, title: active.data.challenge.title }
      : null,
  };
}

/**
 * Private read-only Vault bridge. Deliberately does not create a Project,
 * copy evidence, open minor public publishing or certify a skill.
 */
export async function getPrivateFinancialAttemptSummaries() {
  const { user } = await requireAuthenticatedIdentity();
  const client = await buildServerClient();
  const titles = financialIntelligencePathway.stages.map(
    (stage) => stage.quest.challenge.title,
  );
  const { data, error } = await client
    .from("real_build_attempts")
    .select("id,challenge,recorded_at")
    .eq("user_id", user.id)
    .eq("status", "recorded")
    .eq("source", "reviewed")
    .in("challenge->>title", titles)
    .order("recorded_at", { ascending: false })
    .limit(12);
  if (error) throw new Error("FINANCIAL_PRIVATE_EVIDENCE_LOAD_FAILED");

  const byTitle = new Map(
    financialIntelligencePathway.stages.map((stage) => [
      stage.quest.challenge.title,
      stage.title,
    ]),
  );
  return (data ?? [])
    .map((row) => ({
      id: row.id,
      stageTitle: byTitle.get(row.challenge.title),
      recordedAt: row.recorded_at,
    }))
    .filter(
      (row): row is { id: string; stageTitle: string; recordedAt: string | null } =>
        Boolean(row.stageTitle),
    );
}
