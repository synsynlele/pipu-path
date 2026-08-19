"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordProductEventForUser } from "@/modules/analytics/infrastructure/product-events";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  builderGuideFeedbackSchema,
  builderGuideIntentSchema,
} from "../domain/builder-guide-contract";
import {
  getBuilderGuideContext,
  recordBuilderGuideFeedback,
} from "../infrastructure/builder-guide-dal";
import { generateBuilderGuide } from "./builder-guide-generation";

function guideReturnPath(value: FormDataEntryValue | null) {
  return value === "/growth" ? "/growth" : "/guide";
}

export async function generateBuilderGuideAction(formData: FormData) {
  const returnTo = guideReturnPath(formData.get("returnTo"));
  const parsed = builderGuideIntentSchema.safeParse(formData.get("intent"));
  if (!parsed.success) redirect(`${returnTo}?error=invalid_question`);

  const result = await generateBuilderGuide(parsed.data);
  if (!result.ok) {
    const params = new URLSearchParams({
      error: result.code.toLowerCase(),
    });
    redirect(`${returnTo}?${params.toString()}`);
  }

  revalidatePath("/guide");
  revalidatePath("/growth");
  redirect(`${returnTo}?run=${encodeURIComponent(result.runId)}`);
}

export async function recordBuilderGuideFeedbackAction(formData: FormData) {
  const parsed = builderGuideFeedbackSchema.safeParse({
    runId: formData.get("runId"),
    verdict: formData.get("verdict"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) redirect("/guide?error=feedback_invalid");

  const { user } = await requireAuthenticatedIdentity();
  const context = await getBuilderGuideContext();
  if (!context) redirect("/profile");

  try {
    await recordBuilderGuideFeedback({
      userId: user.id,
      runId: parsed.data.runId,
      verdict: parsed.data.verdict,
      note: parsed.data.note,
    });
    await recordProductEventForUser(user.id, "builder_guide_feedback", {
      runId: parsed.data.runId,
      verdict: parsed.data.verdict,
    });
  } catch {
    redirect(
      `/guide?run=${encodeURIComponent(parsed.data.runId)}&error=feedback_save_failed`,
    );
  }

  revalidatePath("/guide");
  redirect(
    `/guide?run=${encodeURIComponent(parsed.data.runId)}&feedback=saved`,
  );
}
