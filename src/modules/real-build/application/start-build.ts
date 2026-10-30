import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { createLogger } from "@/lib/observability/logger";
import { buildServiceClient } from "../infrastructure/client";
import { generateBuildTemplate } from "../infrastructure/provider";
import { reviewedStarter } from "../domain/reviewed-starters";
import {
  difficultySchema,
  REAL_BUILD_CONTENT_VERSION,
  validateChallenge,
  type BuildChoice,
  type BuildDifficulty,
  type BuildChallenge,
} from "../domain/build";

const logger = createLogger();
function reason(error: unknown) {
  if (error instanceof Error && /^OPENAI_[A-Z_0-9]+$/.test(error.message))
    return error.message;
  if (error instanceof Error && /^BUILD_[A-Z_]+$/.test(error.message))
    return error.message;
  return "BUILD_INVALID_AI_OUTPUT";
}
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
  const progress = await service.rpc("next_real_build_difficulty", {
    user_input: userId,
    topic_input: choice.topic,
  });
  if (progress.error) throw new Error("BUILD_LOAD_FAILED");
  const parsedLevel = difficultySchema.safeParse(progress.data);
  if (!parsedLevel.success) throw new Error("BUILD_LOAD_FAILED");
  const difficulty = parsedLevel.data as BuildDifficulty;
  const focusKey = createHash("sha256")
    .update(
      REAL_BUILD_CONTENT_VERSION +
        ":" +
        choice.focus
          .normalize("NFKC")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim(),
    )
    .digest("hex");

  const unseen = await service.rpc("find_unseen_real_build_template_for_goal", {
    user_input: userId,
    topic_input: choice.topic,
    minutes_input: choice.minutes,
    difficulty_input: difficulty,
    focus_key_input: focusKey,
  });
  if (unseen.error) throw new Error("BUILD_LOAD_FAILED");
  type TemplateRow = NonNullable<typeof unseen.data>[number];
  let template: TemplateRow | null = unseen.data?.[0] ?? null;
  if (template) {
    try {
      validateChallenge(template.challenge);
    } catch {
      // Bad legacy content must not block creating a real Quest.
      logger.warn("real_build_invalid_cached_template", {
        reason: "BUILD_INVALID_TEMPLATE",
      });
      template = null;
    }
  }
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
    const token = randomUUID();
    const key = `${choice.topic}:${choice.minutes}:${difficulty}:${focusKey}`;
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
      let challenge: BuildChallenge;
      let source: "openai" | "reviewed" = "openai";
      if (!allowance.data) {
        // No additional AI request when the account's cost allowance is reached.
        source = "reviewed";
        challenge = reviewedStarter(choice, difficulty);
      } else {
        try {
          challenge = await generateBuildTemplate(
            choice,
            (pool.data ?? [])
              .map((v) => v.challenge?.title)
              .filter((title): title is string => typeof title === "string"),
            difficulty,
          );
          if (
            (pool.data ?? []).some(
              (v) =>
                typeof v.challenge?.title === "string" &&
                v.challenge.title.toLowerCase() ===
                  challenge.title.toLowerCase(),
            )
          )
            throw new Error("BUILD_REPEATED");
        } catch (error) {
          // Do not charge a second provider request or skip safety validation.
          logger.warn("real_build_reviewed_fallback", {
            reason: reason(error),
          });
          source = "reviewed";
          challenge = reviewedStarter(choice, difficulty);
        }
      }
      if (source === "reviewed") {
        // Previously approved starter for this exact goal may be reused.
        const existing = (pool.data ?? []).find((v) => {
          try {
            return (
              v.source === "reviewed" &&
              validateChallenge(v.challenge).title === challenge.title
            );
          } catch {
            return false;
          }
        });
        if (existing) template = existing;
      }
      if (!template) {
        const saved = await service
          .from("real_build_templates")
          .insert({
            topic: choice.topic,
            minutes: choice.minutes,
            difficulty,
            focus_key: focusKey,
            challenge,
            source,
          })
          .select("*")
          .single();
        if (saved.error || !saved.data) {
          logger.warn("real_build_template_save_failed", {
            code: saved.error?.code ?? "MISSING_ROW",
          });
          throw new Error("BUILD_SAVE_FAILED");
        }
        template = saved.data;
      }
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
      source: template.source,
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
  if (result.error || !result.data) {
    logger.warn("real_build_attempt_save_failed", {
      code: result.error?.code ?? "MISSING_ROW",
    });
    throw new Error("BUILD_SAVE_FAILED");
  }
  return result.data.id;
}
