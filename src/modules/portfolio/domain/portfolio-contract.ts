import { z } from "zod";

const publicText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} needs a little more public-safe detail.`)
    .max(maximum, `${label} is too long.`);

export const portfolioDraftInputSchema = z.object({
  projectId: z.uuid(),
  builderName: publicText("Public Builder name", 2, 80),
  publicTitle: publicText("Public Project title", 3, 100),
  publicSummary: publicText("Public summary", 40, 1000),
  publicProblem: publicText("Public problem", 20, 800),
  publicAudience: publicText("Public audience", 10, 400),
  publicOutcome: publicText("Public outcome", 20, 800),
  impactSignal: publicText("Impact signal", 10, 500),
  milestoneSummaries: z
    .array(publicText("Milestone summary", 10, 500))
    .length(
      3,
      "A public Project proof needs exactly three milestone summaries.",
    ),
  proofLink: z
    .string()
    .trim()
    .max(500, "The public proof link is too long.")
    .refine(
      (value) => value.length === 0 || /^https:\/\//i.test(value),
      "Use a complete secure https link.",
    ),
});

export const portfolioPublishInputSchema = z.object({
  portfolioId: z.uuid(),
  projectId: z.uuid(),
  consentConfirmed: z.literal(true, {
    error: "Confirm that every public field is safe and truthful.",
  }),
  consentVersion: z.literal("project-portfolio-v1"),
});

export const portfolioWithdrawInputSchema = z.object({
  portfolioId: z.uuid(),
  projectId: z.uuid(),
});

export type PortfolioDraftInput = z.infer<typeof portfolioDraftInputSchema>;
export type ProjectPortfolioStatus = "draft" | "published" | "withdrawn";

export type PortfolioErrorCode =
  | "PORTFOLIO_ACCESS_DENIED"
  | "PORTFOLIO_ADULT_REQUIRED"
  | "PORTFOLIO_COMPLETED_PROJECT_REQUIRED"
  | "PORTFOLIO_INPUT_INVALID"
  | "PORTFOLIO_MILESTONES_INVALID"
  | "PORTFOLIO_PROOF_LINK_INVALID"
  | "PORTFOLIO_WITHDRAW_REQUIRED"
  | "PORTFOLIO_CONSENT_REQUIRED"
  | "PORTFOLIO_NOT_PUBLISHABLE"
  | "PORTFOLIO_ALREADY_PUBLISHED"
  | "PORTFOLIO_NOT_PUBLISHED";

export function portfolioStatusLabel(status: ProjectPortfolioStatus) {
  return {
    draft: "Draft",
    published: "Published",
    withdrawn: "Withdrawn",
  }[status];
}

export function isAdultPortfolioAge(ageBand: string | null | undefined) {
  return ageBand === "18_24" || ageBand === "25_plus";
}
