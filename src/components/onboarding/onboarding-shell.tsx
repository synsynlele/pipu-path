import { BrandMark } from "@/components/brand/brand-mark";

const steps = [
  { number: 1, label: "Identity" },
  { number: 2, label: "Discover" },
  { number: 3, label: "Direction" },
] as const;

export function OnboardingShell({
  activeStep,
  title,
  description,
  children,
}: {
  activeStep: 1 | 2 | 3;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <BrandMark />
          <span className="border-border bg-panel text-muted rounded-full border px-3 py-1.5 text-xs font-semibold">
            Private setup
          </span>
        </header>

        <nav aria-label="Onboarding progress" className="mt-8 sm:mt-10">
          <ol className="grid grid-cols-3 gap-2">
            {steps.map((step) => {
              const completed = step.number < activeStep;
              const current = step.number === activeStep;

              return (
                <li key={step.number}>
                  <div
                    className={`h-1.5 rounded-full ${completed || current ? "bg-primary" : "bg-border"}`}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`grid size-6 place-items-center rounded-full text-[0.68rem] font-bold ${completed ? "bg-success/15 text-success" : current ? "bg-primary-soft text-primary-light" : "bg-panel-raised text-muted"}`}
                    >
                      {completed ? "✓" : step.number}
                    </span>
                    <span
                      className={`text-xs font-semibold ${current ? "text-navy" : "text-muted"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="mt-8 sm:mt-10">
          <p className="text-primary-light text-xs font-semibold tracking-[0.14em] uppercase">
            Step {activeStep} of 3
          </p>
          <h1 className="text-navy mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6 sm:text-base">
            {description}
          </p>
        </section>

        <div className="mt-6 sm:mt-8">{children}</div>

        <p className="text-muted mx-auto mt-6 max-w-2xl text-center text-xs leading-5">
          PipuPath uses your answers to guide your development. Your private
          developmental data is not made public by default.
        </p>
      </div>
    </main>
  );
}
