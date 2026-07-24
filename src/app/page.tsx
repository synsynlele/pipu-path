import { PublicShell } from "@/components/shells/public-shell";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

const operatingLoop = [
  "Discover",
  "Develop",
  "Build",
  "Collaborate",
  "Deploy",
  "Create impact",
] as const;

export default function HomePage() {
  return (
    <PublicShell>
      <main id="main-content">
        <section className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl content-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12">
          <div>
            <p className="text-gold mb-5 font-mono text-xs tracking-[0.22em] uppercase">
              Human potential, made useful
            </p>
            <h1 className="max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.055em] text-balance sm:text-7xl lg:text-8xl">
              Build what you can{" "}
              <span className="text-gold-light">become.</span>
            </h1>
            <p className="text-muted mt-7 max-w-2xl text-lg leading-8 sm:text-xl">
              PipuPath is being built as one connected system for discovering
              potential, developing capability, producing evidence, and turning
              growth into credible contribution.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/app">View the foundation</ButtonLink>
              <ButtonLink href="#system" variant="secondary">
                See the operating loop
              </ButtonLink>
            </div>
          </div>

          <Surface className="relative overflow-hidden p-6 sm:p-8">
            <div
              className="via-gold absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
              aria-hidden="true"
            />
            <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
              Foundation status
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Stage 0–1 engineering foundation
            </h2>
            <p className="text-muted mt-3 leading-7">
              Architecture, application shells, design language, environment
              validation, structured logging, tests, and CI are established.
              Product accounts and developmental data begin in Stage 2.
            </p>
            <div className="border-border text-muted mt-7 border-t pt-5 text-sm">
              No simulated profiles, journeys, progress, or AI results.
            </div>
          </Surface>
        </section>

        <section
          id="system"
          aria-labelledby="system-title"
          className="border-border bg-panel/60 border-y"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
            <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
              One compounding loop
            </p>
            <h2
              id="system-title"
              className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl"
            >
              Development inside the platform must become useful outside it.
            </h2>
            <ol className="border-border bg-border mt-10 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3">
              {operatingLoop.map((step, index) => (
                <li key={step} className="bg-panel p-6">
                  <span className="text-gold font-mono text-xs">
                    0{index + 1}
                  </span>
                  <p className="mt-7 text-xl font-medium">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
