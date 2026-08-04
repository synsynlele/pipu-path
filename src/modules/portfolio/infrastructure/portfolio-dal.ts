import "server-only";

import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import type {
  BuilderProjectMilestoneRow,
  BuilderProjectRow,
} from "@/modules/project/infrastructure/project-dal";
import type { ProjectPortfolioStatus } from "../domain/portfolio-contract";
import { isAdultPortfolioAge } from "../domain/portfolio-contract";
import {
  createPortfolioServerClient,
  createPublicPortfolioClient,
} from "./portfolio-client";

export type ProjectPortfolioRow = {
  id: string;
  user_id: string;
  project_id: string;
  slug: string;
  builder_name: string;
  public_title: string;
  public_summary: string;
  public_problem: string;
  public_audience: string;
  public_outcome: string;
  impact_signal: string;
  milestone_summaries: string[];
  proof_link: string | null;
  status: ProjectPortfolioStatus;
  consent_version: string | null;
  consent_confirmed_at: string | null;
  published_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicProjectPortfolio = Pick<
  ProjectPortfolioRow,
  | "slug"
  | "builder_name"
  | "public_title"
  | "public_summary"
  | "public_problem"
  | "public_audience"
  | "public_outcome"
  | "impact_signal"
  | "milestone_summaries"
  | "proof_link"
  | "published_at"
>;

export async function getPortfolioStudioState() {
  const { user, profile } = await requireAuthenticatedIdentity();
  const client = await createPortfolioServerClient();
  const [{ data: projectRows }, { data: portfolioRows }] = await Promise.all([
    client
      .from("builder_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
    client
      .from("builder_project_portfolios")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const projects = (projectRows ?? []) as BuilderProjectRow[];
  const portfolios = (portfolioRows ?? []) as ProjectPortfolioRow[];
  const byProject = new Map(
    portfolios.map((portfolio) => [portfolio.project_id, portfolio]),
  );

  return {
    profile,
    adultEligible:
      isAdultPortfolioAge(profile.age_band) &&
      !profile.safeguarding_review_required,
    projects: projects.map((project) => ({
      project,
      portfolio: byProject.get(project.id) ?? null,
    })),
    published:
      portfolios.find((portfolio) => portfolio.status === "published") ?? null,
  };
}

export async function getPortfolioProjectState(projectId: string) {
  const { user, profile } = await requireAuthenticatedIdentity();
  const client = await createPortfolioServerClient();
  const [{ data: project }, { data: milestones }, { data: portfolio }] =
    await Promise.all([
      client
        .from("builder_projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .maybeSingle(),
      client
        .from("builder_project_milestones")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("sequence_order"),
      client
        .from("builder_project_portfolios")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (!project) return null;
  const projectMilestones = (milestones ?? []) as BuilderProjectMilestoneRow[];
  if (
    projectMilestones.length !== 3 ||
    projectMilestones.some((milestone) => milestone.status !== "completed")
  ) {
    return null;
  }

  return {
    profile,
    adultEligible:
      isAdultPortfolioAge(profile.age_band) &&
      !profile.safeguarding_review_required,
    project: project as BuilderProjectRow,
    milestones: projectMilestones,
    portfolio: (portfolio as ProjectPortfolioRow | null) ?? null,
  };
}

export async function getPublicPortfolioBySlug(slug: string) {
  const client = createPublicPortfolioClient();
  const { data, error } = await client.rpc("get_stage9_public_portfolio", {
    slug_input: slug,
  });
  if (error || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as PublicProjectPortfolio;
}
