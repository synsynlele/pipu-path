"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { generateCurrentHumanPotentialProfile } from "./profile-generation";

export type ProfileGenerationFormState =
  { status: "idle" } | { status: "error"; message: string };

export async function generateProfileAction(
  _previous: ProfileGenerationFormState,
): Promise<ProfileGenerationFormState> {
  void _previous;
  const result = await generateCurrentHumanPotentialProfile();
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/onboarding/discovery/profile");
}

const feedbackSchema = z.object({
  insightId: z.uuid(),
  feedback: z.enum(["confirmed", "partly_true", "not_true"]),
  comment: z.string().trim().max(600).optional(),
});

export async function recordProfileFeedbackAction(formData: FormData) {
  await requireAuthenticatedIdentity();
  const parsed = feedbackSchema.safeParse({
    insightId: formData.get("insightId"),
    feedback: formData.get("feedback"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) return;

  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("record_stage4_insight_feedback", {
    insight_id_input: parsed.data.insightId,
    feedback_type_input: parsed.data.feedback,
    ...(parsed.data.comment ? { reason_input: parsed.data.comment } : {}),
  });
  if (!error) revalidatePath("/onboarding/discovery/profile");
}
