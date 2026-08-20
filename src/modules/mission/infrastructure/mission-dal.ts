import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentEconomicPathwayState } from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  missionProfileContextSchema,
  type MissionOutput,
} from "../domain/mission-contract";

export async function getMissionProfileContext() {
  const [{ profile: identityProfile }, profile] = await Promise.all([
    requireAuthenticatedIdentity(),
    getCurrentHumanPotentialProfile(),
  ]);
  if (!profile) return null;
  const pathways = await getCurrentEconomicPathwayState(profile.id);
  const constraints = profile.sections.current_constraints.map(
    (insight) => insight.summary,
  );
  return missionProfileContextSchema.parse({
    profileId: profile.id,
    summary: profile.summary,
    ageBand: identityProfile.age_band,
    lifeStage: identityProfile.life_stage,
    isMinor: identityProfile.is_minor,
    generalResourceConstraints: constraints,
    selectedPath: pathways?.selectedPath ?? null,
    sections: Object.entries(profile.sections).map(([key, insights]) => ({
      key,
      insights: insights.map((insight) => ({
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
        description: insight.description,
      })),
    })),
  });
}

function mapMission(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    profileId: row.human_potential_profile_id as string,
    title: row.title as string,
    mission_statement: row.mission_statement as string,
    why_this_fits: row.why_this_fits as string,
    who_this_helps: row.who_this_helps as string,
    first_meaningful_outcome: row.first_meaningful_outcome as string,
    time_horizon: row.time_horizon as MissionOutput["time_horizon"],
    success_signal: row.success_signal as string,
    current_caution: row.current_caution as string,
    profile_evidence_refs: row.profile_evidence_refs as string[],
    status: row.status as
      "draft" | "active" | "paused" | "completed" | "replaced",
    createdAt: row.created_at as string,
  };
}

export async function getCurrentMissionState(profileId?: string) {
  const { user } = await requireAuthenticatedIdentity();
  const [client, pathways] = await Promise.all([
    createServerSupabaseClient(),
    profileId
      ? getCurrentEconomicPathwayState(profileId)
      : Promise.resolve(null),
  ]);
  const draftQuery = client
    .from("user_missions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1);
  const requestQuery = client
    .from("mission_generation_requests")
    .select("status, human_potential_profile_id, created_at")
    .eq("user_id", user.id);
  if (profileId) {
    draftQuery.eq("human_potential_profile_id", profileId);
    requestQuery.eq("human_potential_profile_id", profileId);
  }
  if (pathways?.selectedAt) {
    requestQuery.gte("created_at", pathways.selectedAt);
  }
  const activeQuery = client
    .from("user_missions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active");
  if (profileId) {
    activeQuery.eq("human_potential_profile_id", profileId);
  }
  const [{ data: active }, { data: draft }, { data: requests }] =
    await Promise.all([
      activeQuery.maybeSingle(),
      draftQuery.maybeSingle(),
      requestQuery,
    ]);
  return {
    active: active ? mapMission(active) : null,
    draft: draft ? mapMission(draft) : null,
    attempts: requests?.length ?? 0,
    requestRunning:
      requests?.some(
        (request) =>
          request.status === "ready" || request.status === "processing",
      ) ?? false,
  };
}
