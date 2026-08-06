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
    cycleNumber: Number(row.cycle_number ?? 1),
    continuesJourneyId: (row.continues_journey_id as string | null) ?? null,
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
    createdAt: row.created_at as string,
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
  journeyId?: string,
) {
  if (!journeyId) return [];
  const { data } = await client
    .from("journey_milestones")
    .select("*")
    .eq("journey_id", journeyId)
    .order("sequence_order");
  return (data ?? []) as unknown as Record<string, unknown>[];
}

export async function getCurrentJourneyState(missionId?: string) {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createServerSupabaseClient();
  const journeys = client
    .from("user_journeys")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const requests = client
    .from("journey_generation_requests")
    .select("*")
    .eq("user_id", user.id);
  if (missionId) {
    journeys.eq("mission_id", missionId);
    requests.eq("mission_id", missionId);
  }
  const [{ data: rawRows }, { data: rawRequestRows }] = await Promise.all([
    journeys,
    requests,
  ]);
  const rows = (rawRows ?? []) as unknown as Record<string, unknown>[];
  const requestRows = (rawRequestRows ?? []) as unknown as Record<
    string,
    unknown
  >[];
  const activeRow = rows.find((row) => row.status === "active");
  const draftRow = rows.find((row) => row.status === "draft");
  const completedRow = rows.find((row) => row.status === "completed");
  const [selectedMilestones, completedMilestones] = await Promise.all([
    loadMilestones(client, (activeRow?.id ?? draftRow?.id) as string | undefined),
    loadMilestones(client, completedRow?.id as string | undefined),
  ]);

  let completedProject = null;
  if (completedRow?.id) {
    const { data } = await client
      .from("builder_projects")
      .select("id,title,completed_at")
      .eq("user_id", user.id)
      .eq("journey_id", completedRow.id as string)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    completedProject = data;
  }

  const active = activeRow
    ? mapJourney(activeRow, selectedMilestones)
    : null;
  const draft = draftRow ? mapJourney(draftRow, selectedMilestones) : null;
  const completed = completedRow
    ? mapJourney(completedRow, completedMilestones)
    : null;
  const continuationAvailable = Boolean(
    completed && completedProject && !active && !draft,
  );
  const targetCycle = active?.cycleNumber ??
    draft?.cycleNumber ??
    (continuationAvailable && completed
      ? completed.cycleNumber + 1
      : completed?.cycleNumber ?? 1);

  return {
    active,
    draft,
    completed,
    completedProject,
    continuationAvailable,
    nextCycleNumber: continuationAvailable ? targetCycle : null,
    attempts: requestRows.filter(
      (row) => Number(row.cycle_number ?? 1) === targetCycle,
    ).length,
    requestRunning: requestRows.some(
      (row) => row.status === "ready" || row.status === "processing",
    ),
  };
}
