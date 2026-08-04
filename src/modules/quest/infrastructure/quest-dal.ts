import "server-only";

import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getCurrentJourneyState } from "@/modules/journey/infrastructure/journey-dal";
import {
  questContextSchema,
  type QuestStatus,
} from "../domain/quest-contract";
import { createQuestServerClient } from "./quest-client";

const evidenceBucket = "quest-evidence";

type QuestRow = {
  id: string;
  user_id: string;
  journey_id: string;
  milestone_id: string;
  generation_request_id: string;
  title: string;
  real_world_outcome: string;
  why_it_matters: string;
  estimated_minutes: number;
  action_steps: string[];
  resources_needed: string[];
  low_resource_alternative: string;
  evidence_requirements: string[];
  safety_guidance: string;
  completion_criteria: string;
  reflection_prompts: string[];
  sequence_order: number;
  status: QuestStatus;
  xp_value: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  evidence_submitted_at: string | null;
  completed_at: string | null;
};

type EvidenceRow = {
  id: string;
  user_id: string;
  quest_id: string;
  evidence_text: string;
  evidence_link: string | null;
  image_path: string | null;
  happened_on: string;
  submitted_at: string;
  updated_at: string;
};

type ReflectionRow = {
  id: string;
  user_id: string;
  quest_id: string;
  what_i_did: string;
  what_happened: string;
  what_i_learned: string;
  what_i_will_change: string;
  nortnspoil_reflection: string;
  created_at: string;
};

export type QuestView = QuestRow & {
  evidence: EvidenceRow | null;
  reflection: ReflectionRow | null;
};

export async function getQuestContext() {
  const [{ profile }, journeyState] = await Promise.all([
    requireAuthenticatedIdentity(),
    getCurrentJourneyState(),
  ]);

  if (!journeyState.active) return null;

  const milestone = journeyState.active.milestones.find(
    (item) => item.status === "available" || item.status === "active",
  );
  if (!milestone) return null;

  return questContextSchema.parse({
    journeyId: journeyState.active.id,
    journeyTitle: journeyState.active.title,
    journeyTargetOutcome: journeyState.active.target_outcome,
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    milestonePurpose: milestone.purpose,
    milestoneExpectedOutcome: milestone.expected_outcome,
    milestoneCompletionSignal: milestone.completion_signal,
    milestoneResourceNote: milestone.resource_note,
    capabilitiesToDevelop: milestone.capabilities_to_develop,
    ageBand: profile.age_band,
    isMinor: profile.is_minor ?? false,
    generalResourceConstraints: [milestone.resource_note],
  });
}

export async function getCurrentQuestState(milestoneId?: string) {
  const { user } = await requireAuthenticatedIdentity();
  const context = milestoneId ? null : await getQuestContext();
  const selectedMilestoneId = milestoneId ?? context?.milestoneId;
  const client = await createQuestServerClient();

  const requestsQuery = client
    .from("quest_generation_requests")
    .select("status,milestone_id")
    .eq("user_id", user.id);
  const questsQuery = client
    .from("user_quests")
    .select("*")
    .eq("user_id", user.id)
    .order("sequence_order");

  if (selectedMilestoneId) {
    requestsQuery.eq("milestone_id", selectedMilestoneId);
    questsQuery.eq("milestone_id", selectedMilestoneId);
  } else {
    requestsQuery.limit(0);
    questsQuery.limit(0);
  }

  const [{ data: requestRows }, { data: questRows }, { data: xpRows }] =
    await Promise.all([
      requestsQuery,
      questsQuery,
      client
        .from("builder_xp_transactions")
        .select("amount")
        .eq("user_id", user.id),
    ]);

  const questIds = questRows?.map((quest) => quest.id) ?? [];
  let evidenceRows: EvidenceRow[] = [];
  let reflectionRows: ReflectionRow[] = [];

  if (questIds.length > 0) {
    const [{ data: evidence }, { data: reflections }] = await Promise.all([
      client
        .from("quest_evidence")
        .select("*")
        .eq("user_id", user.id)
        .in("quest_id", questIds),
      client
        .from("quest_reflections")
        .select("*")
        .eq("user_id", user.id)
        .in("quest_id", questIds),
    ]);
    evidenceRows = evidence ?? [];
    reflectionRows = reflections ?? [];
  }

  const quests: QuestView[] = (questRows ?? []).map((quest) => ({
    ...quest,
    evidence:
      evidenceRows.find((evidence) => evidence.quest_id === quest.id) ?? null,
    reflection:
      reflectionRows.find((reflection) => reflection.quest_id === quest.id) ??
      null,
  }));

  return {
    quests,
    active:
      quests.find(
        (quest) =>
          quest.status === "active" || quest.status === "evidence_submitted",
      ) ?? null,
    available: quests.find((quest) => quest.status === "available") ?? null,
    completed: quests.filter((quest) => quest.status === "completed"),
    attempts: requestRows?.length ?? 0,
    requestRunning:
      requestRows?.some(
        (request) =>
          request.status === "ready" || request.status === "processing",
      ) ?? false,
    totalXp:
      xpRows?.reduce((sum, transaction) => sum + transaction.amount, 0) ?? 0,
  };
}

export async function getQuestById(questId: string) {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createQuestServerClient();

  const { data: quest } = await client
    .from("user_quests")
    .select("*")
    .eq("id", questId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!quest) return null;

  const [
    { data: evidence },
    { data: reflection },
    { data: xp },
    { data: milestone },
    { data: journey },
    { data: siblingRows },
  ] = await Promise.all([
    client
      .from("quest_evidence")
      .select("*")
      .eq("quest_id", quest.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    client
      .from("quest_reflections")
      .select("*")
      .eq("quest_id", quest.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    client
      .from("builder_xp_transactions")
      .select("amount")
      .eq("quest_id", quest.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    client
      .from("journey_milestones")
      .select("*")
      .eq("id", quest.milestone_id)
      .maybeSingle(),
    client
      .from("user_journeys")
      .select("id,title,status")
      .eq("id", quest.journey_id)
      .eq("user_id", user.id)
      .maybeSingle(),
    client
      .from("user_quests")
      .select("id,sequence_order,status,title")
      .eq("milestone_id", quest.milestone_id)
      .eq("user_id", user.id)
      .order("sequence_order"),
  ]);

  let imageUrl: string | null = null;
  if (evidence?.image_path) {
    const { data } = await client.storage
      .from(evidenceBucket)
      .createSignedUrl(evidence.image_path, 600);
    imageUrl = data?.signedUrl ?? null;
  }

  const siblings = siblingRows ?? [];
  const nextQuest =
    siblings.find(
      (item) =>
        item.sequence_order === quest.sequence_order + 1 &&
        item.status !== "locked",
    ) ?? null;

  return {
    quest: quest as QuestRow,
    evidence: (evidence as EvidenceRow | null) ?? null,
    reflection: (reflection as ReflectionRow | null) ?? null,
    xpAwarded: xp?.amount ?? 0,
    milestone,
    journey,
    siblings,
    nextQuest,
    imageUrl,
  };
}

export function questStatusLabel(status: QuestStatus) {
  const labels: Record<QuestStatus, string> = {
    locked: "Locked",
    available: "Ready",
    active: "In action",
    evidence_submitted: "Ready to reflect",
    completed: "Completed",
  };
  return labels[status];
}
