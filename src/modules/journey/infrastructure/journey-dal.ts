import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getCurrentMissionState } from "@/modules/mission/infrastructure/mission-dal";
import {
  journeyContextSchema,
  type JourneyOutput,
} from "../domain/journey-contract";

export async function getJourneyContext() {
  const [{ profile }, missionState] = await Promise.all([
    requireAuthenticatedIdentity(),
    getCurrentMissionState(),
  ]);
  if (!missionState.active) return null;
  return journeyContextSchema.parse({
    missionId: missionState.active.id,
    title: missionState.active.title,
    missionStatement: missionState.active.mission_statement,
    whoThisHelps: missionState.active.who_this_helps,
    firstMeaningfulOutcome: missionState.active.first_meaningful_outcome,
    successSignal: missionState.active.success_signal,
    currentCaution: missionState.active.current_caution,
    ageBand: profile.age_band,
    isMinor: profile.is_minor ?? false,
    generalResourceConstraints: [missionState.active.current_caution],
  });
}

function mapJourney(
  row: Record<string, unknown>,
  milestones: Record<string, unknown>[],
) {
  return {
    id: row.id as string,
    missionId: row.mission_id as string,
    title: row.title as string,
    summary: row.summary as string,
    target_outcome: row.target_outcome as string,
    suggested_duration:
      row.suggested_duration as JourneyOutput["suggested_duration"],
    status: row.status as
      | "draft"
      | "active"
      | "paused"
      | "completed"
      | "replaced",
    cycleNumber: (row.cycle_number as number | undefined) ?? 1,
    continuationOfJourneyId:
      (row.continuation_of_journey_id as string | null | undefined) ?? null,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string | null | undefined) ?? null,
    milestones: milestones.map((item) => ({
      id: item.id as string,
      title: item.title as string,
      purpose: item.purpose as string,
      expected_outcome: item.expected_outcome as string,
      suggested_duration: item.suggested_duration as string,
      capabilities_to_develop: item.capabilities_to_develop as string[],
      completion_signal: item.completion_signal as string,
      resource_note: item.resource_note as string,
      sequence_order: item.sequence_order as number,
      status: item.status as "locked" | "available" | "active" | "completed",
    })),
  };
}

async function loadMilestones(
  client: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  journeyId: string,
) {
  const { data } = await client
    .from("journey_milestones")
    .select("*")
    .eq("journey_id", journeyId)
    .order("sequence_order");
  return (data ?? []) as Record<string, unknown>[];
}

export async function getCurrentJourneyState(missionId?: string) {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createServerSupabaseClient();
  const journeys = client
    .from("user_journeys")
    .select("*")
    .eq("user_id", user.id);
  const requests = client
    .from("journey_generation_requests")
    .select("status,mission_id,source_journey_id,request_purpose")
    .eq("user_id", user.id);
  if (missionId) {
    journeys.eq("mission_id", missionId);
    requests.eq("mission_id", missionId);
  }
  const [{ data: rows }, { data: requestRows }] = await Promise.all([
    journeys,
    requests,
  ]);
  const orderedRows = [...(rows ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const activeRow = orderedRows.find((row) => row.status === "active");
  const draftRow = orderedRows.find((row) => row.status === "draft");
  const completedRow = orderedRows.find((row) => row.status === "completed");
  const selected = activeRow ?? draftRow;
  const selectedMilestones = selected
    ? await loadMilestones(client, selected.id)
    : [];
  const completedMilestones = completedRow
    ? await loadMilestones(client, completedRow.id)
    : [];
  const continuationAttempts = completedRow
    ? (requestRows ?? []).filter(
        (row) =>
          row.source_journey_id === completedRow.id &&
          row.request_purpose === "continuation",
      ).length
    : 0;

  return {
    active: activeRow ? mapJourney(activeRow, selectedMilestones) : null,
    draft: draftRow ? mapJourney(draftRow, selectedMilestones) : null,
    latestCompleted: completedRow
      ? mapJourney(completedRow, completedMilestones)
      : null,
    attempts: requestRows?.length ?? 0,
    continuationAttempts,
    requestRunning:
      requestRows?.some(
        (row) => row.status === "ready" || row.status === "processing",
      ) ?? false,
  };
}
