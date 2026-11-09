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
      .in("challenge->>title", titles)
      .limit(500),
    client
      .from("real_build_attempts")
      .select("id,challenge,status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);
  if (attempts.error || active.error) throw new Error("FINANCIAL_PATHWAY_LOAD_FAILED");
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
