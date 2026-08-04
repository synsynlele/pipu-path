import "server-only";

import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import type {
  BuilderProjectMilestoneStatus,
  BuilderProjectStatus,
} from "../domain/project-contract";
import { createProjectServerClient } from "./project-client";

export type BuilderProjectRow = {
  id: string;
  user_id: string;
  source_quest_id: string;
  journey_id: string;
  mission_id: string;
  title: string;
  problem_statement: string;
  people_served: string;
  desired_outcome: string;
  smallest_useful_version: string;
  success_signal: string;
  target_date: string;
  status: BuilderProjectStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type BuilderProjectMilestoneRow = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  intended_outcome: string;
  completion_signal: string;
  sequence_order: number;
  status: BuilderProjectMilestoneStatus;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type BuilderProjectUpdateRow = {
  id: string;
  user_id: string;
  project_id: string;
  milestone_id: string;
  progress_note: string;
  proof_text: string;
  proof_link: string | null;
  next_step: string;
  marks_milestone_complete: boolean;
  created_at: string;
};

export type EligibleProjectSource = {
  id: string;
  title: string;
  realWorldOutcome: string;
  completedAt: string | null;
  evidenceText: string;
  learned: string;
};

async function loadProjectDetails(
  project: BuilderProjectRow,
  client: Awaited<ReturnType<typeof createProjectServerClient>>,
  userId: string,
) {
  const [{ data: milestones }, { data: updates }, { data: sourceQuest }] =
    await Promise.all([
      client
        .from("builder_project_milestones")
        .select("*")
        .eq("project_id", project.id)
        .eq("user_id", userId)
        .order("sequence_order"),
      client
        .from("builder_project_updates")
        .select("*")
        .eq("project_id", project.id)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      client
        .from("user_quests")
        .select("id,title,real_world_outcome")
        .eq("id", project.source_quest_id)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  return {
    project,
    milestones: (milestones ?? []) as BuilderProjectMilestoneRow[],
    updates: (updates ?? []) as BuilderProjectUpdateRow[],
    sourceQuest,
  };
}

export async function getBuilderProjectState() {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createProjectServerClient();

  const [{ data: projectRows }, { data: completedQuestRows }] =
    await Promise.all([
      client
        .from("builder_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      client
        .from("user_quests")
        .select("id,title,real_world_outcome,completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false }),
    ]);

  const projects = (projectRows ?? []) as BuilderProjectRow[];
  const activeProject = projects.find((project) => project.status === "active");
  const history = projects.filter((project) => project.status !== "active");
  const usedSourceIds = new Set(projects.map((project) => project.source_quest_id));
  const candidateQuestIds = (completedQuestRows ?? [])
    .filter((quest) => !usedSourceIds.has(quest.id))
    .map((quest) => quest.id);

  let eligibleSources: EligibleProjectSource[] = [];
  if (candidateQuestIds.length > 0) {
    const [{ data: evidenceRows }, { data: reflectionRows }] =
      await Promise.all([
        client
          .from("quest_evidence")
          .select("quest_id,evidence_text")
          .eq("user_id", user.id)
          .in("quest_id", candidateQuestIds),
        client
          .from("quest_reflections")
          .select("quest_id,what_i_learned")
          .eq("user_id", user.id)
          .in("quest_id", candidateQuestIds),
      ]);

    eligibleSources = (completedQuestRows ?? []).flatMap((quest) => {
      if (usedSourceIds.has(quest.id)) return [];
      const evidence = evidenceRows?.find((row) => row.quest_id === quest.id);
      const reflection = reflectionRows?.find((row) => row.quest_id === quest.id);
      if (!evidence || !reflection) return [];
      return [
        {
          id: quest.id,
          title: quest.title,
          realWorldOutcome: quest.real_world_outcome,
          completedAt: quest.completed_at,
          evidenceText: evidence.evidence_text,
          learned: reflection.what_i_learned,
        },
      ];
    });
  }

  return {
    active: activeProject
      ? await loadProjectDetails(activeProject, client, user.id)
      : null,
    history,
    eligibleSources,
  };
}

export async function getBuilderProjectById(projectId: string) {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createProjectServerClient();
  const { data } = await client
    .from("builder_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return loadProjectDetails(data as BuilderProjectRow, client, user.id);
}
