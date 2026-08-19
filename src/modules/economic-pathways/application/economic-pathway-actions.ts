"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getCurrentEconomicPathwayState } from "../infrastructure/economic-pathway-dal";
import { generateCurrentEconomicPathways } from "./economic-pathway-generation";

export type EconomicPathwayFormState =
  { status: "idle" } | { status: "error"; message: string };

type PathSwitchRpcClient = {
  rpc: (
    functionName: "switch_economic_path",
    args: { recommendation_id_input: string; path_key_input: string },
  ) => Promise<{
    data: boolean | null;
    error: { message: string } | null;
  }>;
};

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

  await requireAuthenticatedIdentity();
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
  const { data, error } = await (browser as unknown as PathSwitchRpcClient).rpc(
    "switch_economic_path",
    {
      recommendation_id_input: parsed.data.recommendationId,
      path_key_input: parsed.data.pathKey,
    },
  );

  if (error || data !== true) {
    return {
      status: "error",
      message:
        "Your path could not be changed safely. Your current work has been left unchanged.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/onboarding/discovery/profile");
  revalidatePath("/onboarding/discovery/profile/complete");
  revalidatePath("/mission");
  revalidatePath("/journey");
  revalidatePath("/quests");
  revalidatePath("/proof");
  redirect("/onboarding/discovery/profile/complete");
}
