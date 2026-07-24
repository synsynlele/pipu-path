import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

export default function FoundationPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Honest system state
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        The foundation is ready. Product identity is not yet implemented.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        Stage 2 will create the first complete vertical slice: secure account
        creation, session protection, a persistent user record, and the
        consent-aware onboarding checkpoint.
      </p>
      <Surface className="mt-10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">
          Why this page is intentionally empty
        </h2>
        <p className="text-muted mt-3 max-w-2xl leading-7">
          Showing invented journeys, scores, builders, projects, or progress
          would violate PipuPath’s truthful-state rule. This shell proves the
          application structure without pretending that product capabilities
          exist.
        </p>
      </Surface>
      <ButtonLink href="/" variant="secondary" className="mt-8">
        Return to the public foundation
      </ButtonLink>
    </main>
  );
}
