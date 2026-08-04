import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { portfolioStatusLabel } from "@/modules/portfolio/domain/portfolio-contract";
import { getPortfolioStudioState } from "@/modules/portfolio/infrastructure/portfolio-dal";

export const metadata: Metadata = {
  title: "Project Portfolio",
  robots: { index: false, follow: false },
};

export default async function PortfolioPage() {
  const state = await getPortfolioStudioState();

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <section className="border-gold/20 bg-panel relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            Selective Project Portfolio
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Present proof without surrendering privacy.
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
            Choose one completed Project, rewrite only what is safe to share,
            preview the exact public page and withdraw access whenever you need
            to.
          </p>
        </div>
      </section>

      {!state.adultEligible ? (
        <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Safeguarding boundary
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Public Project proof is adult-only in this MVP.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            Every private Mission, Journey, Quest and Project remains available.
            Publishing for younger Builders requires a dedicated
            guardian-consent and safeguarding workflow, so PipuPath will not
            reduce that decision to a checkbox.
          </p>
          <ButtonLink href="/projects" className="mt-6">
            Continue Private Projects
          </ButtonLink>
        </Surface>
      ) : state.projects.length === 0 ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Completed Project required
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Finish a Project before preparing public proof.
          </h2>
          <p className="text-muted mt-4 max-w-2xl leading-7">
            A portfolio page grows from verified execution, not from an idea or
            an unfinished plan.
          </p>
          <ButtonLink href="/projects" className="mt-6">
            Open Builder Projects
          </ButtonLink>
        </Surface>
      ) : (
        <>
          {state.published ? (
            <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-3xl">
                  <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                    Current public proof
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    {state.published.public_title}
                  </h2>
                  <p className="text-muted mt-3 leading-7">
                    Only the selected portfolio fields are public. Your raw
                    evidence, reflections and private updates remain protected.
                  </p>
                </div>
                <span className="border-gold/30 bg-background rounded-full border px-3 py-1.5 text-xs font-semibold">
                  Published
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={`/proof/${state.published.slug}`}>
                  View Public Proof
                </ButtonLink>
                <ButtonLink
                  href={`/portfolio/${state.published.project_id}`}
                  variant="secondary"
                >
                  Manage Publication
                </ButtonLink>
              </div>
            </Surface>
          ) : null}

          <section className="mt-10">
            <div className="max-w-2xl">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Completed Project proof
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Choose what deserves a public presentation.
              </h2>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {state.projects.map(({ project, portfolio }) => (
                <Surface key={project.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                        Completed Builder Project
                      </p>
                      <h3 className="mt-3 text-xl font-semibold">
                        {project.title}
                      </h3>
                    </div>
                    <span className="border-border rounded-full border px-2.5 py-1 text-xs">
                      {portfolio
                        ? portfolioStatusLabel(portfolio.status)
                        : "Not prepared"}
                    </span>
                  </div>
                  <p className="text-muted mt-3 line-clamp-4 text-sm leading-6">
                    {project.desired_outcome}
                  </p>
                  <ButtonLink
                    href={`/portfolio/${project.id}`}
                    variant={
                      portfolio?.status === "published"
                        ? "secondary"
                        : "primary"
                    }
                    className="mt-5"
                  >
                    {portfolio?.status === "published"
                      ? "Manage Public Proof"
                      : portfolio
                        ? "Continue Portfolio Studio"
                        : "Prepare Public Proof"}
                  </ButtonLink>
                </Surface>
              ))}
            </div>
          </section>
        </>
      )}

      <Surface className="mt-10 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Stage 9 promise
        </p>
        <div className="mt-5 grid gap-4 text-sm leading-6 sm:grid-cols-3">
          <p>
            <strong className="block">Private by default</strong>
            <span className="text-muted mt-1 block">
              Nothing from a Project becomes public automatically.
            </span>
          </p>
          <p>
            <strong className="block">Preview before publish</strong>
            <span className="text-muted mt-1 block">
              You see the exact public-safe page before consent.
            </span>
          </p>
          <p>
            <strong className="block">Reversible access</strong>
            <span className="text-muted mt-1 block">
              Withdrawal removes the page without deleting private history.
            </span>
          </p>
        </div>
      </Surface>
    </main>
  );
}
