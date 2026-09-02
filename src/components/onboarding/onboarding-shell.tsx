import Link from "next/link";

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
  const progress = Math.round((activeStep / steps.length) * 100);

  return (
    <main
      id="main-content"
      className="pp-onboarding-light min-h-screen bg-[#f7f8fc] text-[#171a3f]"
      style={{ colorScheme: "light" }}
    >
      <style>{`
        .pp-onboarding-light {
          --foreground: #171a3f;
          --muted: #747b90;
          --border: #e3e5ef;
          --panel: #ffffff;
          --panel-raised: #fbfbfe;
          --soft-surface: #f3f4f8;
          --soft-blue-surface: #eef2fb;
          --color-primary-100: #eeeaff;
          --color-primary-500: #6547db;
          --color-primary-700: #5b3be0;
          --color-navy: #202344;
          --color-text: #171a3f;
          color: #171a3f;
          color-scheme: light;
        }

        .pp-onboarding-light .bg-white,
        .pp-onboarding-light .bg-panel {
          background-color: #ffffff;
        }

        .pp-onboarding-light .bg-panel-raised {
          background-color: #fbfbfe;
        }

        .pp-onboarding-light .bg-primary-soft {
          background-color: #eeeaff;
        }

        .pp-onboarding-light .text-navy,
        .pp-onboarding-light .text-foreground {
          color: #202344;
        }

        .pp-onboarding-light .text-muted {
          color: #747b90;
        }

        .pp-onboarding-light .text-primary-light {
          color: #6547db;
        }

        .pp-onboarding-light .border-border {
          border-color: #e3e5ef;
        }

        .pp-onboarding-light input,
        .pp-onboarding-light select,
        .pp-onboarding-light textarea {
          color: #202344;
          background-color: #ffffff;
        }

        .pp-onboarding-light input::placeholder,
        .pp-onboarding-light textarea::placeholder {
          color: #9ba2b7;
        }

        .pp-onboarding-light select option {
          color: #202344;
          background-color: #ffffff;
        }

        .pp-onboarding-light .pp-button-primary {
          border-color: #5b3be0;
          background: linear-gradient(135deg, #6d5df5 0%, #5436df 100%);
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
        }

        .pp-onboarding-light .pp-button-primary:hover {
          border-color: #6d5df5;
          background: #6d5df5;
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
        }

        .pp-onboarding-light .pp-button-secondary {
          border-color: #ddd8f7;
          background: #f3f0ff;
          color: #5136ca;
          -webkit-text-fill-color: #5136ca;
          box-shadow: none;
        }

        .pp-onboarding-light .pp-button-secondary:hover {
          border-color: #c8bef6;
          background: #ebe6ff;
          color: #4329b8;
          -webkit-text-fill-color: #4329b8;
        }

        .pp-onboarding-light legend,
        .pp-onboarding-light label,
        .pp-onboarding-light p,
        .pp-onboarding-light h1,
        .pp-onboarding-light h2,
        .pp-onboarding-light h3,
        .pp-onboarding-light button,
        .pp-onboarding-light a {
          overflow-wrap: anywhere;
        }

        .pp-onboarding-light button,
        .pp-onboarding-light .pp-button-primary,
        .pp-onboarding-light .pp-button-secondary {
          max-width: 100%;
          text-align: center;
        }
      `}</style>

      <header className="bg-gradient-to-br from-[#17164e] via-[#24205f] to-[#332071] px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-16 text-white sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold tracking-[-0.04em]">
            PipuPath
          </Link>
          <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-indigo-50">
            Private setup
          </span>
        </div>
      </header>

      <div className="mx-auto -mt-9 w-full max-w-2xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
        <section className="rounded-[2rem] border border-[#ececf4] bg-white p-5 shadow-[0_24px_60px_-38px_rgba(37,32,95,0.45)] sm:p-8">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="text-[#6547db]">Step {activeStep} of 3</span>
            <span className="text-[#8b91a5]">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ecebf3]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#25cdb8] via-[#6a6cf0] to-[#7e58ef] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <nav aria-label="Onboarding progress" className="mt-5">
            <ol className="grid grid-cols-3 gap-2">
              {steps.map((step) => {
                const completed = step.number < activeStep;
                const current = step.number === activeStep;
                return (
                  <li key={step.number} className="min-w-0 text-center">
                    <span
                      className={`mx-auto grid size-9 place-items-center rounded-full text-xs font-bold ${
                        completed
                          ? "bg-[#dff8f4] text-[#149986]"
                          : current
                            ? "bg-[#5b3be0] text-white shadow-[0_8px_20px_-10px_rgba(91,59,224,0.8)]"
                            : "bg-[#f0f1f6] text-[#9297a9]"
                      }`}
                    >
                      {completed ? "✓" : step.number}
                    </span>
                    <span
                      className={`mt-2 block truncate text-[0.68rem] font-semibold ${current ? "text-[#4931c4]" : "text-[#8b91a5]"}`}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>

          <section className="mt-7 text-center sm:mt-8">
            <p className="text-xs font-bold tracking-[0.13em] text-[#6547db] uppercase">
              One step at a time
            </p>
            <h1 className="mt-2 break-words text-3xl leading-tight font-bold tracking-[-0.04em] text-[#202344] sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-xl break-words text-sm leading-6 text-[#747b90] sm:text-base">
              {description}
            </p>
          </section>

          <div className="mt-6 min-w-0 sm:mt-8">{children}</div>
        </section>

        <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-5 text-[#858b9e]">
          Your answers guide your development. Private developmental data is not
          made public by default.
        </p>
      </div>
    </main>
  );
}
