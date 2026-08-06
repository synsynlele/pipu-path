"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { generateContinuingJourney } from "./journey-continuation";

export type JourneyContinuationState =
  { status: "idle" } | { status: "error"; message: string };

export async function continueJourneyAction(
  _previous: JourneyContinuationState,
  formData: FormData,
): Promise<JourneyContinuationState> {
  void _previous;
  const parsed = z.uuid().safeParse(formData.get("sourceJourneyId"));
  if (!parsed.success) {
    return { status: "error", message: "That completed Journey is not valid." };
  }
  const result = await generateContinuingJourney(parsed.data);
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/journey");
}
