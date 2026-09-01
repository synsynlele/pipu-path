import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
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
  const primaryLabel = discovering ? state.destination.label : "Open your profile";

  return (
    <main id="main-content" className="w-full pb-8">
      <section className="bg-[#201b59] px-4 pt-5 pb-12 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4 px-1">
            <div>
              <h1 className="text-[2rem] font-bold tracking-[-0.04em] sm:text-4xl">Discover</h1>
              <p className="mt-1 text-sm text-indigo-100/72">
                Learn what lights you up, then test it in real life.
              </p>
            </div>
            <Link
              href="/profile"
              className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-indigo-50"
            >
              {level.current} · {state.totalXp} XP
            </Link>
          </div>

          <section className="pp-app-hero pp-mobile-section mt-5 min-h-[17rem] p-5 sm:p-7">
            <div className="relative z-10 max-w-[64%] sm:max-w-[56%]">
              <p className="text-xs font-semibold tracking-[0.13em] text-[#d5c9ff] uppercase">
                What drives you?
              </p>
              <h2 className="mt-3 text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
                {discovering
                  ? "Keep uncovering the signals that matter."
                  : "Your real work is sharpening the picture of you."}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-indigo-50/78">
                PipuPath uses your choices, attempts, evidence and reflection. It does not reduce you to a fixed AI label.
              </p>
              <ButtonLink href={primaryHref} className="mt-5 rounded-full bg-white text-[#4934c8] hover:bg-white/90">
                {primaryLabel}
              </ButtonLink>
            </div>

            <Image
              src="/stage26/discover-lighthouse.svg"
              alt=""
              width={520}
              height={360}
              priority
              className="pointer-events-none absolute right-[-5rem] bottom-[-1rem] z-0 w-[72%] max-w-[26rem] sm:right-[-1rem] sm:w-[55%]"
            />
          </section>
        </div>
      </section>

      <div className="relative -mt-5 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Discovery lenses"
            className="pp-stage26-scroll -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          >
            <div className="flex w-max gap-2.5">
              <DiscoveryChip href="/profile" icon="◇" label="Strengths" />
              <DiscoveryChip href="/profile" icon="♡" label="Interests" />
              <DiscoveryChip href="/mission" icon="⚑" label="Mission" />
              <DiscoveryChip href="/growth" icon="⚡" label="Growth" />
              <DiscoveryChip href="/guide" icon="✦" label="Ask Pipu" />
            </div>
          </nav>

          <section className="pp-app-card pp-mobile-section mt-5 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">Your living insight</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[#25284a] sm:text-2xl">
                  {state.mission?.title ?? state.destination.label}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-[#dff8f4] px-2.5 py-1 text-[0.68rem] font-bold text-[#119c88]">Live</span>
            </div>
            <div className="mt-4 rounded-[1.35rem] border border-[#e6e0fa] bg-gradient-to-br from-[#faf8ff] to-[#f2efff] p-4">
              <div className="flex gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7049e8] to-[#df79b3] text-xl text-white">✦</span>
                <div>
                  <p className="text-sm font-bold leading-6 text-[#2a2d4d]">
                    {state.mission?.mission_statement ?? state.destination.description}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#7d8299]">
                    This evolves from completed Quests, evidence, reflection, Projects and verified capability.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="pp-app-card pp-mobile-section mt-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[#13a28d] uppercase">Your direction</p>
                <h2 className="mt-2 text-xl font-bold text-[#25284a]">
                  {state.journey?.title ?? "Your next path is still opening"}
                </h2>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e7f8f5] text-xl text-[#16a28f]">↗</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#747b90]">
              {state.journey
                ? "Your current Journey turns discovery into real-world experiments, evidence and growth."
                : "Keep moving through Discovery. PipuPath will reveal a meaningful next move when the evidence is ready."}
            </p>
            <ButtonLink
              href={state.journey ? "/journey" : primaryHref}
              variant="secondary"
              className="mt-4 rounded-full"
            >
              {state.journey ? "See my Journey" : "Continue Discovery"}
            </ButtonLink>
          </section>

          <section className="pp-mobile-section mt-6">
            <div className="flex items-end justify-between gap-3 px-1">
              <div>
                <h2 className="pp-section-title text-xl">For you</h2>
                <p className="mt-1 text-sm text-[#8a90a4]">Useful places based on your current adventure.</p>
              </div>
            </div>

            <div className="pp-stage26-scroll -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
              <DiscoveryCard href="/profile" title="Living Profile" detail="See evidence-backed signals." icon="◇" />
              <DiscoveryCard href="/mission" title="Direction" detail="Revisit the mission you are testing." icon="⚑" />
              <DiscoveryCard href="/growth" title="Growth Pack" detail="Learn only what helps the next move." icon="↗" />
              <DiscoveryCard href="/guide" title="Builder Guide" detail="Get private contextual guidance." icon="✦" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DiscoveryChip({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="pp-soft-chip flex min-h-11 shrink-0 touch-manipulation items-center gap-2 rounded-full px-4 text-sm font-semibold transition-transform active:scale-[0.98]"
    >
      <span className="text-[#5f46d6]" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function DiscoveryCard({ href, title, detail, icon }: { href: string; title: string; detail: string; icon: string }) {
  return (
    <Link
      href={href}
      className="pp-app-card pp-app-card-interactive flex w-[10.4rem] shrink-0 flex-col p-4 sm:w-auto"
    >
      <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[#7358ee] to-[#e479ae] text-base text-white" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 text-sm font-bold leading-5 text-[#25284a]">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-[#7f859a]">{detail}</p>
    </Link>
  );
}
