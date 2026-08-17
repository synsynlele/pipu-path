import "server-only";

import { createHash } from "node:crypto";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { getCurrentEconomicPathwayState, getEconomicPathwayContext } from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { getLivingBuilderProfile } from "@/modules/living-builder-profile/infrastructure/living-profile-dal";
import {
  builderGuideContextSchema,
  builderGuideOutputSchema,
  type BuilderGuideContext,
  type BuilderGuideIntent,
  type BuilderGuideOutput,
} from "../domain/builder-guide-contract";

type QueryError = { message?: string } | null;
type QueryResult = { data: unknown; error: QueryError; count?: number | null };
type UntypedQuery = PromiseLike<QueryResult> & {
  select(columns?: string, options?: Record<string, unknown>): UntypedQuery;
  insert(values: Record<string, unknown> | Record<string, unknown>[]): UntypedQuery;
  upsert(
    values: Record<string, unknown> | Record<string, unknown>[],
    options?: Record<string, unknown>,
  ): UntypedQuery;
  eq(column: string, value: unknown): UntypedQuery;
  gte(column: string, value: unknown): UntypedQuery;
  order(column: string, options?: { ascending?: boolean }): UntypedQuery;
  limit(count: number): UntypedQuery;
  maybeSingle(): Promise<QueryResult>;
  single(): Promise<QueryResult>;
};
type BuilderGuideClient = { from(table: string): UntypedQuery };

function serviceClient() {
  return createServiceRoleSupabaseClient() as unknown as BuilderGuideClient;
}

export type BuilderGuideRun = {
  id: string;
  intent: BuilderGuideIntent;
  advice: BuilderGuideOutput;
  provider: "openai" | "evidence_fallback";
  model: string;
  createdAt: string;
  destinationHref: string;
  feedback: {
    verdict: "helpful" | "not_helpful";
    note: string | null;
    createdAt: string;
  } | null;
};

export function destinationHref(
  context: BuilderGuideContext,
  destination: BuilderGuideOutput["nextAction"]["destination"],
) {
  switch (destination) {
    case "current_quest":
      return context.current.quest ? `/quests/${context.current.quest.id}` : "/journey";
    case "current_project":
      return context.current.project
        ? `/projects/${context.current.project.id}`
        : "/build";
    case "journey":
      return "/journey";
    case "build":
      return "/build";
    case "connect":
      return "/connect";
    default:
      return "/profile";
  }
}

export async function getBuilderGuideContext(): Promise<BuilderGuideContext | null> {
  const [{ profile: identity }, baseline, livingProfile, home] = await Promise.all([
    requireAuthenticatedIdentity(),
    getEconomicPathwayContext(),
    getLivingBuilderProfile(),
    getAuthenticatedHomeState(),
  ]);
  if (!baseline || !livingProfile || !home) return null;

  const economicState = await getCurrentEconomicPathwayState(baseline.profileId);
  const selected = economicState?.selectedPath ?? null;
  const availableDestinations: BuilderGuideContext["availableDestinations"] = [
    "profile",
    "build",
  ];
  if (home.journey) availableDestinations.push("journey");
  if (home.quest) availableDestinations.push("current_quest");
  if (home.project) availableDestinations.push("current_project");
  if (!(identity.is_minor ?? false)) availableDestinations.push("connect");

  return builderGuideContextSchema.parse({
    preferredName: home.preferredName,
    ageBand: baseline.ageBand,
    isMinor: identity.is_minor ?? false,
    safeguardingReviewRequired:
      identity.safeguarding_review_required ?? false,
    baseline: {
      id: baseline.profileId,
      summary: baseline.summary,
    },
    livingProfile: {
      id: livingProfile.profile.id,
      version: livingProfile.profile.version,
      capabilities: livingProfile.capabilities.map((claim) => ({
        id: claim.id,
        label: claim.capabilityLabel,
        level: claim.level,
        evidenceCount: claim.evidenceCount,
        totalStrength: claim.totalStrength,
        feedbackType: claim.feedback?.feedbackType ?? null,
        evidence: claim.evidence.slice(0, 3).map((evidence) => ({
          sourceTitle: evidence.sourceTitle,
          summary: evidence.summary,
          href: evidence.href,
        })),
      })),
    },
    selectedPath:
      economicState && selected
        ? {
            recommendationId: economicState.id,
            key: selected.key,
            name: selected.pathName,
            whyItFits: selected.whyItFits,
            evidenceNeeded: selected.evidenceNeeded,
          }
        : null,
    current: {
      mission: home.mission
        ? { id: home.mission.id, title: home.mission.title, status: home.mission.status }
        : null,
      journey: home.journey
        ? { id: home.journey.id, title: home.journey.title, status: home.journey.status }
        : null,
      milestone: home.milestone
        ? {
            id: home.milestone.id,
            title: home.milestone.title,
            status: home.milestone.status,
          }
        : null,
      quest: home.quest
        ? { id: home.quest.id, title: home.quest.title, status: home.quest.status }
        : null,
      project: home.project
        ? {
            id: home.project.id,
            title: home.project.title,
            status: home.project.status,
            completedMilestones: home.projectProgress?.completed ?? 0,
            totalMilestones: home.projectProgress?.total ?? 0,
          }
        : null,
      nextStage: home.destination.stage,
    },
    availableDestinations,
  });
}

export function builderGuideContextFingerprint(context: BuilderGuideContext) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        baselineId: context.baseline.id,
        livingProfileId: context.livingProfile.id,
        livingProfileVersion: context.livingProfile.version,
        capabilityState: context.livingProfile.capabilities.map((claim) => [
          claim.id,
          claim.level,
          claim.evidenceCount,
          claim.totalStrength,
          claim.feedbackType,
        ]),
        selectedPath: context.selectedPath
          ? [context.selectedPath.recommendationId, context.selectedPath.key]
          : null,
        mission: context.current.mission
          ? [context.current.mission.id, context.current.mission.status]
          : null,
        journey: context.current.journey
          ? [context.current.journey.id, context.current.journey.status]
          : null,
        milestone: context.current.milestone
          ? [context.current.milestone.id, context.current.milestone.status]
          : null,
        quest: context.current.quest
          ? [context.current.quest.id, context.current.quest.status]
          : null,
        project: context.current.project
          ? [
              context.current.project.id,
              context.current.project.status,
              context.current.project.completedMilestones,
              context.current.project.totalMilestones,
            ]
          : null,
      }),
    )
    .digest("hex");
}

export async function findReusableBuilderGuideRun(input: {
  userId: string;
  intent: BuilderGuideIntent;
  fingerprint: string;
  since: string;
}) {
  const { data } = await serviceClient()
    .from("builder_guide_runs")
    .select("*")
    .eq("user_id", input.userId)
    .eq("intent", input.intent)
    .eq("context_fingerprint", input.fingerprint)
    .gte("created_at", input.since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return parseRun(data);
}

export async function countRecentBuilderGuideRuns(userId: string, since: string) {
  const { count, error } = await serviceClient()
    .from("builder_guide_runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if (error) throw new Error("GUIDE_RATE_LIMIT_CHECK_FAILED");
  return count ?? 0;
}

export async function saveBuilderGuideRun(input: {
  userId: string;
  intent: BuilderGuideIntent;
  context: BuilderGuideContext;
  fingerprint: string;
  provider: "openai" | "evidence_fallback";
  model: string;
  consentPolicyVersion: string;
  advice: BuilderGuideOutput;
}) {
  const { data, error } = await serviceClient()
    .from("builder_guide_runs")
    .insert({
      user_id: input.userId,
      intent: input.intent,
      schema_version: input.advice.schemaVersion,
      living_profile_version_id: input.context.livingProfile.id,
      human_potential_profile_id: input.context.baseline.id,
      economic_pathway_recommendation_id:
        input.context.selectedPath?.recommendationId ?? null,
      mission_id: input.context.current.mission?.id ?? null,
      journey_id: input.context.current.journey?.id ?? null,
      project_id: input.context.current.project?.id ?? null,
      context_fingerprint: input.fingerprint,
      provider: input.provider,
      model: input.model,
      prompt_version: "stage17.v1",
      consent_policy_version: input.consentPolicyVersion,
      advice: input.advice,
    })
    .select("*")
    .single();
  if (error) throw new Error("GUIDE_SAVE_FAILED");
  const parsed = parseRun(data);
  if (!parsed) throw new Error("GUIDE_SAVE_FAILED");
  return { ...parsed, destinationHref: destinationHref(input.context, parsed.advice.nextAction.destination) };
}

function parseRun(data: unknown): Omit<BuilderGuideRun, "destinationHref" | "feedback"> | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const advice = builderGuideOutputSchema.safeParse(row.advice);
  if (!advice.success) return null;
  const intent = advice.data.intent;
  const provider = row.provider === "openai" ? "openai" : "evidence_fallback";
  return {
    id: String(row.id),
    intent,
    advice: advice.data,
    provider,
    model: String(row.model ?? "unknown"),
    createdAt: String(row.created_at),
  };
}

export async function getBuilderGuideHistory(
  context: BuilderGuideContext,
  limit = 8,
): Promise<BuilderGuideRun[]> {
  const { user } = await requireAuthenticatedIdentity();
  const client = serviceClient();
  const [{ data: runRows }, { data: feedbackRows }] = await Promise.all([
    client
      .from("builder_guide_runs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 20)),
    client
      .from("builder_guide_feedback")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);
  const feedback = Array.isArray(feedbackRows) ? feedbackRows : [];
  return (Array.isArray(runRows) ? runRows : [])
    .map((row) => {
      const parsed = parseRun(row);
      if (!parsed) return null;
      const matching = feedback.find(
        (item) =>
          item &&
          typeof item === "object" &&
          String((item as Record<string, unknown>).run_id) === parsed.id,
      ) as Record<string, unknown> | undefined;
      return {
        ...parsed,
        destinationHref: destinationHref(context, parsed.advice.nextAction.destination),
        feedback: matching
          ? {
              verdict:
                matching.verdict === "helpful" ? "helpful" : "not_helpful",
              note:
                typeof matching.note === "string" && matching.note.trim()
                  ? matching.note
                  : null,
              createdAt: String(matching.created_at),
            }
          : null,
      } satisfies BuilderGuideRun;
    })
    .filter((row): row is BuilderGuideRun => row !== null);
}

export async function recordBuilderGuideFeedback(input: {
  userId: string;
  runId: string;
  verdict: "helpful" | "not_helpful";
  note: string;
}) {
  const client = serviceClient();
  const { data: run } = await client
    .from("builder_guide_runs")
    .select("id")
    .eq("id", input.runId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (!run) throw new Error("GUIDE_RUN_NOT_FOUND");

  const { error } = await client.from("builder_guide_feedback").upsert(
    {
      user_id: input.userId,
      run_id: input.runId,
      verdict: input.verdict,
      note: input.note.trim() || null,
    },
    { onConflict: "user_id,run_id" },
  );
  if (error) throw new Error("GUIDE_FEEDBACK_SAVE_FAILED");
}
