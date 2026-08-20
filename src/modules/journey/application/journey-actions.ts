"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getCurrentEconomicPathwayState,
  recordProductEventForUser,
} from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { generateCurrentQuestPack } from "@/modules/quest/application/quest-generation";
import { generateCurrentJourney } from "./journey-generation";

export type JourneyFormState =
  { status: "idle" } | { status: "error"; message: string };

export async function generateJourneyAction(
  _previous: JourneyFormState,
  formData: FormData,
): Promise<JourneyFormState> {
  void _previous;
  const parsed = z
    .object({
      kind: z.enum(["initial", "regenerate", "refine", "continue"]),
      sourceJourneyId: z.uuid().optional(),
      refinementInstruction: z.string().optional(),
    })
    .safeParse({
      kind: formData.get("kind"),
      sourceJourneyId: formData.get("sourceJourneyId") || undefined,
      refinementInstruction: formData.get("refinementInstruction") || undefined,
    });
  if (!parsed.success) {
    return { status: "error", message: "That Journey request is not valid." };
  }
  const result = await generateCurrentJourney(parsed.data);
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/journey");
}

export async function activateJourneyAction(formData: FormData) {
  const { user } = await requireAuthenticatedIdentity();
  const journeyId = z.uuid().safeParse(formData.get("journeyId"));
  if (!journeyId.success) return;
  const pathways = await getCurrentEconomicPathwayState();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("activate_stage6_journey", {
    journey_id_input: journeyId.data,
  });
  if (error || !data) return;

  if (pathways?.selectedPath) {
    await recordProductEventForUser(user.id, "pathway_started", {
      journeyId: journeyId.data,
      recommendationId: pathways.id,
      pathKey: pathways.selectedPath.key,
    });
  }

  await generateCurrentQuestPack();

  revalidatePath("/journey");
  revalidatePath("/quests");
  revalidatePath("/build");
  redirect("/quests");
}
