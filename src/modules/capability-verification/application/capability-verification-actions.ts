"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordCurrentUserProductEvent } from "@/modules/analytics/infrastructure/product-events";
import {
  capabilityVerificationCloseSchema,
  capabilityVerificationRequestSchema,
  capabilityVerificationResponseSchema,
} from "../domain/capability-verification-contract";
import { runCapabilityVerificationRpc } from "../infrastructure/capability-verification-dal";

const workspacePath = "/profile/verification";

function finish(status: "created" | "updated" | "error"): never {
  revalidatePath("/profile");
  revalidatePath(workspacePath);
  redirect(`${workspacePath}?status=${status}`);
}

export async function requestCapabilityVerificationAction(formData: FormData) {
  const parsed = capabilityVerificationRequestSchema.safeParse({
    claimId: formData.get("claimId"),
    evidenceId: formData.get("evidenceId"),
    requestNote: formData.get("requestNote") ?? "",
  });
  if (!parsed.success) finish("error");

  const result = await runCapabilityVerificationRpc(
    "request_stage18_collaboration_capability_verification",
    {
      claim_id_input: parsed.data.claimId,
      evidence_id_input: parsed.data.evidenceId,
      request_note_input: parsed.data.requestNote || null,
    },
  );
  if (!result.error && result.data) {
    await recordCurrentUserProductEvent("capability_verification_requested", {
      verificationId: String(result.data),
      claimId: parsed.data.claimId,
    });
  }
  finish(result.error || !result.data ? "error" : "created");
}

export async function respondCapabilityVerificationAction(formData: FormData) {
  const parsed = capabilityVerificationResponseSchema.safeParse({
    verificationId: formData.get("verificationId"),
    action: formData.get("action"),
    responseNote: formData.get("responseNote") ?? "",
  });
  if (!parsed.success) finish("error");

  const result = await runCapabilityVerificationRpc(
    "respond_stage18_collaboration_capability_verification",
    {
      verification_id_input: parsed.data.verificationId,
      confirm_input: parsed.data.action === "confirm",
      response_note_input: parsed.data.responseNote || null,
    },
  );
  if (!result.error && result.data && parsed.data.action === "confirm") {
    await recordCurrentUserProductEvent("capability_verification_confirmed", {
      verificationId: parsed.data.verificationId,
    });
  }
  finish(result.error || !result.data ? "error" : "updated");
}

export async function closeCapabilityVerificationAction(formData: FormData) {
  const parsed = capabilityVerificationCloseSchema.safeParse({
    verificationId: formData.get("verificationId"),
    action: formData.get("action"),
  });
  if (!parsed.success) finish("error");

  const rpcName =
    parsed.data.action === "withdraw"
      ? "withdraw_stage18_capability_verification"
      : "revoke_stage18_capability_verification";
  const result = await runCapabilityVerificationRpc(rpcName, {
    verification_id_input: parsed.data.verificationId,
  });
  finish(result.error || !result.data ? "error" : "updated");
}
