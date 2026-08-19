import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getPortfolioProjectState } from "@/modules/portfolio/infrastructure/portfolio-dal";
import { PortfolioPublishForm } from "@/modules/portfolio/ui/portfolio-publish-form";
import { PublicProofView } from "@/modules/portfolio/ui/public-proof-view";

export const metadata: Metadata = {
  title: "Preview Public Project Proof",
  robots: { index: false, follow: false },
};

export default async function PortfolioPreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const state = await getPortfolioProjectState(projectId);
  if (!state) redirect("/portfolio");
  if (!state.portfolio) redirect(`/portfolio/${projectId}`);

  const { portfolio } = state;

  return (
    <div>
      <div className="border-border bg-background sticky top-0 z-10 border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div>
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Private preview
            </p>
            <p className="text-muted mt-1 text-sm">
              Anonymous users cannot see this draft.
            </p>
          </div>
          <ButtonLink href={`/portfolio/${projectId}`} variant="secondary">
            Edit Public Fields
          </ButtonLink>
        </div>
      </div>

      <PublicProofView
        preview
        proof={{
          slug: portfolio.slug,
          builder_name: portfolio.builder_name,
          public_title: portfolio.public_title,
          public_summary: portfolio.public_summary,
          public_problem: portfolio.public_problem,
          public_audience: portfolio.public_audience,
          public_outcome: portfolio.public_outcome,
          impact_signal: portfolio.impact_signal,
          milestone_summaries: portfolio.milestone_summaries,
          proof_link: portfolio.proof_link,
          published_at: portfolio.published_at,
        }}
      />

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <Surface className="border-gold/30 bg-gold/5 p-6 sm:p-8">
          {portfolio.status === "published" ? (
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Already published
                </p>
                <p className="text-muted mt-2 text-sm leading-6">
                  This is the exact public-safe presentation currently
                  available.
                </p>
              </div>
              <ButtonLink href={`/proof/${portfolio.slug}`}>
                Open Live Public Page
              </ButtonLink>
            </div>
          ) : (
            <>
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Final consent
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Publish only when this exact preview is safe.
              </h2>
              <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                After publishing, PipuPath returns you to Portfolio Studio first
                so you can confirm the status and deliberately open the public
                page. You will not be dropped into an unavailable route.
              </p>
              <PortfolioPublishForm
                portfolioId={portfolio.id}
                projectId={projectId}
              />
            </>
          )}
        </Surface>
      </section>
    </div>
  );
}
