"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  collaborationCloseSchema,
  collaborationCompletionSchema,
  collaborationContributionSchema,
  collaborationInvitationSchema,
  collaborationResponseSchema,
} from "../domain/collaboration-contract";
import { runCollaborationRpc } from "../infrastructure/collaboration-dal";

function destination(formData: FormData) {
  const value = formData.get("returnTo");
  return typeof value === "string" && value.startsWith("/connect/collaborations")
    ? value
    : "/connect/collaborations";
}

function finish(path: string, status: "created" | "updated" | "error"): never {
  revalidatePath("/connect");
  revalidatePath("/connect/collaborations");
  revalidatePath(path.split("?")[0] || "/connect/collaborations");
  redirect(`${path}${path.includes("?") ? "&" : "?"}status=${status}`);
}

export async function createCollaborationAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = collaborationInvitationSchema.safeParse({
    projectId: formData.get("projectId"),
    collaboratorId: formData.get("collaboratorId"),
    objective: formData.get("objective"),
    roleNeeded: formData.get("roleNeeded"),
    expectedContribution: formData.get("expectedContribution"),
    ownerContribution: formData.get("ownerContribution"),
    commitmentNote: formData.get("commitmentNote"),
  });
  if (!parsed.success) finish(returnTo, "error");

  const result = await runCollaborationRpc(
    "create_stage15_collaboration_invitation",
    {
      project_id_input: parsed.data.projectId,
      collaborator_id_input: parsed.data.collaboratorId,
      objective_input: parsed.data.objective,
      role_needed_input: parsed.data.roleNeeded,
      expected_contribution_input: parsed.data.expectedContribution,
      owner_contribution_input: parsed.data.ownerContribution,
      commitment_note_input: parsed.data.commitmentNote,
    },
  );
  finish(returnTo, result.error || !result.data ? "error" : "created");
}

export async function respondCollaborationAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = collaborationResponseSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
    action: formData.get("action"),
  });
  if (!parsed.success) finish(returnTo, "error");

  const result = await runCollaborationRpc("respond_stage15_collaboration", {
    collaboration_id_input: parsed.data.collaborationId,
    accept_input: parsed.data.action === "accept",
  });
  finish(returnTo, result.error || !result.data ? "error" : "updated");
}

export async function closeCollaborationAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = collaborationCloseSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
    action: formData.get("action"),
  });
  if (!parsed.success) finish(returnTo, "error");

  const result = await runCollaborationRpc("close_stage15_collaboration", {
    collaboration_id_input: parsed.data.collaborationId,
    action_input: parsed.data.action,
  });
  finish(returnTo, result.error || !result.data ? "error" : "updated");
}

export async function addCollaborationContributionAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = collaborationContributionSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
    contributionSummary: formData.get("contributionSummary"),
    evidenceNote: formData.get("evidenceNote"),
    evidenceLink: formData.get("evidenceLink") ?? "",
    nextStep: formData.get("nextStep"),
  });
  if (!parsed.success) finish(returnTo, "error");

  const result = await runCollaborationRpc(
    "add_stage15_collaboration_contribution",
    {
      collaboration_id_input: parsed.data.collaborationId,
      contribution_summary_input: parsed.data.contributionSummary,
      evidence_note_input: parsed.data.evidenceNote,
      evidence_link_input: parsed.data.evidenceLink || null,
      next_step_input: parsed.data.nextStep,
    },
  );
  finish(returnTo, result.error || !result.data ? "error" : "updated");
}

export async function confirmCollaborationCompletionAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = collaborationCompletionSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
  });
  if (!parsed.success) finish(returnTo, "error");

  const result = await runCollaborationRpc(
    "confirm_stage15_collaboration_completion",
    { collaboration_id_input: parsed.data.collaborationId },
  );
  finish(returnTo, result.error || result.data === null ? "error" : "updated");
}
