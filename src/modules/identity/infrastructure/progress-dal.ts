import "server-only";

import { redirect } from "next/navigation";
import { createLogger } from "@/lib/observability/logger";
import {
  progressDestination,
  type AuthenticatedProgressSnapshot,
  type PortfolioProgressStatus,
} from "../domain/progress";
import { createProgressServerClient } from "./progress-client";

const logger = createLogger();

type MissionSummary = {
  id: string;
  title: string;
  mission_statement: string;
  status: AuthenticatedProgressSnapshot["missionStatus"];
};

type JourneySummary = {
  id: string;
  title: string;
  status: AuthenticatedProgressSnapshot["journeyStatus"];
};

type MilestoneSummary = {
  id: string;
  title: string;
  status: "locked" | "available" | "active" | "completed";
  sequence_order: number;
};

type QuestSummary = {
  id: string;
  title: string;
  status:
    "locked" | "available" | "active" | "evidence_submitted" | "completed";
};

type ProjectSummary = {
  id: string;
  title: string;
  journey_id: string;
  status: "active" | "completed" | "archived";
};

type PortfolioSummary = {
  project_id: string;
  public_title: string;
  slug: string;
  status: PortfolioProgressStatus;
  updated_at: string;
};

export type AuthenticatedHomeState = {
  userId: string;
  preferredName: string;
  snapshot: AuthenticatedProgressSnapshot;
  destination: ReturnType<typeof progressDestination>;
  mission: MissionSummary | null;
  journey: JourneySummary | null;
  milestone: MilestoneSummary | null;
  quest: QuestSummary | null;
  project: ProjectSummary | null;
  projectProgress: { completed: number; total: number } | null;
  portfolio: PortfolioSummary | null;
  totalXp: number;
  recentAchievement: string | null;
};

function emptySnapshot(authenticated = false): AuthenticatedProgressSnapshot {
  return {
    authenticated,
    identityComplete: false,
    discoveryStatus: null,
    hasHumanPotentialProfile: false,
    missionStatus: null,
    journeyStatus: null,
    activeProjectId: null,
    completedProjectId: null,
    portfolioStatus: null,
  };
}

export async function getAuthenticatedHomeState(
  clientInput?: Awaited<ReturnType<typeof createProgressServerClient>>,
): Promise<AuthenticatedHomeState | null> {
  const client = clientInput ?? (await createProgressServerClient());
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) return null;

  const [{ data: profile }, { data: checkpoint }] = await Promise.all([
    client
      .from("profiles")
      .select("preferred_name,display_name")
      .eq("id", user.id)
      .maybeSingle(),
    client
      .from("onboarding_checkpoints")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const identityComplete = Boolean(
    profile && checkpoint?.status === "completed",
  );
  const baseSnapshot = {
    ...emptySnapshot(true),
    identityComplete,
  } satisfies AuthenticatedProgressSnapshot;

  if (!identityComplete) {
    return {
      userId: user.id,
      preferredName:
        profile?.preferred_name ?? profile?.display_name ?? "Builder",
      snapshot: baseSnapshot,
      destination: progressDestination(baseSnapshot),
      mission: null,
      journey: null,
      milestone: null,
      quest: null,
      project: null,
      projectProgress: null,
      portfolio: null,
      totalXp: 0,
      recentAchievement: null,
    };
  }

  const [
    { data: discovery },
    { data: potentialProfile },
    { data: mission },
    { data: journey },
    { data: activeProject },
    { data: portfolio },
    { data: xpRows },
    { data: completedQuest },
  ] = await Promise.all([
    client
      .from("discovery_sessions")
      .select("status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("human_potential_profile_versions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("user_missions")
      .select("id,title,mission_statement,status")
      .eq("user_id", user.id)
      .in("status", ["draft", "active", "paused", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("user_journeys")
      .select("id,title,status")
      .eq("user_id", user.id)
      .in("status", ["draft", "active", "paused", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("builder_projects")
      .select("id,title,journey_id,status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("builder_project_portfolios")
      .select("project_id,public_title,slug,status,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("builder_xp_transactions")
      .select("amount")
      .eq("user_id", user.id),
    client
      .from("user_quests")
      .select("title,completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let completedProject: ProjectSummary | null = null;
  if (journey?.id && journey.status === "completed") {
    const { data: completedProjectRow } = await client
      .from("builder_projects")
      .select("id,title,journey_id,status")
      .eq("user_id", user.id)
      .eq("journey_id", journey.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    completedProject =
      (completedProjectRow as ProjectSummary | null) ?? null;
  }

  const snapshot: AuthenticatedProgressSnapshot = {
    authenticated: true,
    identityComplete: true,
    discoveryStatus: discovery?.status ?? null,
    hasHumanPotentialProfile: Boolean(potentialProfile),
    missionStatus: mission?.status ?? null,
    journeyStatus: journey?.status ?? null,
    activeProjectId: activeProject?.id ?? null,
    completedProjectId: completedProject?.id ?? null,
    portfolioStatus: (portfolio?.status as PortfolioProgressStatus) ?? null,
  };

  let milestone: MilestoneSummary | null = null;
  let quest: QuestSummary | null = null;
  if (journey?.id && journey.status === "active") {
    const { data: milestoneRow } = await client
      .from("journey_milestones")
      .select("id,title,status,sequence_order")
      .eq("journey_id", journey.id)
      .neq("status", "completed")
      .order("sequence_order")
      .limit(1)
      .maybeSingle();
    milestone = (milestoneRow as MilestoneSummary | null) ?? null;

    if (milestone?.id) {
      const { data: questRows } = await client
        .from("user_quests")
        .select("id,title,status,sequence_order")
        .eq("user_id", user.id)
        .eq("milestone_id", milestone.id)
        .order("sequence_order");
      const rows = (questRows ?? []) as Array<
        QuestSummary & { sequence_order: number }
      >;
      quest =
        rows.find((item) =>
          ["active", "evidence_submitted", "available"].includes(item.status),
        ) ?? null;
    }
  }

  const currentProject = (activeProject ??
    completedProject) as ProjectSummary | null;
  let projectProgress: { completed: number; total: number } | null = null;
  if (currentProject?.id) {
    const { data: projectMilestones } = await client
      .from("builder_project_milestones")
      .select("status")
      .eq("user_id", user.id)
      .eq("project_id", currentProject.id);
    const rows = projectMilestones ?? [];
    projectProgress = {
      completed: rows.filter((item) => item.status === "completed").length,
      total: rows.length,
    };
  }

  const totalXp = (xpRows ?? []).reduce(
    (total, transaction) => total + (transaction.amount ?? 0),
    0,
  );

  return {
    userId: user.id,
    preferredName:
      profile?.preferred_name ?? profile?.display_name ?? "Builder",
    snapshot,
    destination: progressDestination(snapshot),
    mission: (mission as MissionSummary | null) ?? null,
    journey: (journey as JourneySummary | null) ?? null,
    milestone,
    quest,
    project: currentProject,
    projectProgress,
    portfolio: (portfolio as PortfolioSummary | null) ?? null,
    totalXp,
    recentAchievement: completedProject?.title ?? completedQuest?.title ?? null,
  };
}

export async function requireAuthenticatedHomeState() {
  try {
    const state = await getAuthenticatedHomeState();
    if (!state) redirect("/login?next=/app");
    return state;
  } catch (error) {
    logger.error("authenticated_progress_load_failed", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    throw error;
  }
}

export async function resolveAuthenticatedDestination() {
  const state = await getAuthenticatedHomeState();
  return state?.destination.path ?? "/login";
}
