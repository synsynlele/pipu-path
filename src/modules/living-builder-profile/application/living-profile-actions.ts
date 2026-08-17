"use server";

import { revalidatePath } from "next/cache";
import {
  builderCapabilityFeedbackTypes,
  type BuilderCapabilityFeedbackType,
} from "../domain/living-profile-contract";
import {
  recordLivingBuilderCapabilityFeedback,
  refreshLivingBuilderProfile,
} from "../infrastructure/living-profile-dal";

export async function refreshLivingBuilderProfileAction() {
  const { error } = await refreshLivingBuilderProfile();
  if (error) throw new Error(error.message ?? "BUILDER_PROFILE_REFRESH_FAILED");
  revalidatePath("/profile");
}

export async function recordLivingBuilderCapabilityFeedbackAction(
  formData: FormData,
) {
  const claimId = String(formData.get("claim_id") ?? "");
  const feedbackType = String(formData.get("feedback_type") ?? "");
  const contextNote = String(formData.get("context_note") ?? "").trim();

  if (
    !claimId ||
    !builderCapabilityFeedbackTypes.includes(
      feedbackType as BuilderCapabilityFeedbackType,
    )
  ) {
    throw new Error("BUILDER_PROFILE_FEEDBACK_INVALID");
  }

  const { error } = await recordLivingBuilderCapabilityFeedback(
    claimId,
    feedbackType as BuilderCapabilityFeedbackType,
    contextNote || null,
  );
  if (error)
    throw new Error(error.message ?? "BUILDER_PROFILE_FEEDBACK_FAILED");
  revalidatePath("/profile");
}
