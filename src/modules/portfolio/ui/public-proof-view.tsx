import { BrandMark } from "@/components/brand/brand-mark";
import { Surface } from "@/components/ui/surface";
import type { PublicProjectPortfolio } from "../infrastructure/portfolio-dal";

export function PublicProofView({
  proof,
  preview = false,
}: {
  proof: PublicProjectPortfolio;
  preview?: boolean;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-border border-b bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <BrandMark />
          <span className="border-gold/30 bg-gold/8 text-gold rounded-full border px-3 py-1.5 text-xs font-semibold">
            {preview ? "Private Preview" : "Verified Project Proof"}
          </span>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
      >
        <section className="from-primary to-primary-light shadow-primary/15 relative overflow-hidden rounded-[2rem] bg-gradient-to-br px-6 py-10 text-white shadow-xl sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-20 h-72 w-72 rounded-full border border-white/15"
          />
          <div className="relative max-w-4xl">
            <p className="text-gold-light font-mono text-xs tracking-[0.2em] uppercase">
              Completed Builder Project
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
              {proof.public_title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50 sm:text-xl">
              {proof.public_summary}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/20 pt-5 text-sm">
              <span>
                Built by <strong>{proof.builder_name}</strong>
              </span>
              {proof.published_at ? (
                <span className="text-blue-100">
                  Published{" "}
                  {new Date(proof.published_at).toLocaleDateString("en", {
                    dateStyle: "medium",
                  })}
                </span>
              ) : (
                <span className="text-blue-100">Not published yet</span>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Surface className="p-6 sm:p-8">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Problem addressed
            </p>
            <p className="text-navy mt-4 text-lg leading-8">
              {proof.public_problem}
            </p>
          </Surface>
          <Surface className="p-6 sm:p-8">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              People served
            </p>
            <p className="text-navy mt-4 text-lg leading-8">
              {proof.public_audience}
            </p>
          </Surface>
          <Surface className="p-6 sm:p-8">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Useful outcome
            </p>
            <p className="text-navy mt-4 text-lg leading-8">
              {proof.public_outcome}
            </p>
          </Surface>
          <Surface className="border-gold/30 bg-gold/8 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Truthful impact signal
            </p>
            <p className="text-navy mt-4 text-lg leading-8">
              {proof.impact_signal}
            </p>
          </Surface>
        </section>

        <section className="mt-10">
          <div className="max-w-2xl">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Execution path
            </p>
            <h2 className="text-navy mt-3 text-3xl font-semibold tracking-tight">
              Three milestones from intention to evidence
            </h2>
          </div>
          <ol className="mt-6 grid gap-5 md:grid-cols-3">
            {proof.milestone_summaries.map((summary, index) => (
              <li key={`${index}-${summary}`}>
                <Surface className="h-full p-6">
                  <span className="bg-primary-soft text-primary grid size-10 place-items-center rounded-2xl font-mono text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-navy mt-5 leading-7">{summary}</p>
                </Surface>
              </li>
            ))}
          </ol>
        </section>

        {proof.proof_link ? (
          <Surface className="mt-8 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div>
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Builder-selected evidence
              </p>
              <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
                This external link was intentionally selected for public
                viewing.
              </p>
            </div>
            <a
              href={proof.proof_link}
              target="_blank"
              rel="noreferrer"
              className="bg-primary hover:bg-primary-light mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors sm:mt-0"
            >
              Open Public Evidence
            </a>
          </Surface>
        ) : null}

        <footer className="border-border text-muted mt-12 border-t pt-6 text-sm leading-6">
          PipuPath confirms that this Project moved through its private
          execution lifecycle. The Builder selected the public wording. Private
          Quest evidence, reflections, contact details and raw Project updates
          are not shown here.
        </footer>
      </main>
    </div>
  );
}
