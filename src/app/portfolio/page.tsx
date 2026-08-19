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
      className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-12 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-20 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-12 -bottom-36 size-72 rounded-full bg-[#f3c86b]/12 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Portfolio · Builder Vault
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Your real builds live here. You decide what leaves the Vault.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            Completed Projects become evidence you can keep private, shape into
            a safe public presentation, or later carry through your Builder
            Passport.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-blue-50">
              {state.projects.length} completed{" "}
              {state.projects.length === 1 ? "build" : "builds"}
            </span>
            <span className="rounded-full border border-[#f3c86b]/25 bg-[#f3c86b]/8 px-3 py-1.5 font-semibold text-[#f3c86b]">
              {state.published
                ? "1 proof deployed"
                : "No public proof deployed"}
            </span>
          </div>
        </div>
      </section>

      <div className="border-gold/20 bg-gold/5 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 sm:px-5">
        <div>
          <p className="text-navy text-sm font-semibold">
            Vault rule: private by default
          </p>
          <p className="text-muted mt-0.5 text-xs">
            Raw Quest evidence, reflection and private Project updates never
            leave the Vault automatically.
          </p>
        </div>
        <ButtonLink href="/passport" variant="secondary" className="min-h-10">
          Builder Passport
        </ButtonLink>
      </div>

      {!state.adultEligible ? (
        <Surface className="border-gold/30 bg-gold/5 mt-6 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
            Public door locked by safeguarding
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
            Your Vault works. Public Project publishing stays closed for now.
          </h2>
          <p className="text-muted mt-3 max-w-3xl text-sm leading-6">
            Younger Builders keep every private Mission, Journey, Quest,
            capability and Project. Public Project proof needs a dedicated
            guardian-consent and safeguarding workflow; PipuPath will not reduce
            that protection to a checkbox.
          </p>
          <ButtonLink href="/projects" className="mt-5">
            Continue Major Builds →
          </ButtonLink>
        </Surface>
      ) : state.projects.length === 0 ? (
        <Surface className="mt-6 p-6 sm:p-8">
          <div className="mx-auto grid max-w-2xl place-items-center text-center">
            <span className="border-border bg-background text-muted grid size-16 place-items-center rounded-full border-2 text-xl">
              🔒
            </span>
            <p className="text-primary mt-4 text-xs font-semibold tracking-[0.14em] uppercase">
              Vault waiting for proof
            </p>
            <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
              Complete a Major Build to create your first Vault artifact.
            </h2>
            <p className="text-muted mt-3 text-sm leading-6">
              A Portfolio item grows from verified execution—not from an idea,
              bio or unfinished plan.
            </p>
            <ButtonLink href="/projects" className="mt-5">
              Open Major Builds →
            </ButtonLink>
          </div>
        </Surface>
      ) : (
        <>
          {state.published ? (
            <Surface className="border-success/25 bg-success/5 mt-6 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-3xl">
                  <p className="text-success text-xs font-semibold tracking-[0.15em] uppercase">
                    Proof deployed outside the Vault
                  </p>
                  <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {state.published.public_title}
                  </h2>
                  <p className="text-muted mt-3 text-sm leading-6">
                    Only the fields you deliberately selected are public. The
                    underlying Project evidence remains protected.
                  </p>
                </div>
                <span className="border-success/20 bg-success/10 text-success rounded-full border px-3 py-1.5 text-xs font-semibold">
                  Live
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href={`/proof/${state.published.slug}`}>
                  Open Deployed Proof →
                </ButtonLink>
                <ButtonLink
                  href={`/portfolio/${state.published.project_id}`}
                  variant="secondary"
                >
                  Manage Access
                </ButtonLink>
              </div>
            </Surface>
          ) : (
            <Surface className="border-primary/20 bg-primary-soft/25 mt-6 p-5 sm:p-7">
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Nothing has left the Vault
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                Your completed work is ready when you choose to present it.
              </h2>
              <p className="text-muted mt-3 max-w-3xl text-sm leading-6">
                Preparing a draft does not publish anything. You review the
                exact public-safe presentation before explicit consent.
              </p>
            </Surface>
          )}

          <section className="mt-8" aria-labelledby="vault-artifacts-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
                  Vault artifacts
                </p>
                <h2
                  id="vault-artifacts-heading"
                  className="text-navy mt-2 text-3xl font-semibold tracking-tight"
                >
                  Builds you can turn into selected proof
                </h2>
              </div>
              <span className="text-muted max-w-sm text-xs leading-5">
                A public presentation is a selected view of a private Build—not
                the raw Build itself.
              </span>
            </div>

            <div className="mt-5 flex [scrollbar-width:thin] gap-4 overflow-x-auto pb-3">
              {state.projects.map(({ project, portfolio }) => {
                const status = portfolio
                  ? portfolioStatusLabel(portfolio.status)
                  : "Vault only";
                const published = portfolio?.status === "published";
                return (
                  <Surface
                    key={project.id}
                    className={`w-[19rem] shrink-0 p-5 ${published ? "border-success/25" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`grid size-11 shrink-0 place-items-center rounded-2xl border text-sm ${published ? "border-success/25 bg-success/10 text-success" : "border-gold/25 bg-gold/8 text-gold"}`}
                        aria-hidden="true"
                      >
                        ▣
                      </span>
                      <span className="border-border text-muted rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold">
                        {status}
                      </span>
                    </div>
                    <p className="text-muted mt-4 text-[0.68rem] font-semibold tracking-wide uppercase">
                      Completed Major Build
                    </p>
                    <h3 className="text-navy mt-2 text-xl font-semibold">
                      {project.title}
                    </h3>
                    <p className="text-muted mt-2 line-clamp-3 text-sm leading-6">
                      {project.desired_outcome}
                    </p>
                    <ButtonLink
                      href={`/portfolio/${project.id}`}
                      variant={published ? "secondary" : "primary"}
                      className="mt-5"
                    >
                      {published
                        ? "Manage Deployed Proof"
                        : portfolio
                          ? "Review Vault Draft"
                          : "Prepare Selected Proof"}
                    </ButtonLink>
                  </Surface>
                );
              })}
            </div>
          </section>
        </>
      )}

      <details className="border-border bg-panel mt-7 rounded-2xl border p-5 sm:p-6">
        <summary className="text-navy cursor-pointer text-sm font-semibold">
          How the Builder Vault protects your work
        </summary>
        <div className="mt-4 grid gap-4 text-sm leading-6 sm:grid-cols-3">
          <p>
            <strong className="text-navy block">Private first</strong>
            <span className="text-muted mt-1 block">
              Nothing from a Project becomes public automatically.
            </span>
          </p>
          <p>
            <strong className="text-navy block">Preview exactly</strong>
            <span className="text-muted mt-1 block">
              You review the exact safe fields before publication consent.
            </span>
          </p>
          <p>
            <strong className="text-navy block">Pull it back</strong>
            <span className="text-muted mt-1 block">
              Withdrawal removes anonymous access without deleting private
              history.
            </span>
          </p>
        </div>
      </details>
    </main>
  );
}
