"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createLogger } from "@/lib/observability/logger";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  choiceSchema,
  draftSchema,
  canRecordAttempt,
  emptyDraft,
} from "../domain/build";
import { buildServiceClient } from "../infrastructure/client";
import { startBuildForUser } from "./start-build";
export type BuildFormState = { ok: boolean; message: string; version?: number };
const logger = createLogger();
export async function startRealBuild(
  _previous: BuildFormState,
  form: FormData,
): Promise<BuildFormState> {
  const { user } = await requireAuthenticatedIdentity();
  const choice = choiceSchema.safeParse({
    topic: form.get("topic"),
    minutes: form.get("minutes"),
    focus: form.get("focus"),
  });
  if (!choice.success)
    return {
      ok: false,
      message:
        "Choose a topic, explain what you want to improve and pick a time.",
    };
  let id: string;
  try {
    id = await startBuildForUser(user.id, choice.data);
  } catch (error) {
    const code = error instanceof Error ? error.message : "BUILD_UNKNOWN";
    logger.warn("real_build_start_failed", {
      code: /^(?:BUILD_[A-Z_]+|OPENAI_[A-Z_0-9]+)$/.test(code)
        ? code
        : "BUILD_UNKNOWN",
    });
    return {
      ok: false,
      message:
        code === "BUILD_BUSY"
          ? "A challenge for this topic is being prepared. Try again in a moment."
          : code === "BUILD_AI_LIMIT"
            ? "New AI requests are paused briefly after several attempts. Your work is safe. Retry later or choose another topic with a saved challenge."
            : code === "OPENAI_TIMEOUT"
              ? "AI took too long. Your work is safe. Try again."
              : "We couldn’t create and save a new challenge. Your work is safe. Please try again.",
    };
  }
  revalidatePath("/real-quests");
  redirect(`/real-quests/${id}`);
}
const identity = z.object({
  id: z.uuid(),
  version: z.coerce.number().int().positive(),
  intent: z.enum(["save", "record", "archive"]),
});
export async function saveRealBuild(
  _previous: BuildFormState,
  form: FormData,
): Promise<BuildFormState> {
  const { user } = await requireAuthenticatedIdentity();
  const key = identity.safeParse({
    id: form.get("id"),
    version: form.get("version"),
    intent: form.get("intent"),
  });
  const draft = draftSchema.safeParse({
    evidence: form.get("evidence") ?? "",
    link: form.get("link") ?? "",
    reflection: form.get("reflection") ?? "",
    nextChange: form.get("nextChange") ?? "",
    outcome: form.get("outcome") ?? "",
  });
  if (!key.success || !draft.success)
    return {
      ok: false,
      message:
        "Check the fields. Use a full http or https link, or leave it empty.",
    };
  if (key.data.intent === "record" && !canRecordAttempt(draft.data))
    return {
      ok: false,
      message:
        "Describe what you actually did (at least 20 characters), what you learned and your next change (at least 10 each). Choose what happened.",
    };
  const service = buildServiceClient();
  const owned = await service
    .from("real_build_attempts")
    .select("id,status,image_path,version")
    .eq("id", key.data.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (owned.error || !owned.data)
    return {
      ok: false,
      message:
        "This attempt could not be opened. Return to Real Quests and try again.",
    };
  if (owned.data.status !== "active" || owned.data.version !== key.data.version)
    return {
      ok: false,
      message:
        "This attempt changed in another tab. Your edits are still here. Copy any unsaved text, then reload to see the latest saved version.",
    };
  const image = form.get("photo");
  let newPath: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (
      image.size > 3 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(image.type)
    )
      return {
        ok: false,
        message:
          "Choose one JPG, PNG or WebP image smaller than 3 MB, or use a written account.",
      };
    const bytes = new Uint8Array(await image.arrayBuffer());
    const valid =
      image.type === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : image.type === "image/png"
          ? [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
          : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    if (!valid)
      return {
        ok: false,
        message:
          "This file does not match its image type. Choose another image or save a written account.",
      };
    const extension =
      image.type === "image/jpeg"
        ? "jpg"
        : image.type === "image/png"
          ? "png"
          : "webp";
    newPath = `${user.id}/${key.data.id}/${crypto.randomUUID()}.${extension}`;
    const upload = await service.storage
      .from("real-build-evidence")
      .upload(newPath, bytes, { contentType: image.type, upsert: false });
    if (upload.error)
      return {
        ok: false,
        message:
          "Your photo could not be uploaded. Your text is still here. Try again or remove the photo.",
      };
  }
  const status =
    key.data.intent === "record"
      ? "recorded"
      : key.data.intent === "archive"
        ? "archived"
        : "active";
  const saved = await service
    .from("real_build_attempts")
    .update({
      draft: draft.data,
      status,
      version: key.data.version + 1,
      image_path: newPath ?? owned.data.image_path,
      recorded_at: status === "recorded" ? new Date().toISOString() : null,
    })
    .eq("id", key.data.id)
    .eq("user_id", user.id)
    .eq("version", key.data.version)
    .eq("status", "active")
    .select("id")
    .maybeSingle();
  if (saved.error || !saved.data) {
    if (newPath)
      await service.storage.from("real-build-evidence").remove([newPath]);
    return {
      ok: false,
      message:
        "Your attempt was not saved. Keep this page open and try again. If another tab changed it, copy your text before reloading.",
    };
  }
  // Previous images are retained as private evidence; account deletion removes owner-folder objects.
  revalidatePath("/real-quests");
  revalidatePath(`/real-quests/${key.data.id}`);
  revalidatePath("/you");
  if (status !== "active")
    redirect(
      status === "recorded" ? `/real-quests/${key.data.id}` : "/real-quests",
    );
  return {
    ok: true,
    message: "Saved. You can safely leave and return.",
    version: key.data.version + 1,
  };
}

export async function improveRealBuild(
  _previous: BuildFormState,
  form: FormData,
): Promise<BuildFormState> {
  const { user } = await requireAuthenticatedIdentity();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success)
    return { ok: false, message: "Open your saved attempt and try again." };
  const service = buildServiceClient();
  const old = await service
    .from("real_build_attempts")
    .select("*")
    .eq("id", id.data)
    .eq("user_id", user.id)
    .eq("status", "recorded")
    .maybeSingle();
  if (old.error || !old.data)
    return { ok: false, message: "This recorded attempt could not be opened." };
  const current = await service
    .from("real_build_attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (current.error)
    return {
      ok: false,
      message: "Your current work could not be loaded. Try again.",
    };
  let nextId = current.data?.id;
  if (!nextId) {
    const next = await service
      .from("real_build_attempts")
      .insert({
        user_id: user.id,
        template_id: old.data.template_id,
        previous_attempt_id: old.data.id,
        topic: old.data.topic,
        minutes: old.data.minutes,
        focus: old.data.focus,
        difficulty: old.data.difficulty,
        challenge: old.data.challenge,
        source: "openai",
        draft: emptyDraft,
      })
      .select("id")
      .single();
    nextId = next.data?.id;
    if (next.error?.code === "23505") {
      const winner = await service
        .from("real_build_attempts")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      nextId = winner.data?.id;
    }
    if (!nextId)
      return {
        ok: false,
        message:
          "Your next attempt was not saved. Your previous work is safe. Try again.",
      };
  }
  revalidatePath("/real-quests");
  revalidatePath("/you");
  redirect(`/real-quests/${nextId}`);
}
