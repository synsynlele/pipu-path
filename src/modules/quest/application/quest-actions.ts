"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { createQuestServerClient } from "../infrastructure/quest-client";
import {
  questEvidenceInputSchema,
  questReflectionInputSchema,
  type QuestErrorCode,
} from "../domain/quest-contract";
import {
  generateCurrentQuestPack,
  questErrorMessage,
} from "./quest-generation";

const evidenceBucket = "quest-evidence";
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maximumImageBytes = 5 * 1024 * 1024;

export type QuestFormState =
  { status: "idle" } | { status: "error"; message: string };

function errorCode(error: unknown, fallback: QuestErrorCode) {
  const match = (error instanceof Error ? error.message : String(error)).match(
    /QUEST_[A-Z_]+/,
  )?.[0] as QuestErrorCode | undefined;
  return match ?? fallback;
}

export async function generateQuestPackAction(
  _previous: QuestFormState,
  _formData: FormData,
): Promise<QuestFormState> {
  void _previous;
  void _formData;

  const result = await generateCurrentQuestPack();
  if (!result.ok) return { status: "error", message: result.message };

  redirect("/quests");
}

export async function startQuestAction(
  _previous: QuestFormState,
  formData: FormData,
): Promise<QuestFormState> {
  void _previous;
  await requireAuthenticatedIdentity();

  const parsed = z.uuid().safeParse(formData.get("questId"));
  if (!parsed.success) {
    return { status: "error", message: "That Quest is not valid." };
  }

  const client = await createQuestServerClient();
  const { data, error } = await client.rpc("start_stage7_quest", {
    quest_id_input: parsed.data,
  });

  if (error || !data) {
    const code = errorCode(error, "QUEST_NOT_AVAILABLE");
    return { status: "error", message: questErrorMessage(code) };
  }

  revalidatePath("/quests");
  revalidatePath(`/quests/${parsed.data}`);
  redirect(`/quests/${parsed.data}`);
}

export async function submitQuestEvidenceAction(
  _previous: QuestFormState,
  formData: FormData,
): Promise<QuestFormState> {
  void _previous;
  const { user } = await requireAuthenticatedIdentity();

  const parsed = questEvidenceInputSchema.safeParse({
    questId: formData.get("questId"),
    evidenceText: formData.get("evidenceText"),
    evidenceLink: formData.get("evidenceLink") ?? "",
    happenedOn: formData.get("happenedOn"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        questErrorMessage("QUEST_EVIDENCE_INVALID"),
    };
  }

  const client = await createQuestServerClient();
  const image = formData.get("evidenceImage");
  let uploadedPath: string | undefined;

  if (image instanceof File && image.size > 0) {
    if (image.size > maximumImageBytes || !acceptedImageTypes.has(image.type)) {
      return {
        status: "error",
        message: questErrorMessage("QUEST_IMAGE_INVALID"),
      };
    }

    const extension =
      image.type === "image/png"
        ? "png"
        : image.type === "image/webp"
          ? "webp"
          : "jpg";
    uploadedPath = `${user.id}/${parsed.data.questId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await client.storage
      .from(evidenceBucket)
      .upload(uploadedPath, image, {
        contentType: image.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return {
        status: "error",
        message: questErrorMessage("QUEST_IMAGE_UPLOAD_FAILED"),
      };
    }
  }

  const { data, error } = await client.rpc("submit_stage7_quest_evidence", {
    quest_id_input: parsed.data.questId,
    evidence_text_input: parsed.data.evidenceText,
    happened_on_input: parsed.data.happenedOn,
    ...(parsed.data.evidenceLink
      ? { evidence_link_input: parsed.data.evidenceLink }
      : {}),
    ...(uploadedPath ? { image_path_input: uploadedPath } : {}),
  });

  if (error || !data) {
    if (uploadedPath) {
      await client.storage.from(evidenceBucket).remove([uploadedPath]);
    }
    const code = errorCode(error, "QUEST_EVIDENCE_INVALID");
    return { status: "error", message: questErrorMessage(code) };
  }

  revalidatePath("/quests");
  revalidatePath(`/quests/${parsed.data.questId}`);
  redirect(`/quests/${parsed.data.questId}`);
}

export async function completeQuestAction(
  _previous: QuestFormState,
  formData: FormData,
): Promise<QuestFormState> {
  void _previous;
  await requireAuthenticatedIdentity();

  const parsed = questReflectionInputSchema.safeParse({
    questId: formData.get("questId"),
    whatIDid: formData.get("whatIDid"),
    whatHappened: formData.get("whatHappened"),
    whatILearned: formData.get("whatILearned"),
    whatIWillChange: formData.get("whatIWillChange"),
    nortnspoilReflection: formData.get("nortnspoilReflection"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        questErrorMessage("QUEST_REFLECTION_INVALID"),
    };
  }

  const client = await createQuestServerClient();
  const { data, error } = await client.rpc("complete_stage7_quest", {
    quest_id_input: parsed.data.questId,
    what_i_did_input: parsed.data.whatIDid,
    what_happened_input: parsed.data.whatHappened,
    what_i_learned_input: parsed.data.whatILearned,
    what_i_will_change_input: parsed.data.whatIWillChange,
    nortnspoil_reflection_input: parsed.data.nortnspoilReflection,
  });

  if (error || !data) {
    const code = errorCode(error, "QUEST_REFLECTION_INVALID");
    return { status: "error", message: questErrorMessage(code) };
  }

  revalidatePath("/quests");
  revalidatePath("/journey");
  revalidatePath(`/quests/${parsed.data.questId}`);
  redirect(`/quests/${parsed.data.questId}/complete`);
}
