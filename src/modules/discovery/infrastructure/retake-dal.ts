import "server-only";

import { createLogger } from "@/lib/observability/logger";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

const logger = createLogger();

export type DiscoveryRetakeStart = {
  status: "started" | "resumed";
  sessionId: string;
};

export async function startDiscoveryRetakeForUser(
  userId: string,
): Promise<DiscoveryRetakeStart> {
  const service = createServiceRoleSupabaseClient();

  const [
    { data: profile, error: profileError },
    { data: activeSession, error: activeError },
    { data: completedSession, error: completedError },
  ] = await Promise.all([
    service
      .from("profiles")
      .select("age_band")
      .eq("id", userId)
      .single(),
    service
      .from("discovery_sessions")
      .select("id,status")
      .eq("user_id", userId)
      .in("status", ["in_progress", "review"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    service
      .from("discovery_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileError || activeError || completedError || !profile) {
    throw new Error("DISCOVERY_RETAKE_UNAVAILABLE");
  }

  if (activeSession) {
    await service
      .from("discovery_sessions")
      .update({ last_resumed_at: new Date().toISOString() })
      .eq("id", activeSession.id)
      .eq("user_id", userId);

    return { status: "resumed", sessionId: activeSession.id };
  }

  if (!completedSession || profile.age_band === "unknown") {
    throw new Error("DISCOVERY_RETAKE_UNAVAILABLE");
  }

  const { data: questionSets, error: questionSetError } = await service
    .from("discovery_question_sets")
    .select("id,version,intended_age_bands")
    .eq("status", "published")
    .order("version", { ascending: false });

  if (questionSetError) throw new Error("DISCOVERY_RETAKE_UNAVAILABLE");

  const questionSet = questionSets?.find((candidate) =>
    candidate.intended_age_bands.includes(profile.age_band),
  );
  if (!questionSet) throw new Error("DISCOVERY_RETAKE_UNAVAILABLE");

  const { data: questions, error: questionError } = await service
    .from("discovery_questions")
    .select(
      "stable_key,section_key,display_order,eligible_age_bands,is_active",
    )
    .eq("question_set_id", questionSet.id)
    .eq("is_active", true)
    .order("display_order");

  if (questionError) throw new Error("DISCOVERY_RETAKE_UNAVAILABLE");

  const firstQuestion = questions?.find((question) =>
    question.eligible_age_bands.includes(profile.age_band),
  );
  if (!firstQuestion) throw new Error("DISCOVERY_RETAKE_UNAVAILABLE");

  const { data: session, error: sessionError } = await service
    .from("discovery_sessions")
    .insert({
      user_id: userId,
      question_set_id: questionSet.id,
      question_set_version: questionSet.version,
      current_section_key: firstQuestion.section_key,
      current_question_key: firstQuestion.stable_key,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    const { data: racedSession } = await service
      .from("discovery_sessions")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["in_progress", "review"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (racedSession) {
      return { status: "resumed", sessionId: racedSession.id };
    }
    throw new Error("DISCOVERY_RETAKE_UNAVAILABLE");
  }

  const { error: auditError } = await service
    .from("discovery_audit_events")
    .insert({
      user_id: userId,
      session_id: session.id,
      operation: "discovery_started",
      metadata: {
        retake: true,
        previous_session_id: completedSession.id,
        question_set_version: questionSet.version,
      },
    });

  if (auditError) {
    logger.warn("discovery_retake_audit_failed", {
      userId,
      sessionId: session.id,
    });
  }

  return { status: "started", sessionId: session.id };
}
