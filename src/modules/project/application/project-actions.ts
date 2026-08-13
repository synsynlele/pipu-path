"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getCurrentEconomicPathwayState,
  recordProductEventForUser,
} from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  projectCreateInputSchema,
  projectUpdateInputSchema,
  type ProjectErrorCode,
} from "../domain/project-contract";
import { createProjectServerClient } from "../infrastructure/project-client";

export type ProjectFormState =
  { status: "idle" } | { status: "error"; message: string };

function projectErrorMessage(code: ProjectErrorCode) {
  const messages: Record<ProjectErrorCode, string> = {
    PROJECT_ACCESS_DENIED: "Sign in again to continue building your Project.",
    PROJECT_COMPLETED_QUEST_REQUIRED:
      "Complete a Quest before turning its proof into a Project.",
    PROJECT_PROOF_REQUIRED:
      "The source Quest needs both private evidence and reflection.",
    PROJECT_JOURNEY_REQUIRED:
      "The source Quest is no longer connected to your Journey.",
    PROJECT_ALREADY_ACTIVE:
      "Finish your current Project before starting another one.",
    PROJECT_SOURCE_ALREADY_USED:
      "That Quest has already been used to start a Project.",
    PROJECT_TARGET_DATE_INVALID:
      "Choose a target date between today and one year from now.",
    PROJECT_MILESTONES_INVALID:
      "Define exactly three ordered and measurable milestones.",
    PROJECT_INPUT_INVALID:
      "Review the Project details and make each answer specific.",
    PROJECT_ACTIVE_REQUIRED:
      "This Project is no longer active, so it cannot receive new updates.",
    PROJECT_MILESTONE_NOT_AVAILABLE:
      "Complete the current milestone before working on this one.",
    PROJECT_UPDATE_INVALID:
      "Describe meaningful progress, proof and a practical next action.",
    PROJECT_MILESTONE_ALREADY_COMPLETED:
      "This milestone has already been completed.",
  };
  return messages[code];
}

function errorCode(error: unknown, fallback: ProjectErrorCode) {
  const match = (error instanceof Error ? error.message : String(error)).match(
    /PROJECT_[A-Z_]+/,
  )?.[0] as ProjectErrorCode | undefined;
  return match ?? fallback;
}

export async function createBuilderProjectAction(
  _previous: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  void _previous;
  const { user } = await requireAuthenticatedIdentity();
  const pathways = await getCurrentEconomicPathwayState();

  const milestones = [1, 2, 3].map((sequenceOrder) => ({
    title: formData.get(`milestone${sequenceOrder}Title`),
    intendedOutcome: formData.get(`milestone${sequenceOrder}Outcome`),
    completionSignal: formData.get(`milestone${sequenceOrder}Signal`),
    sequenceOrder,
  }));

  const parsed = projectCreateInputSchema.safeParse({
    sourceQuestId: formData.get("sourceQuestId"),
    title: formData.get("title"),
    problemStatement: formData.get("problemStatement"),
    peopleServed: formData.get("peopleServed"),
    desiredOutcome: formData.get("desiredOutcome"),
    smallestUsefulVersion: formData.get("smallestUsefulVersion"),
    successSignal: formData.get("successSignal"),
    targetDate: formData.get("targetDate"),
    milestones,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        projectErrorMessage("PROJECT_INPUT_INVALID"),
    };
  }

  const client = await createProjectServerClient();
  const { data, error } = await client.rpc("create_stage8_builder_project", {
    source_quest_id_input: parsed.data.sourceQuestId,
    title_input: parsed.data.title,
    problem_statement_input: parsed.data.problemStatement,
    people_served_input: parsed.data.peopleServed,
    desired_outcome_input: parsed.data.desiredOutcome,
    smallest_useful_version_input: parsed.data.smallestUsefulVersion,
    success_signal_input: parsed.data.successSignal,
    target_date_input: parsed.data.targetDate,
    milestones_input: parsed.data.milestones.map((milestone) => ({
      title: milestone.title,
      intended_outcome: milestone.intendedOutcome,
      completion_signal: milestone.completionSignal,
      sequence_order: milestone.sequenceOrder,
    })),
  });

  if (error || !data) {
    const code = errorCode(error, "PROJECT_INPUT_INVALID");
    return { status: "error", message: projectErrorMessage(code) };
  }

  if (pathways?.selectedPath) {
    await recordProductEventForUser(user.id, "first_value_challenge_started", {
      projectId: data,
      pathKey: pathways.selectedPath.key,
      recommendationId: pathways.id,
    });
  }
  revalidatePath("/projects");
  redirect(`/projects/${data}`);
}

export async function addBuilderProjectUpdateAction(
  _previous: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  void _previous;
  const { user } = await requireAuthenticatedIdentity();

  const parsed = projectUpdateInputSchema.safeParse({
    projectId: formData.get("projectId"),
    milestoneId: formData.get("milestoneId"),
    progressNote: formData.get("progressNote"),
    proofText: formData.get("proofText"),
    proofLink: formData.get("proofLink") ?? "",
    nextStep: formData.get("nextStep"),
    marksMilestoneComplete: formData.get("marksMilestoneComplete") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        projectErrorMessage("PROJECT_UPDATE_INVALID"),
    };
  }

  const client = await createProjectServerClient();
  const { data, error } = await client.rpc(
    "add_stage8_builder_project_update",
    {
      project_id_input: parsed.data.projectId,
      milestone_id_input: parsed.data.milestoneId,
      progress_note_input: parsed.data.progressNote,
      proof_text_input: parsed.data.proofText,
      proof_link_input: parsed.data.proofLink || undefined,
      next_step_input: parsed.data.nextStep,
      marks_milestone_complete_input: parsed.data.marksMilestoneComplete,
    },
  );

  if (error || !data) {
    const code = errorCode(error, "PROJECT_UPDATE_INVALID");
    return { status: "error", message: projectErrorMessage(code) };
  }

  if (parsed.data.marksMilestoneComplete) {
    const { data: project } = await client
      .from("builder_projects")
      .select("status")
      .eq("id", parsed.data.projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (project?.status === "completed") {
      const pathways = await getCurrentEconomicPathwayState();
      if (pathways?.selectedPath) {
        await recordProductEventForUser(
          user.id,
          "first_value_challenge_completed",
          {
            projectId: parsed.data.projectId,
            pathKey: pathways.selectedPath.key,
            recommendationId: pathways.id,
          },
        );
      }
    }
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${parsed.data.projectId}`);
  redirect(`/projects/${parsed.data.projectId}`);
}
