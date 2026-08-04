"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
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
      kind: z.enum(["initial", "regenerate", "refine"]),
      sourceJourneyId: z.uuid().optional(),
      refinementInstruction: z.string().optional(),
    })
    .safeParse({
      kind: formData.get("kind"),
      sourceJourneyId: formData.get("sourceJourneyId") || undefined,
      refinementInstruction: formData.get("refinementInstruction") || undefined,
    });
  if (!parsed.success)
    return { status: "error", message: "That Journey request is not valid." };
  const result = await generateCurrentJourney(parsed.data);
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/journey");
}
export async function activateJourneyAction(formData: FormData) {
  await requireAuthenticatedIdentity();
  const journeyId = z.uuid().safeParse(formData.get("journeyId"));
  if (!journeyId.success) return;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("activate_stage6_journey", {
    journey_id_input: journeyId.data,
  });
  if (error || !data) return;
  revalidatePath("/journey");
  redirect("/journey");
}
