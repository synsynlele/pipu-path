import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { portfolioStatusLabel } from "@/modules/portfolio/domain/portfolio-contract";
import { getPortfolioProjectState } from "@/modules/portfolio/infrastructure/portfolio-dal";
import { PortfolioEditorForm } from "@/modules/portfolio/ui/portfolio-editor-form";
import { PortfolioWithdrawForm } from "@/modules/portfolio/ui/portfolio-withdraw-form";

export const metadata: Metadata = {
  title: "Portfolio Studio",
  robots: { index: false, follow: false },
};

export default async function PortfolioProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const state = await getPortfolioProjectState(projectId);
  if (!state) notFound();

  const { project, milestones, portfolio, profile, adultEligible } = state;
  const preferredName =
    profile.preferred_name ?? profile.display_name ?? "Builder";

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <ButtonLink href="/portfolio" variant="secondary">
        Back to Portfolio
      </ButtonLink>

      <section className="border-gold/20 bg-panel relative mt-6 overflow-hidden rounded-[2rem] border p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
              Private Portfolio Studio
            </p>
            <span className="border-gold/30 bg-gold/5 rounded-full border px-3 py-1.5 text-xs font-semibold">
              {portfolio
                ? portfolioStatusLabel(portfolio.status)
                : "Not prepared"}
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
            Build a public presentation from verified Project completion while
            keeping the original proof chain private.
          </p>
        </div>
      </section>

      {!adultEligible ? (
        <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Public publishing unavailable
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            This Project stays private under the Stage 9 safeguarding rule.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            PipuPath requires a future guardian-consent and safeguarding system
            before younger Builders can publish. Your completed Project and all
            private proof remain fully preserved.
          </p>
          <ButtonLink href={`/projects/${project.id}`} className="mt-6">
            Review Private Project
          </ButtonLink>
        </Surface>
      ) : portfolio?.status === "published" ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Surface className="border-gold/30 bg-gold/5 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Public now
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {portfolio.public_title}
            </h2>
            <p className="text-muted mt-4 leading-7">
              Editing is locked while the page is public. Withdraw it first to
              revise the public wording; your stable slug and private Project
              history will remain.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={`/proof/${portfolio.slug}`}>
                Open Public Proof
              </ButtonLink>
              <ButtonLink
                href={`/portfolio/${project.id}/preview`}
                variant="secondary"
              >
                Review Selected Fields
              </ButtonLink>
            </div>
          </Surface>
          <Surface className="p-6">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Publication control
            </p>
            <p className="text-muted mt-3 text-sm leading-6">
              Withdrawal immediately removes anonymous access. It does not
              delete this draft, slug or private Project.
            </p>
            <div className="mt-5">
              <PortfolioWithdrawForm
                portfolioId={portfolio.id}
                projectId={project.id}
              />
            </div>
          </Surface>
        </section>
      ) : (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <Surface className="p-6 sm:p-8">
            <PortfolioEditorForm
              project={project}
              milestones={milestones}
              portfolio={portfolio}
              defaultBuilderName={preferredName}
            />
          </Surface>
          <aside className="space-y-6">
            <Surface className="p-6">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Private source remains protected
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-muted">Original problem</dt>
                  <dd className="mt-1 leading-6">
                    {project.problem_statement}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Verified outcome</dt>
                  <dd className="mt-1 leading-6">{project.desired_outcome}</dd>
                </div>
                <div>
                  <dt className="text-muted">Completion signal</dt>
                  <dd className="mt-1 leading-6">{project.success_signal}</dd>
                </div>
              </dl>
            </Surface>
            {portfolio ? (
              <Surface className="p-6">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Stable proof address
                </p>
                <p className="text-muted mt-3 text-sm leading-6 break-all">
                  /proof/{portfolio.slug}
                </p>
                <ButtonLink
                  href={`/portfolio/${project.id}/preview`}
                  variant="secondary"
                  className="mt-5"
                >
                  Preview Existing Draft
                </ButtonLink>
              </Surface>
            ) : null}
          </aside>
        </section>
      )}
    </main>
  );
}
