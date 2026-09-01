import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { getBuilderLevelProgress } from "@/modules/identity/domain/builder-level";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build",
  robots: { index: false, follow: false },
};

type HomeState = Awaited<ReturnType<typeof requireAuthenticatedHomeState>>;

function currentAction(state: HomeState) {
  if (state.quest?.id) {
    return {
      title: state.quest.title,
      detail:
        state.quest.status === "evidence_submitted"
          ? "Your evidence is saved. Reflect honestly, then reveal what comes next."
          : "Take the Quest into real life and return with truthful evidence of what happened.",
      href: `/quests/${state.quest.id}`,
      label:
        state.quest.status === "evidence_submitted"
          ? "Reflect & complete"
          : state.quest.status === "available"
            ? "Start Quest"
            : "Do Next Step",
      progress: null,
    };
  }

  if (state.project?.id && state.project.status === "active") {
    const progress =
      state.projectProgress && state.projectProgress.total > 0
        ? Math.round(
            (state.projectProgress.completed / state.projectProgress.total) *
              100,
          )
        : null;
    return {
      title: state.project.title,
      detail: state.projectProgress
        ? `${state.projectProgress.completed} of ${state.projectProgress.total} milestones are complete. Keep the next milestone moving with evidence.`
        : "Move the next evidence-backed milestone in your active Build.",
      href: `/projects/${state.project.id}`,
      label: "Continue Build",
      progress,
    };
  }

  if (state.journey) {
    return {
      title: state.journey.title,
      detail:
        "Your Journey is the path. Open it and move into the next real-world challenge.",
      href: "/journey",
      label: "Open Journey",
      progress: null,
    };
  }

  return {
    title: "Start from what matters now",
    detail: state.destination.description,
    href: state.destination.path,
    label: state.destination.label,
    progress: null,
  };
}

export default async function BuildPage() {
  const state = await requireAuthenticatedHomeState();
  const level = getBuilderLevelProgress(state.totalXp);
  const action = currentAction(state);
  const proofSaved = state.quest?.status === "evidence_submitted";

  return (
    <main id="main-content" className="w-full pb-8">
      <section className="bg-[#201b59] px-4 pt-5 pb-12 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4 px-1">
            <div>
              <h1 className="text-[2rem] font-bold tracking-[-0.04em] sm:text-4xl">
                Build
              </h1>
              <p className="mt-1 text-sm text-indigo-100/72">
                One place for the real work: act, prove, reflect, build.
              </p>
            </div>
            <Link
              href="/profile"
              className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-indigo-50"
            >
              {level.current} · {state.totalXp} XP
            </Link>
          </div>

          <section className="pp-app-hero pp-mobile-section mt-5 min-h-[16.5rem] p-5 sm:p-7">
            <div className="relative z-10 max-w-[65%] sm:max-w-[58%]">
              <p className="text-xs font-semibold tracking-[0.13em] text-[#d8ccff] uppercase">
                Your current move
              </p>
              <h2 className="mt-3 text-[1.8rem] leading-tight font-bold tracking-[-0.035em] sm:text-4xl">
                {action.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-indigo-50/78">
                {action.detail}
              </p>
            </div>

            <Image
              src="/stage26/build-rocket.svg"
              alt=""
              width={520}
              height={360}
              priority
              className="pointer-events-none absolute right-[-4.8rem] bottom-[-1.2rem] z-0 w-[72%] max-w-[26rem] sm:right-[-1rem] sm:w-[55%]"
            />

            <div className="absolute right-5 bottom-5 left-5 z-10 sm:right-7 sm:bottom-7 sm:left-7">
              {action.progress !== null ? (
                <>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/18">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2bd5c1] via-[#6c7bf8] to-[#b277ff]"
                      style={{ width: `${action.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-indigo-50/85">
                    <span>Project milestone progress</span>
                    <span>{action.progress}%</span>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-indigo-50/85 backdrop-blur-sm">
                  Your next move comes from your saved Builder state.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <div className="relative -mt-5 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className="pp-mobile-section">
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 className="pp-section-title text-xl">Your build flow</h2>
              <Link
                href="/projects"
                className="text-sm font-semibold text-[#5b3be0]"
              >
                All Builds
              </Link>
            </div>

            <div className="pp-app-card mt-3 overflow-hidden px-4 sm:px-5">
              <BuildFlowRow
                number="1"
                title="Journey"
                detail={
                  state.journey?.title ?? "Choose the direction worth testing."
                }
                status={state.journey ? "ready" : "next"}
                href="/journey"
              />
              <BuildFlowRow
                number="2"
                title="Real-world Quest"
                detail={
                  state.quest?.title ??
                  "A practical challenge appears when your Journey is ready."
                }
                status={
                  state.quest ? "current" : state.journey ? "next" : "waiting"
                }
                href={state.quest?.id ? `/quests/${state.quest.id}` : "/quests"}
              />
              <BuildFlowRow
                number="3"
                title="Evidence"
                detail={
                  proofSaved
                    ? "Your latest Quest proof is saved."
                    : "Bring back honest proof of what you tried or made."
                }
                status={proofSaved ? "ready" : state.quest ? "next" : "waiting"}
                href={state.quest?.id ? `/quests/${state.quest.id}` : "/quests"}
              />
              <BuildFlowRow
                number="4"
                title="Reflection"
                detail={
                  proofSaved
                    ? "Reflection is the next move for this Quest."
                    : "Reflection unlocks after evidence is submitted."
                }
                status={proofSaved ? "current" : "waiting"}
                href={state.quest?.id ? `/quests/${state.quest.id}` : "/build"}
              />
              <BuildFlowRow
                number="5"
                title="Project"
                detail={
                  state.project?.title ??
                  "Turn repeated capability into something useful for the world."
                }
                status={state.project?.id ? "ready" : "waiting"}
                href={
                  state.project?.id
                    ? `/projects/${state.project.id}`
                    : "/projects"
                }
              />
            </div>
          </section>

          <section className="pp-app-card pp-mobile-section mt-4 flex items-center gap-4 p-4 sm:p-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-dashed border-[#bdb7df] bg-[#faf9ff] text-2xl text-[#5f46d6]">
              ▣
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-[#25284a]">
                Evidence of Progress
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#747b90]">
                Proof belongs to the Quest or Project that produced it. Private
                evidence stays private by default.
              </p>
            </div>
            <ButtonLink
              href={
                state.quest?.id
                  ? `/quests/${state.quest.id}`
                  : state.project?.id
                    ? `/projects/${state.project.id}`
                    : "/projects"
              }
              variant="secondary"
              className="shrink-0 rounded-full px-4"
            >
              Open
            </ButtonLink>
          </section>

          <section className="pp-app-card pp-mobile-section mt-4 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ff7d63] to-[#6f49e9] text-xl text-white">
                ✦
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">
                  Nortnspoil reflection
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#25284a]">
                  Turn what happened into learning.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#747b90]">
                  Reflection is contextual. It appears inside the work that
                  generated the lesson instead of becoming another detached
                  feature.
                </p>
              </div>
            </div>
          </section>

          <ButtonLink
            href={action.href}
            className="mt-5 min-h-14 w-full rounded-full text-base shadow-[0_16px_30px_-20px_rgba(84,54,223,0.75)]"
          >
            {action.label} →
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

function BuildFlowRow({
  number,
  title,
  detail,
  status,
  href,
}: {
  number: string;
  title: string;
  detail: string;
  status: "ready" | "current" | "next" | "waiting";
  href: string;
}) {
  const stateClass =
    status === "ready"
      ? "bg-[#20b9a2] text-white"
      : status === "current"
        ? "bg-[#593bd7] text-white ring-4 ring-[#eeeaff]"
        : status === "next"
          ? "bg-[#ece9ff] text-[#593bd7]"
          : "border border-[#d9dae5] bg-white text-[#6f768f]";

  return (
    <Link
      href={href}
      className={`flex min-h-[5.6rem] items-center gap-3 border-b border-[#ececf3] py-3 last:border-0 ${status === "current" ? "-mx-2 rounded-2xl border border-[#7c61ed] bg-[#fbfaff] px-2" : ""}`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${stateClass}`}
      >
        {status === "ready" ? "✓" : number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#2a2d4d]">{title}</span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#7b8298]">
          {detail}
        </span>
      </span>
      <span className="text-lg text-[#a3a7b8]">›</span>
    </Link>
  );
}
