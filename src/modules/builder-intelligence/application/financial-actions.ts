"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { buildServiceClient } from "@/modules/real-build/infrastructure/client";
import { buildGoalKey } from "@/modules/real-build/infrastructure/goal-key";
import { validateChallenge } from "@/modules/real-build/domain/build";
import { getFinancialStage } from "../domain/financial-pathway";
import { isStageAllowedForAge } from "../domain/builder-pathway";

export type FinancialStartState = { status: "idle" } | { status: "error"; message: string };

const unavailable = "This reviewed Quest could not be started. Your existing work is safe; please try again.";

export async function startFinancialQuestAction(
  _previous: FinancialStartState,
  formData: FormData,
): Promise<FinancialStartState> {
  void _previous;
  const key = z.string().regex(/^[a-z][a-z0-9_]{2,59}$/).safeParse(
    formData.get("stage"),
  );
  if (!key.success) return { status: "error", message: "Choose a valid stage." };
  const stage = getFinancialStage(key.data);
  if (!stage) return { status: "error", message: "This stage is unavailable." };

  // This guard is enforced server-side on every mutation, never only by UI.
  const { user, profile } = await requireAuthenticatedIdentity();
  if (!isStageAllowedForAge(stage, profile.age_band)) {
    return { status: "error", message: "This stage is not available for your age group." };
  }

  const service = buildServiceClient();
  const active = await service
    .from("real_build_attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (active.error) return { status: "error", message: unavailable };
  if (active.data) redirect(`/real-quests/${active.data.id}`);

  // Use existing actor-owned evidence for prerequisites. Never count city choices.
  if (stage.prerequisites.length) {
    const requiredTitles = stage.prerequisites.map((code) =>
      getFinancialStage(code)?.quest.challenge.title,
    );
    if (requiredTitles.some((title) => !title))
      return { status: "error", message: unavailable };
    const { data: recorded, error } = await service
      .from("real_build_attempts")
      .select("challenge")
      .eq("user_id", user.id)
      .eq("status", "recorded")
      .in("challenge->>title", requiredTitles as string[]);
    if (error) return { status: "error", message: unavailable };
    const found = new Set((recorded ?? []).map((item) => item.challenge.title));
    if (!requiredTitles.every((title) => found.has(title!))) {
      return { status: "error", message: "Record an honest real-world attempt for the earlier stage first." };
    }
  }

  // Curated offline-safe content; zero model calls, payments or XP writes.
  const challenge = validateChallenge(stage.quest.challenge);
  const focusKey = buildGoalKey({
    topic: stage.quest.topic,
    minutes: stage.quest.minutes,
    focus: stage.quest.focus,
  });
  const templates = () =>
    service
      .from("real_build_templates")
      .select("id")
      .eq("topic", stage.quest.topic)
      .eq("minutes", stage.quest.minutes)
      .eq("focus_key", focusKey)
      .eq("source", "reviewed")
      .filter("challenge->>title", "eq", challenge.title)
      .maybeSingle();
  let matching = await templates();
  if (matching.error) return { status: "error", message: unavailable };
  if (!matching.data) {
    const created = await service
      .from("real_build_templates")
      .insert({
        topic: stage.quest.topic,
        minutes: stage.quest.minutes,
        difficulty: stage.difficulty,
        focus_key: focusKey,
        challenge,
        source: "reviewed",
      })
      .select("id")
      .single();
    if (created.error) {
      // A concurrent learner may have inserted the shared reviewed template.
      if (created.error.code !== "23505")
        return { status: "error", message: unavailable };
      matching = await templates();
      if (matching.error || !matching.data)
        return { status: "error", message: unavailable };
    } else {
      matching = { data: created.data, error: null, count: null, status: 200, statusText: "OK" };
    }
  }
  if (!matching.data) return { status: "error", message: unavailable };

  const inserted = await service
    .from("real_build_attempts")
    .insert({
      user_id: user.id,
      template_id: matching.data.id,
      topic: stage.quest.topic,
      minutes: stage.quest.minutes,
      difficulty: stage.difficulty,
      focus: stage.quest.focus,
      challenge,
      source: "reviewed",
    })
    .select("id")
    .single();
  if (inserted.error?.code === "23505") {
    const winner = await service
      .from("real_build_attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (winner.data) redirect(`/real-quests/${winner.data.id}`);
  }
  if (inserted.error || !inserted.data)
    return { status: "error", message: unavailable };
  revalidatePath("/real-quests");
  revalidatePath("/real-quests/finance");
  redirect(`/real-quests/${inserted.data.id}`);
}
