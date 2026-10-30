import Link from "next/link";

const steps = [
  { number: 1, label: "Your account" },
  { number: 2, label: "Starting point" },
  { number: 3, label: "Your direction" },
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
          --color-primary-100: #eff6ff;
          --color-primary-500: #1d4ed8;
          --color-primary-700: #1d4ed8;
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
          background-color: #eff6ff;
        }

        .pp-onboarding-light .text-navy,
        .pp-onboarding-light .text-foreground {
          color: #202344;
        }

        .pp-onboarding-light .text-muted {
          color: #747b90;
        }

        .pp-onboarding-light .text-primary-light {
          color: #1d4ed8;
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
          border-color: #1d4ed8;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
        }

        .pp-onboarding-light .pp-button-primary:hover {
          border-color: #2563eb;
          background: #2563eb;
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
        }

        .pp-onboarding-light .pp-button-secondary {
          border-color: #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          -webkit-text-fill-color: #1d4ed8;
          box-shadow: none;
        }

        .pp-onboarding-light .pp-button-secondary:hover {
          border-color: #93c5fd;
          background: #dbeafe;
          color: #1e40af;
          -webkit-text-fill-color: #1e40af;
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

        .pp-onboarding-light li,
        .pp-onboarding-light fieldset,
        .pp-onboarding-light form,
        .pp-onboarding-light label {
          min-width: 0;
        }

        .pp-onboarding-light button,
        .pp-onboarding-light .pp-button-primary,
        .pp-onboarding-light .pp-button-secondary {
          max-width: 100%;
          text-align: center;
        }
      `}</style>

      <header className="border-b border-[#dbe7f5] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <Link href="/" className="text-xl font-extrabold text-[#163b72]">
            PipuPath
          </Link>
          <Link
            href="/build/play"
            className="min-h-11 py-3 text-sm font-semibold text-[#1d4ed8]"
          >
            Back to play
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-xl px-4 py-6 pb-12 sm:px-6">
        <nav aria-label="Setup sections" className="mb-6">
          <ol className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
            {steps.map((step) => (
              <li
                key={step.number}
                aria-current={step.number === activeStep ? "step" : undefined}
                className={
                  step.number === activeStep
                    ? "text-[#1d4ed8]"
                    : "text-[#64748b]"
                }
              >
                {step.number}. {step.label}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#163b72]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#52647c]">{description}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-xs leading-5 text-[#52647c]">
          Your answers and evidence stay private unless you choose to share
          them.
        </p>
      </div>
    </main>
  );
}
