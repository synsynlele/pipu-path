import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import type {
  DiscoveryAnswer,
  DiscoveryQuestion,
  Stage4DiscoveryHandoff,
} from "../domain/discovery";

function parseOptions(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

export async function getDiscoveryState() {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createServerSupabaseClient();
  const { data: session } = await client
    .from("discovery_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session)
    return {
      session: null,
      questionSet: null,
      questions: [] as DiscoveryQuestion[],
      answers: [] as DiscoveryAnswer[],
    };

  const [
    { data: questionSet },
    { data: questionRows },
    { data: responseRows },
  ] = await Promise.all([
    client
      .from("discovery_question_sets")
      .select("stable_key, version, title, description")
      .eq("id", session.question_set_id)
      .single(),
    client
      .from("discovery_questions")
      .select("*")
      .eq("question_set_id", session.question_set_id)
      .order("display_order"),
    client.from("discovery_responses").select("*").eq("session_id", session.id),
  ]);

  const questions: DiscoveryQuestion[] = (questionRows ?? []).map((row) => ({
    id: row.id,
    stableKey: row.stable_key,
    sectionKey: row.section_key,
    sectionTitle: row.section_title,
    prompt: row.prompt,
    supportingText: row.supporting_text,
    responseType: row.response_type,
    required: row.is_required,
    displayOrder: row.display_order,
    maxTextLength: row.max_text_length,
    minSelections: row.min_selections,
    maxSelections: row.max_selections,
    minScale: row.min_scale,
    maxScale: row.max_scale,
    options: parseOptions(row.option_definitions),
    sensitivity: row.sensitivity,
  }));
  const answers: DiscoveryAnswer[] = (responseRows ?? []).map((row) => ({
    id: row.id,
    questionId: row.question_id,
    questionKey: row.question_key,
    text: row.text_response,
    selectedOptions: row.selected_options,
    numeric: row.numeric_response,
    skipped: row.skipped,
    sensitivity: row.sensitivity,
  }));

  return { session, questionSet, questions, answers };
}

export async function requireActiveDiscovery() {
  const state = await getDiscoveryState();
  if (!state.session) redirect("/onboarding/discovery");
  if (state.session.status === "completed")
    redirect("/onboarding/discovery/complete");
  return { ...state, session: state.session };
}

export async function getStage4DiscoveryHandoff(): Promise<Stage4DiscoveryHandoff | null> {
  const state = await getDiscoveryState();
  if (
    !state.session ||
    state.session.status !== "completed" ||
    !state.session.completed_at ||
    !state.questionSet
  )
    return null;
  const questions = new Map(
    state.questions.map((question) => [question.id, question]),
  );
  return {
    sessionId: state.session.id,
    questionSet: {
      stableKey: state.questionSet.stable_key,
      version: state.questionSet.version,
    },
    completedAt: state.session.completed_at,
    processingStatus: "ready_for_stage_4",
    responses: state.answers.map((answer) => {
      const question = questions.get(answer.questionId);
      const value =
        answer.text ?? answer.selectedOptions ?? answer.numeric ?? null;
      return {
        sourceId: answer.id,
        category: question?.sectionKey ?? "unknown",
        questionKey: answer.questionKey,
        responseType: question?.responseType ?? "reflection",
        value,
        skipped: answer.skipped,
        sensitivity: answer.sensitivity,
      };
    }),
  };
}
