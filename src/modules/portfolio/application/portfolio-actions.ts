"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  portfolioDraftInputSchema,
  portfolioPublishInputSchema,
  portfolioWithdrawInputSchema,
  type PortfolioErrorCode,
} from "../domain/portfolio-contract";
import { createPortfolioServerClient } from "../infrastructure/portfolio-client";

export type PortfolioFormState =
  { status: "idle" } | { status: "error"; message: string };

function portfolioErrorMessage(code: PortfolioErrorCode) {
  const messages: Record<PortfolioErrorCode, string> = {
    PORTFOLIO_ACCESS_DENIED: "Sign in again to manage this public proof.",
    PORTFOLIO_ADULT_REQUIRED:
      "Public Project proof is adult-only in this MVP. Private building remains available to every Builder.",
    PORTFOLIO_COMPLETED_PROJECT_REQUIRED:
      "Complete all three Project milestones before preparing public proof.",
    PORTFOLIO_INPUT_INVALID:
      "Review each public field and make it specific, truthful and safe to share.",
    PORTFOLIO_MILESTONES_INVALID:
      "Provide exactly three public-safe milestone summaries.",
    PORTFOLIO_PROOF_LINK_INVALID:
      "Use a complete secure https link or leave the proof link empty.",
    PORTFOLIO_WITHDRAW_REQUIRED:
      "Withdraw the current public proof before editing its public fields.",
    PORTFOLIO_CONSENT_REQUIRED:
      "Confirm that every field is truthful, public-safe and intentionally shared.",
    PORTFOLIO_NOT_PUBLISHABLE: "This public proof is not ready to publish.",
    PORTFOLIO_ALREADY_PUBLISHED:
      "Withdraw your current published Project before publishing another one.",
    PORTFOLIO_NOT_PUBLISHED: "This Project proof is not currently public.",
  };
  return messages[code];
}

function errorCode(error: unknown, fallback: PortfolioErrorCode) {
  const match = (error instanceof Error ? error.message : String(error)).match(
    /PORTFOLIO_[A-Z_]+/,
  )?.[0] as PortfolioErrorCode | undefined;
  return match ?? fallback;
}

export async function saveProjectPortfolioAction(
  _previous: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  void _previous;
  await requireAuthenticatedIdentity();

  const parsed = portfolioDraftInputSchema.safeParse({
    projectId: formData.get("projectId"),
    builderName: formData.get("builderName"),
    publicTitle: formData.get("publicTitle"),
    publicSummary: formData.get("publicSummary"),
    publicProblem: formData.get("publicProblem"),
    publicAudience: formData.get("publicAudience"),
    publicOutcome: formData.get("publicOutcome"),
    impactSignal: formData.get("impactSignal"),
    milestoneSummaries: [1, 2, 3].map((number) =>
      formData.get(`milestoneSummary${number}`),
    ),
    proofLink: formData.get("proofLink") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        portfolioErrorMessage("PORTFOLIO_INPUT_INVALID"),
    };
  }

  const client = await createPortfolioServerClient();
  const { data, error } = await client.rpc("save_stage9_project_portfolio", {
    project_id_input: parsed.data.projectId,
    builder_name_input: parsed.data.builderName,
    public_title_input: parsed.data.publicTitle,
    public_summary_input: parsed.data.publicSummary,
    public_problem_input: parsed.data.publicProblem,
    public_audience_input: parsed.data.publicAudience,
    public_outcome_input: parsed.data.publicOutcome,
    impact_signal_input: parsed.data.impactSignal,
    milestone_summaries_input: parsed.data.milestoneSummaries,
    proof_link_input: parsed.data.proofLink || undefined,
  });

  if (error || !data) {
    const code = errorCode(error, "PORTFOLIO_INPUT_INVALID");
    return { status: "error", message: portfolioErrorMessage(code) };
  }

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${parsed.data.projectId}`);
  redirect(`/portfolio/${parsed.data.projectId}/preview`);
}

export async function publishProjectPortfolioAction(
  _previous: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  void _previous;
  await requireAuthenticatedIdentity();

  const parsed = portfolioPublishInputSchema.safeParse({
    portfolioId: formData.get("portfolioId"),
    projectId: formData.get("projectId"),
    consentConfirmed: formData.get("consentConfirmed") === "on",
    consentVersion: formData.get("consentVersion"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        portfolioErrorMessage("PORTFOLIO_CONSENT_REQUIRED"),
    };
  }

  const client = await createPortfolioServerClient();
  const { data, error } = await client.rpc("publish_stage9_project_portfolio", {
    portfolio_id_input: parsed.data.portfolioId,
    consent_confirmed_input: true,
    consent_version_input: parsed.data.consentVersion,
  });

  if (error || !data) {
    const code = errorCode(error, "PORTFOLIO_NOT_PUBLISHABLE");
    return { status: "error", message: portfolioErrorMessage(code) };
  }

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${parsed.data.projectId}`);
  revalidatePath(`/portfolio/${parsed.data.projectId}/preview`);
  revalidatePath(`/proof/${data}`);
  redirect(`/proof/${data}`);
}

export async function withdrawProjectPortfolioAction(
  _previous: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  void _previous;
  await requireAuthenticatedIdentity();

  const parsed = portfolioWithdrawInputSchema.safeParse({
    portfolioId: formData.get("portfolioId"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: portfolioErrorMessage("PORTFOLIO_NOT_PUBLISHED"),
    };
  }

  const client = await createPortfolioServerClient();
  const { data: portfolio } = await client
    .from("builder_project_portfolios")
    .select("slug")
    .eq("id", parsed.data.portfolioId)
    .maybeSingle();
  const { data, error } = await client.rpc(
    "withdraw_stage9_project_portfolio",
    {
      portfolio_id_input: parsed.data.portfolioId,
    },
  );

  if (error || !data) {
    const code = errorCode(error, "PORTFOLIO_NOT_PUBLISHED");
    return { status: "error", message: portfolioErrorMessage(code) };
  }

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${parsed.data.projectId}`);
  if (portfolio?.slug) {
    revalidatePath(`/proof/${portfolio.slug}`);
  }
  redirect(`/portfolio/${parsed.data.projectId}`);
}
