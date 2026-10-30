import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { buildServiceClient } from "../infrastructure/client";
import { generateBuildTemplate } from "../infrastructure/provider";
import {
  choiceSchema,
  emptyDraft,
  isRetiredPaperworkChallenge,
  validateChallenge,
} from "../domain/build";
import { continuationBrief } from "../domain/continuation";

export async function continueBuildForUser(userId: string, previousId: string) {
  const service = buildServiceClient();
  const old = await service
    .from("real_build_attempts")
    .select("*")
    .eq("id", previousId)
    .eq("user_id", userId)
    .eq("status", "recorded")
    .maybeSingle();
  if (old.error || !old.data) throw new Error("BUILD_PREVIOUS_MISSING");
  if (isRetiredPaperworkChallenge(old.data.challenge))
    throw new Error("BUILD_RETIRED");
  const choice = choiceSchema.parse({
    topic: old.data.topic,
    minutes: old.data.minutes,
    focus: old.data.focus,
  });
  const continuation = continuationBrief(old.data.challenge, old.data.draft);
  const current = await service
    .from("real_build_attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (current.error) throw new Error("BUILD_LOAD_FAILED");
  if (current.data) return current.data.id;
  // Repeated clicks on an older finished iteration reopen its existing successor.
  const child = await service
    .from("real_build_attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("previous_attempt_id", previousId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (child.error) throw new Error("BUILD_LOAD_FAILED");
  if (child.data) return child.data.id;
  const token = randomUUID();
  const key =
    "continue:" +
    createHash("sha256")
      .update(userId + ":" + previousId)
      .digest("hex");
  const lease = await service.rpc("claim_real_build_generation", {
    key_input: key,
    token_input: token,
  });
  if (lease.error) throw new Error("BUILD_LOAD_FAILED");
  if (!lease.data) throw new Error("BUILD_BUSY");
  try {
    // Recheck after claiming the lease: another tab may have saved a successor
    // between our initial reads and this claim.
    const savedChild = await service
      .from("real_build_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("previous_attempt_id", previousId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (savedChild.error) throw new Error("BUILD_LOAD_FAILED");
    if (savedChild.data) return savedChild.data.id;
    const allowance = await service.rpc("begin_real_build_request", {
      user_input: userId,
    });
    if (allowance.error) throw new Error("BUILD_LOAD_FAILED");
    if (!allowance.data) throw new Error("BUILD_AI_LIMIT");
    const challenge = validateChallenge(
      await generateBuildTemplate(
        choice,
        [],
        old.data.difficulty,
        continuation,
      ),
    );
    if (
      JSON.stringify(challenge.steps) ===
      JSON.stringify(old.data.challenge.steps)
    )
      throw new Error("BUILD_REPEATED");
    // The template FK remains the original public starting point. The personalized
    // successor lives ONLY in this owner's attempt, never in a public template.
    const next = await service
      .from("real_build_attempts")
      .insert({
        user_id: userId,
        template_id: old.data.template_id,
        previous_attempt_id: old.data.id,
        topic: old.data.topic,
        minutes: old.data.minutes,
        focus: old.data.focus,
        difficulty: old.data.difficulty,
        challenge,
        source: "openai",
        draft: emptyDraft,
      })
      .select("id")
      .single();
    if (next.error?.code === "23505") {
      const winner = await service
        .from("real_build_attempts")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (winner.data) return winner.data.id;
    }
    if (next.error || !next.data) throw new Error("BUILD_SAVE_FAILED");
    return next.data.id;
  } finally {
    await service
      .from("real_build_generation_leases")
      .delete()
      .eq("cache_key", key)
      .eq("token", token);
  }
}
