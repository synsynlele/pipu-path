import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getBuilderLevelProgress } from "@/modules/identity/domain/builder-level";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const metadata: Metadata = {
  title: "Discover",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const discoveryStages = new Set([
  "identity",
  "discovery",
  "discovery-review",
  "potential-profile",
  "mission",
]);

export default async function DiscoverPage() {
  const state = await requireAuthenticatedHomeState();
  const level = getBuilderLevelProgress(state.totalXp);
  const discovering = discoveryStages.has(state.destination.stage);
  const primaryHref = discovering ? state.destination.path : "/profile";
  const primaryLabel = discovering
    ? state.destination.label
    : "Open your profile";

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
    >
      <header className="flex items-start justify-between gap-4 px-1">
        <div>
          <p className="text-sm font-medium text-slate-500">Discover</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-[#18233d] sm:text-3xl">
            Keep learning who you are by doing.
          </h1>
        </div>
        <span className="rounded-full border border-[#e4e6f0] bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
          {level.current} · {state.totalXp} XP
        </span>
      </header>

      <nav
        aria-label="Discovery lenses"
        className="pp-scrollbar-hidden -mx-4 mt-5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        <div className="flex w-max gap-3">
          <DiscoveryLens href="/profile" icon="◇" label="Strengths" />
          <DiscoveryLens href="/profile" icon="◎" label="Interests" />
          <DiscoveryLens href="/mission" icon="↗" label="Mission" />
          <DiscoveryLens href="/growth" icon="△" label="Growth" />
          <DiscoveryLens href="/guide" icon="✦" label="Guide" />
        </div>
      </nav>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Surface className="relative overflow-hidden p-5 sm:p-7">
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 size-52 rounded-full bg-[#eef0ff] blur-2xl"
          />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
                Your living insight
              </p>
              <span className="rounded-full bg-[#eef8f3] px-3 py-1 text-[0.66rem] font-semibold text-[#1f8d61]">
                Evidence-led
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#18233d] sm:text-3xl">
              {state.mission?.title ?? state.destination.label}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {state.mission?.mission_statement ??
                state.destination.description}
            </p>

            <div className="mt-5 rounded-[1.5rem] bg-[#f7f8fc] p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                What changes this picture?
              </p>
              <p className="mt-2 text-sm leading-6 font-semibold text-[#26324d]">
                What you attempt, prove, reflect on and build. PipuPath keeps
                updating the picture without reducing you to one AI label.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={primaryHref} className="rounded-full">
                {primaryLabel} →
              </ButtonLink>
              <ButtonLink
                href="/guide"
                variant="secondary"
                className="rounded-full"
              >
                Ask Pipu
              </ButtonLink>
            </div>
          </div>
        </Surface>

        <Surface className="p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#c59a36] uppercase">
            Your direction
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#18233d]">
            {state.journey?.title ?? "Your next path is still opening"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {state.journey
              ? "Your current Journey turns self-discovery into experiments, evidence and useful proof."
              : "Keep moving through Discovery. PipuPath reveals the next meaningful action when the evidence is ready."}
          </p>
          <ButtonLink
            href={state.journey ? "/journey" : primaryHref}
            variant="secondary"
            className="mt-5 rounded-full"
          >
            {state.journey ? "See Journey" : "Continue Discovery"}
          </ButtonLink>
        </Surface>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
              For you
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#18233d]">
              Small places to understand yourself better
            </h2>
          </div>
          <span className="hidden text-xs text-slate-400 sm:inline">
            Useful, bounded, no endless feed.
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DiscoveryCard
            href="/profile"
            title="Living Profile"
            detail="Evidence-backed capabilities and signals."
            icon="◉"
          />
          <DiscoveryCard
            href="/mission"
            title="Possible Paths"
            detail="Direction and the Mission you are testing."
            icon="↗"
          />
          <DiscoveryCard
            href="/growth"
            title="Growth Pack"
            detail="Learn only what helps your next move."
            icon="△"
          />
          <DiscoveryCard
            href="/guide"
            title="Builder Guide"
            detail="Private guidance grounded in your evidence."
            icon="✦"
          />
        </div>
      </section>

      <section className="mt-6 rounded-[1.75rem] bg-gradient-to-br from-[#18233d] to-[#27365c] p-5 text-white sm:p-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-indigo-200 uppercase">
          A healthier discovery habit
        </p>
        <h2 className="mt-2 text-xl font-bold">
          Open PipuPath to notice, test and move—not to compare yourself.
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          There are no personality rankings or popularity scores here. Your
          clearest picture comes from repeated real-world evidence.
        </p>
      </section>
    </main>
  );
}

function DiscoveryLens({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-[5.6rem] flex-col items-center gap-2 rounded-[1.5rem] border border-[#e6e8ef] bg-white px-3 py-4 shadow-sm transition-transform hover:-translate-y-0.5"
    >
      <span className="grid size-11 place-items-center rounded-full bg-[#eef0ff] text-[#5757e8]">
        {icon}
      </span>
      <span className="text-xs font-semibold text-[#26324d]">{label}</span>
    </Link>
  );
}

function DiscoveryCard({
  href,
  title,
  detail,
  icon,
}: {
  href: string;
  title: string;
  detail: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.65rem] border border-[#e6e8ef] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(36,48,78,0.4)] transition-transform hover:-translate-y-0.5"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-[#eef0ff] text-[#5757e8]">
        {icon}
      </span>
      <h3 className="mt-4 font-bold text-[#18233d]">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
    </Link>
  );
}
