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
          <span className="rounded-full border border-[#e3e6ee] bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
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
                    className={`h-1.5 rounded-full ${completed || current ? "bg-gradient-to-r from-[#5757e8] to-[#7278f2]" : "bg-[#e7e9ef]"}`}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`grid size-7 place-items-center rounded-full text-[0.68rem] font-bold ${completed ? "bg-[#eaf7f1] text-[#1f9d68]" : current ? "bg-[#eef0ff] text-[#5757e8]" : "bg-white text-slate-400"}`}
                    >
                      {completed ? "✓" : step.number}
                    </span>
                    <span
                      className={`text-xs font-semibold ${current ? "text-[#18233d]" : "text-slate-400"}`}
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
          <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
            Step {activeStep} of 3
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#18233d] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {description}
          </p>
        </section>

        <div className="mt-6 sm:mt-8">{children}</div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-slate-500">
          PipuPath uses your answers to guide your development. Your private
          developmental data is not made public by default.
        </p>
      </div>
    </main>
  );
}
