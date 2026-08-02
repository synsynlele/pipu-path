"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { generateCurrentMission } from "./mission-generation";

export type MissionFormState =
  { status: "idle" } | { status: "error"; message: string };

export async function generateMissionAction(
  _previous: MissionFormState,
  formData: FormData,
): Promise<MissionFormState> {
  void _previous;
  const parsed = z
    .object({
      kind: z.enum(["initial", "regenerate", "refine"]),
      sourceMissionId: z.uuid().optional(),
      refinementInstruction: z.string().optional(),
    })
    .safeParse({
      kind: formData.get("kind"),
      sourceMissionId: formData.get("sourceMissionId") || undefined,
      refinementInstruction: formData.get("refinementInstruction") || undefined,
    });
  if (!parsed.success) {
    return { status: "error", message: "That mission request is not valid." };
  }
  const result = await generateCurrentMission(parsed.data);
  if (!result.ok) return { status: "error", message: result.message };
  redirect("/mission");
}

export async function activateMissionAction(formData: FormData) {
  await requireAuthenticatedIdentity();
  const missionId = z.uuid().safeParse(formData.get("missionId"));
  if (!missionId.success) return;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("activate_stage5_mission", {
    mission_id_input: missionId.data,
  });
  if (error || !data) return;
  revalidatePath("/mission");
  redirect("/mission");
}
