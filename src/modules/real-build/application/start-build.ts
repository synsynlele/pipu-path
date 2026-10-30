import "server-only";
import { randomUUID } from "node:crypto";
import { buildServiceClient } from "../infrastructure/client";
import { generateBuildTemplate } from "../infrastructure/provider";
import { validateChallenge, type BuildChoice } from "../domain/build";

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
  const unseen = await service.rpc("find_unseen_real_build_template", {
    user_input: userId,
    topic_input: choice.topic,
    minutes_input: choice.minutes,
  });
  if (unseen.error) throw new Error("BUILD_LOAD_FAILED");
  let template = unseen.data?.[0];
  if (!template) {
    const pool = await service
      .from("real_build_templates")
      .select("*")
      .eq("topic", choice.topic)
      .eq("minutes", choice.minutes)
      .order("created_at", { ascending: false })
      .limit(30);
    if (pool.error) throw new Error("BUILD_LOAD_FAILED");
    const token = randomUUID(),
      key = `${choice.topic}:${choice.minutes}`;
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
        .insert({ ...choice, challenge, source: "openai" })
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
  const challenge = validateChallenge(template.challenge);
  const result = await service
    .from("real_build_attempts")
    .insert({
      user_id: userId,
      template_id: template.id,
      ...choice,
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
