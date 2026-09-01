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
  const primaryTitle = discovering
    ? "Keep discovering what is already inside you."
    : "Your evidence is turning into a clearer picture of you.";

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white shadow-[0_30px_80px_-50px_rgba(79,124,255,0.85)] sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-20 size-64 rounded-full bg-[#4f7cff]/18 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-blue-200 uppercase">
                Discover
              </p>
              <p className="mt-2 text-sm text-blue-100/75">
                {state.preferredName} · {level.current} · {state.totalXp} XP
              </p>
            </div>
            <span className="rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-xs font-semibold text-blue-50">
              Evidence-led, not a personality box
            </span>
          </div>

          <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">
            {primaryTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/78 sm:text-base">
            PipuPath keeps learning from what you choose, attempt, build, prove
            and reflect on. You remain in control of the story.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink href={primaryHref} variant="premium">
              {primaryLabel} →
            </ButtonLink>
            <Link
              href="/guide"
              className="text-sm font-semibold text-blue-100 underline-offset-4 hover:underline"
            >
              Ask Builder Guide
            </Link>
          </div>
        </div>
      </section>

      <nav
        aria-label="Discovery shortcuts"
        className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        <div className="flex w-max gap-3 sm:w-full">
          <DiscoveryChip href="/profile" icon="◇" label="Strengths" />
          <DiscoveryChip href="/profile" icon="◎" label="Interests" />
          <DiscoveryChip href="/mission" icon="↗" label="Mission" />
          <DiscoveryChip href="/growth" icon="△" label="Growth" />
          <DiscoveryChip href="/guide" icon="✦" label="Guide" />
        </div>
      </nav>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Surface className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Current insight
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                {state.mission?.title ?? state.destination.label}
              </h2>
            </div>
            <span className="border-primary/20 bg-primary-soft/70 text-primary-light rounded-full border px-3 py-1 text-xs font-semibold">
              Live
            </span>
          </div>

          <p className="text-muted mt-3 text-sm leading-6 sm:text-base">
            {state.mission?.mission_statement ?? state.destination.description}
          </p>

          <div className="border-border mt-5 border-t pt-5">
            <p className="text-muted text-xs tracking-[0.12em] uppercase">
              What updates this picture?
            </p>
            <p className="text-navy mt-2 text-sm leading-6 font-semibold">
              Real Quest evidence, reflection, projects and verified capability
              — not likes, scrolling or time spent in the app.
            </p>
          </div>
        </Surface>

        <Surface className="p-5 sm:p-6">
          <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
            Your direction
          </p>
          <h2 className="text-navy mt-2 text-xl font-semibold tracking-tight">
            {state.journey?.title ?? "Your next path is still opening"}
          </h2>
          <p className="text-muted mt-3 text-sm leading-6">
            {state.journey
              ? "Your current Journey converts self-discovery into real-world experiments and proof."
              : "Keep moving through Discovery. PipuPath will reveal the next meaningful action when the evidence is ready."}
          </p>
          <ButtonLink
            href={state.journey ? "/journey" : primaryHref}
            variant="secondary"
            className="mt-5"
          >
            {state.journey ? "See the Journey" : "Continue Discovery"}
          </ButtonLink>
        </Surface>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
              For you
            </p>
            <h2 className="text-navy mt-1 text-lg font-semibold">
              Useful places, not an endless feed
            </h2>
          </div>
          <span className="text-muted hidden text-xs sm:inline">
            Learn only what helps the current adventure.
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DiscoveryCard
            href="/profile"
            title="Living Profile"
            detail="See evidence-backed capabilities and signals."
            icon="◉"
          />
          <DiscoveryCard
            href="/mission"
            title="Possible Paths"
            detail="Revisit direction and the Mission you are testing."
            icon="↗"
          />
          <DiscoveryCard
            href="/growth"
            title="Growth Pack"
            detail="Learn or practise only what helps your next move."
            icon="△"
          />
          <DiscoveryCard
            href="/guide"
            title="Builder Guide"
            detail="Get private guidance grounded in your PipuPath evidence."
            icon="✦"
          />
        </div>
      </section>
    </main>
  );
}

function DiscoveryChip({
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
      className="border-border bg-panel hover:border-primary/35 hover:bg-primary-soft/45 flex min-h-12 min-w-28 touch-manipulation items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors sm:flex-1"
    >
      <span className="text-primary-light" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
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
      className="border-border bg-panel hover:border-primary/35 group rounded-3xl border p-5 transition-colors"
    >
      <span
        aria-hidden="true"
        className="border-primary/20 bg-primary-soft/65 text-primary-light grid size-11 place-items-center rounded-2xl border text-base transition-transform motion-safe:group-hover:-translate-y-0.5"
      >
        {icon}
      </span>
      <h3 className="text-navy mt-4 font-semibold">{title}</h3>
      <p className="text-muted mt-2 text-sm leading-5">{detail}</p>
    </Link>
  );
}
