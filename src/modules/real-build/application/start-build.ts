import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { buildServiceClient } from "../infrastructure/client";
import { generateBuildTemplate } from "../infrastructure/provider";
import {
  difficultySchema,
  validateChallenge,
  type BuildChoice,
  type BuildDifficulty,
} from "../domain/build";

export async function startBuildForUser(userId: string, choice: BuildChoice) {
  const service = buildServiceClient();
  const current = await service
    .from("real_build_attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (current.error) throw new Error("BUILD_LOAD_FAILED");
  if (current.data) return current.data.id;
  // Server-derived from recorded attempts in this topic. No answers, evidence,
  // private reflections or personal identifiers are forwarded to the AI.
  const progress = await service.rpc("next_real_build_difficulty", {
    user_input: userId,
    topic_input: choice.topic,
  });
  if (progress.error) throw new Error("BUILD_LOAD_FAILED");
  const parsedLevel = difficultySchema.safeParse(progress.data);
  if (!parsedLevel.success) throw new Error("BUILD_LOAD_FAILED");
  const difficulty = parsedLevel.data as BuildDifficulty;
  // Reusable challenges are indexed by a normalized goal, not a learner identity.
  const focusKey = createHash("sha256")
    .update(choice.focus.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim())
    .digest("hex");

  const unseen = await service.rpc("find_unseen_real_build_template_for_goal", {
    user_input: userId,
    topic_input: choice.topic,
    minutes_input: choice.minutes,
    difficulty_input: difficulty,
    focus_key_input: focusKey,
  });
  if (unseen.error) throw new Error("BUILD_LOAD_FAILED");
  let template = unseen.data?.[0];
  if (!template) {
    const pool = await service
      .from("real_build_templates")
      .select("*")
      .eq("topic", choice.topic)
      .eq("minutes", choice.minutes)
      .eq("difficulty", difficulty)
      .eq("focus_key", focusKey)
      .order("created_at", { ascending: false })
      .limit(30);
    if (pool.error) throw new Error("BUILD_LOAD_FAILED");
    const token = randomUUID(),
      key = `${choice.topic}:${choice.minutes}:${difficulty}:${focusKey}`;
    const lease = await service.rpc("claim_real_build_generation", {
      key_input: key,
      token_input: token,
    });
    if (lease.error) throw new Error("BUILD_LOAD_FAILED");
    if (!lease.data) throw new Error("BUILD_BUSY");
    try {
      const allowance = await service.rpc("begin_real_build_request", {
        user_input: userId,
      });
      if (allowance.error) throw new Error("BUILD_LOAD_FAILED");
      if (!allowance.data) throw new Error("BUILD_AI_LIMIT");
      const challenge = await generateBuildTemplate(
        choice,
        (pool.data ?? []).map((v) => v.challenge.title),
        difficulty,
      );
      if (
        (pool.data ?? []).some(
          (v) =>
            v.challenge.title.toLowerCase() === challenge.title.toLowerCase(),
        )
      )
        throw new Error("BUILD_REPEATED");
      const saved = await service
        .from("real_build_templates")
        .insert({
          topic: choice.topic,
          minutes: choice.minutes,
          difficulty,
          focus_key: focusKey,
          challenge,
          source: "openai",
        })
        .select("*")
        .single();
      if (saved.error || !saved.data) throw new Error("BUILD_SAVE_FAILED");
      template = saved.data;
    } finally {
      await service
        .from("real_build_generation_leases")
        .delete()
        .eq("cache_key", key)
        .eq("token", token);
    }
  }
  if (template.difficulty !== difficulty || template.focus_key !== focusKey)
    throw new Error("BUILD_LOAD_FAILED");
  const challenge = validateChallenge(template.challenge);
  const result = await service
    .from("real_build_attempts")
    .insert({
      user_id: userId,
      template_id: template.id,
      ...choice,
      difficulty,
      challenge,
      source: "openai",
    })
    .select("id")
    .single();
  if (result.error?.code === "23505") {
    const winner = await service
      .from("real_build_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();
    if (winner.data) return winner.data.id;
  }
  if (result.error || !result.data) throw new Error("BUILD_SAVE_FAILED");
  return result.data.id;
}
