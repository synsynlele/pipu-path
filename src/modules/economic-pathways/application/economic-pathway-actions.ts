"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  asEconomicPathwayClient,
  getCurrentEconomicPathwayState,
  recordProductEventForUser,
} from "../infrastructure/economic-pathway-dal";
import { generateCurrentEconomicPathways } from "./economic-pathway-generation";

export type EconomicPathwayFormState =
  { status: "idle" } | { status: "error"; message: string };

export async function generateEconomicPathwaysAction(
  _previous: EconomicPathwayFormState,
): Promise<EconomicPathwayFormState> {
  void _previous;
  const result = await generateCurrentEconomicPathways();
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/onboarding/discovery/profile");
  redirect("/onboarding/discovery/profile");
}

export async function selectEconomicPathAction(
  _previous: EconomicPathwayFormState,
  formData: FormData,
): Promise<EconomicPathwayFormState> {
  void _previous;
  const parsed = z
    .object({ recommendationId: z.uuid(), pathKey: z.string().min(3).max(60) })
    .safeParse({
      recommendationId: formData.get("recommendationId"),
      pathKey: formData.get("pathKey"),
    });
  if (!parsed.success) {
    return { status: "error", message: "Choose one of your available paths." };
  }

  const { user } = await requireAuthenticatedIdentity();
  const state = await getCurrentEconomicPathwayState();
  if (!state || state.id !== parsed.data.recommendationId) {
    return {
      status: "error",
      message: "Those possible paths are no longer available.",
    };
  }
  if (!state.possiblePaths.some((path) => path.key === parsed.data.pathKey)) {
    return { status: "error", message: "Choose one of your available paths." };
  }
  if (state.selectedPathKey === parsed.data.pathKey) {
    redirect("/onboarding/discovery/profile/complete");
  }

  const browser = await createServerSupabaseClient();
  const { data: currentMission } = await browser
    .from("user_missions")
    .select("id,status")
    .eq("user_id", user.id)
    .in("status", ["draft", "active", "paused"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (currentMission) {
    return {
      status: "error",
      message:
        "Your current mission already uses the path you selected. Complete that mission cycle before changing paths.",
    };
  }

  const service = asEconomicPathwayClient(createServiceRoleSupabaseClient());
  const { data, error } = await service
    .from("economic_pathway_recommendations")
    .update({
      selected_path_key: parsed.data.pathKey,
      selected_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.recommendationId)
    .eq("user_id", user.id)
    .select("id")
    .single();
  if (error || !data) {
    return {
      status: "error",
      message: "Your selected path could not be saved.",
    };
  }

  await recordProductEventForUser(
    user.id,
    state.selectedPathKey ? "path_changed" : "path_selected",
    {
      recommendationId: state.id,
      pathKey: parsed.data.pathKey,
      previousPathKey: state.selectedPathKey,
    },
  );
  revalidatePath("/onboarding/discovery/profile");
  revalidatePath("/mission");
  redirect("/onboarding/discovery/profile/complete");
}
