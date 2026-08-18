"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  recordCurrentUserProductEvent,
  recordProductEventForUser,
} from "@/modules/analytics/infrastructure/product-events";
import {
  institutionMemberSchema,
  institutionProvisionSchema,
  institutionVerificationCloseSchema,
  institutionVerificationRequestSchema,
  institutionVerificationResponseSchema,
  institutionWorkspaceRevokeSchema,
} from "../domain/institution-contract";
import { runInstitutionAdminRpc } from "../infrastructure/institution-admin-dal";
import { runInstitutionRpc } from "../infrastructure/institution-dal";

function finishBuilder(status: "created" | "updated" | "error"): never {
  revalidatePath("/profile/verification");
  redirect(`/profile/verification?institution=${status}`);
}

function finishInstitution(
  workspaceId: string,
  status: "updated" | "error",
): never {
  revalidatePath("/institution");
  redirect(
    `/institution?workspace=${encodeURIComponent(workspaceId)}&status=${status}`,
  );
}

function finishAdmin(status: "updated" | "error"): never {
  revalidatePath("/admin/institutions");
  redirect(`/admin/institutions?status=${status}`);
}

export async function requestInstitutionVerificationAction(formData: FormData) {
  const parsed = institutionVerificationRequestSchema.safeParse({
    claimId: formData.get("claimId"),
    evidenceId: formData.get("evidenceId"),
    requestNote: formData.get("requestNote") ?? "",
  });
  if (!parsed.success) finishBuilder("error");

  const result = await runInstitutionRpc(
    "request_stage19_institution_capability_verification",
    {
      claim_id_input: parsed.data.claimId,
      evidence_id_input: parsed.data.evidenceId,
      request_note_input: parsed.data.requestNote || null,
    },
  );
  if (!result.error && result.data) {
    await recordCurrentUserProductEvent("institution_verification_requested", {
      verificationId: String(result.data),
      evidenceId: parsed.data.evidenceId,
    });
  }
  finishBuilder(result.error || !result.data ? "error" : "created");
}

export async function closeInstitutionVerificationAction(formData: FormData) {
  const parsed = institutionVerificationCloseSchema.safeParse({
    verificationId: formData.get("verificationId"),
    workspaceId: formData.get("workspaceId") || undefined,
    action: formData.get("action"),
  });
  if (!parsed.success) finishBuilder("error");

  const rpcName =
    parsed.data.action === "withdraw"
      ? "withdraw_stage19_institution_capability_verification"
      : "revoke_stage19_institution_capability_verification";
  const result = await runInstitutionRpc(rpcName, {
    verification_id_input: parsed.data.verificationId,
  });
  if (parsed.data.workspaceId) {
    finishInstitution(
      parsed.data.workspaceId,
      result.error || !result.data ? "error" : "updated",
    );
  }
  finishBuilder(result.error || !result.data ? "error" : "updated");
}

export async function respondInstitutionVerificationAction(formData: FormData) {
  const parsed = institutionVerificationResponseSchema.safeParse({
    verificationId: formData.get("verificationId"),
    workspaceId: formData.get("workspaceId"),
    action: formData.get("action"),
    responseNote: formData.get("responseNote") ?? "",
  });
  if (!parsed.success) {
    const workspaceId = String(formData.get("workspaceId") ?? "");
    finishInstitution(workspaceId, "error");
  }

  const result = await runInstitutionRpc(
    "respond_stage19_institution_capability_verification",
    {
      verification_id_input: parsed.data.verificationId,
      confirm_input: parsed.data.action === "confirm",
      response_note_input: parsed.data.responseNote || null,
    },
  );
  if (!result.error && result.data && parsed.data.action === "confirm") {
    await recordProductEventForUser(
      String(result.data),
      "institution_verification_confirmed",
      { verificationId: parsed.data.verificationId },
    );
  }
  finishInstitution(
    parsed.data.workspaceId,
    result.error || !result.data ? "error" : "updated",
  );
}

export async function provisionInstitutionWorkspaceAction(formData: FormData) {
  const parsed = institutionProvisionSchema.safeParse({
    cohortId: formData.get("cohortId"),
    ownerUsername: formData.get("ownerUsername"),
  });
  if (!parsed.success) finishAdmin("error");
  const result = await runInstitutionAdminRpc(
    "provision_stage19_institution_workspace_server",
    {
      cohort_id_input: parsed.data.cohortId,
      owner_username_input: parsed.data.ownerUsername,
    },
  );
  finishAdmin(result.error || !result.data ? "error" : "updated");
}

export async function setInstitutionMemberAction(formData: FormData) {
  const parsed = institutionMemberSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    targetUsername: formData.get("targetUsername"),
    role: formData.get("role"),
    action: formData.get("action"),
  });
  if (!parsed.success) finishAdmin("error");
  const result = await runInstitutionAdminRpc(
    "set_stage19_institution_member_server",
    {
      workspace_id_input: parsed.data.workspaceId,
      target_username_input: parsed.data.targetUsername,
      role_input: parsed.data.role,
      active_input: parsed.data.action === "activate",
    },
  );
  finishAdmin(result.error || !result.data ? "error" : "updated");
}

export async function revokeInstitutionWorkspaceAction(formData: FormData) {
  const parsed = institutionWorkspaceRevokeSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
  });
  if (!parsed.success) finishAdmin("error");
  const result = await runInstitutionAdminRpc(
    "revoke_stage19_institution_workspace_server",
    { workspace_id_input: parsed.data.workspaceId },
  );
  finishAdmin(result.error || !result.data ? "error" : "updated");
}
