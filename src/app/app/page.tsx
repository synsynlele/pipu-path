import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentPlatformAdminRole } from "@/modules/admin/infrastructure/admin-dal";
import { getBuilderLevelProgress } from "@/modules/identity/domain/builder-level";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const metadata: Metadata = {
  title: "Home",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const adventureStages = [
  { key: "discovery", label: "Discover", icon: "◇" },
  { key: "potential-profile", label: "You", icon: "✦" },
  { key: "mission", label: "Mission", icon: "⚑" },
  { key: "journey", label: "Journey", icon: "↗" },
  { key: "quests", label: "Quest", icon: "⚡" },
  { key: "project", label: "Build", icon: "+" },
  { key: "portfolio", label: "Proof", icon: "▣" },
] as const;

type AdventureStageKey = (typeof adventureStages)[number]["key"];
type HomeState = Awaited<ReturnType<typeof requireAuthenticatedHomeState>>;

function normalizeStage(stage: string): AdventureStageKey {
  if (
    stage === "identity" ||
    stage === "discovery" ||
    stage === "discovery-review"
  ) {
    return "discovery";
  }
  if (stage === "potential-profile") return "potential-profile";
  if (stage === "mission") return "mission";
  if (stage === "journey") return "journey";
  if (stage === "quests") return "quests";
  if (stage === "project") return "project";
  return "portfolio";
}

function questAction(status: string | undefined) {
  if (status === "available") return "Start Quest";
  if (status === "active") return "Continue Quest";
  if (status === "evidence_submitted") return "Reflect & complete";
  return null;
}

function nextMove(state: HomeState) {
  if (state.quest?.id) {
    return {
      title: state.quest.title,
      detail:
        state.quest.status === "evidence_submitted"
          ? "Your proof is saved. Reflect on what happened and unlock what comes next."
          : "Take this challenge into real life. Come back with honest proof of what happened.",
      href: `/quests/${state.quest.id}`,
      label: questAction(state.quest.status) ?? "Open Quest",
      signal: "Real-world challenge",
    };
  }

  if (state.project?.id && state.project.status === "active") {
    return {
      title: state.project.title,
      detail: state.projectProgress
        ? `${state.projectProgress.completed} of ${state.projectProgress.total} build milestones complete. Move the next one forward with evidence.`
        : "Advance the next evidence-backed milestone in your active Build.",
      href: `/projects/${state.project.id}`,
      label: "Continue Build",
      signal: "Major build",
    };
  }

  return {
    title: state.destination.label,
    detail: state.destination.description,
    href: state.destination.path,
    label: state.destination.label,
    signal: "Your next move",
  };
}

function stageHref(stage: AdventureStageKey, state: HomeState) {
  if (stage === "discovery") return "/discover";
  if (stage === "potential-profile") return "/profile";
  if (stage === "mission") return "/mission";
  if (stage === "journey") return "/journey";
  if (stage === "quests") {
    return state.quest?.id ? `/quests/${state.quest.id}` : "/quests";
  }
  if (stage === "project") {
    return state.project?.id ? `/projects/${state.project.id}` : "/projects";
  }
  return "/portfolio";
}

export default async function HomePage() {
  const [state, adminRole] = await Promise.all([
    requireAuthenticatedHomeState(),
    getCurrentPlatformAdminRole(),
  ]);
  const level = getBuilderLevelProgress(state.totalXp);
  const move = nextMove(state);
  const currentStage = normalizeStage(state.destination.stage);
  const currentStageIndex = adventureStages.findIndex(
    (stage) => stage.key === currentStage,
  );
  const completedGrowthCycle = Boolean(
    state.snapshot.completedProjectId &&
      state.snapshot.journeyStatus === "completed",
  );
  const adventureProgress = completedGrowthCycle
    ? 100
    : Math.max(
        8,
        Math.round(
          ((Math.max(0, currentStageIndex) + 1) / adventureStages.length) * 100,
        ),
      );

  return (
    <main id="main-content" className="w-full pb-8">
      <section className="relative overflow-hidden bg-[#201b59] px-4 pt-5 pb-14 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-4 px-1">
            <div>
              <p className="text-[1.7rem] font-bold tracking-[-0.035em] sm:text-3xl">
                Good to see you, {state.preferredName}.
              </p>
              <p className="mt-1 text-sm text-indigo-100/75 sm:text-base">
                Your potential is waiting. Keep building.
              </p>
            </div>
            <Link
              href="/profile"
              className="shrink-0 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-indigo-50"
            >
              {level.current} · {state.totalXp} XP
            </Link>
          </div>

          {adminRole ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#e7c96d]/20 bg-[#e7c96d]/8 px-4 py-3 text-sm">
              <span>
                <strong className="text-[#f2d77f]">Mission Control</strong>
                <span className="ml-2 text-indigo-100/70 capitalize">
                  Platform {adminRole}
                </span>
              </span>
              <Link href="/admin" className="font-semibold text-white">
                Open →
              </Link>
            </div>
          ) : null}

          <section className="pp-app-hero pp-mobile-section mt-5 min-h-[15.5rem] p-5 sm:p-7">
            <div className="relative z-10 max-w-[65%] sm:max-w-[58%]">
              <p className="text-xs font-semibold tracking-[0.13em] text-indigo-100 uppercase">
                {state.mission ? "Continue your mission" : "Your adventure"}
              </p>
              <h1 className="mt-3 text-[1.75rem] leading-tight font-bold tracking-[-0.035em] sm:text-4xl">
                {state.mission?.title ?? "Discover what you can become."}
              </h1>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-indigo-50/76">
                {state.mission?.mission_statement ??
                  state.destination.description}
              </p>
            </div>

            <Image
              src="/stage26/mission-mountain.svg"
              alt=""
              width={520}
              height={360}
              priority
              className="pointer-events-none absolute right-[-4.2rem] bottom-[-1rem] z-0 w-[72%] max-w-[25rem] opacity-95 sm:right-[-1rem] sm:w-[56%]"
            />

            <div className="absolute right-5 bottom-5 left-5 z-10 sm:right-7 sm:bottom-7 sm:left-7">
              <div className="h-2.5 overflow-hidden rounded-full bg-white/18">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2bd5c1] via-[#6c7bf8] to-[#b277ff]"
                  style={{ width: `${adventureProgress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs font-medium text-indigo-50/88">
                <span>{adventureProgress}% through this growth cycle</span>
                <Link
                  href={move.href}
                  aria-label={move.label}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xl font-bold text-[#281d69] shadow-lg transition-transform active:scale-95"
                >
                  ›
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      <div className="relative -mt-6 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Your growth path"
            className="pp-stage26-scroll -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          >
            <div className="flex w-max gap-4 sm:gap-5">
              <Link
                href="/mission"
                className="flex w-[4.7rem] shrink-0 flex-col items-center gap-2 text-center"
              >
                <span className="grid size-[3.75rem] place-items-center rounded-full border border-[#ececf4] bg-white text-3xl font-light text-[#3d3c62] shadow-sm">
                  +
                </span>
                <span className="text-[0.7rem] font-medium text-[#343751]">
                  New Mission
                </span>
              </Link>

              {adventureStages.map((stage, index) => {
                const active = stage.key === currentStage;
                const complete =
                  completedGrowthCycle || index < currentStageIndex;
                return (
                  <Link
                    key={stage.key}
                    href={stageHref(stage.key, state)}
                    className="flex w-[4.7rem] shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <span className="pp-story-ring rounded-full">
                      <span
                        className={`grid size-[3.45rem] place-items-center rounded-full border-2 border-white text-base font-bold ${
                          active
                            ? "bg-gradient-to-br from-[#4638b7] to-[#201d68] text-white"
                            : complete
                              ? "bg-[#eef6f5] text-[#20a891]"
                              : "bg-[#f0effa] text-[#594bd4]"
                        }`}
                      >
                        {complete && !active ? "✓" : stage.icon}
                      </span>
                    </span>
                    <span
                      className={`text-[0.7rem] leading-4 font-semibold ${active ? "text-[#4634c8]" : "text-[#343751]"}`}
                    >
                      {stage.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <section
            className="pp-mobile-section mt-5"
            aria-labelledby="momentum-heading"
          >
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 id="momentum-heading" className="pp-section-title text-xl">
                Your momentum
              </h2>
              <Link
                href="/profile"
                className="text-sm font-semibold text-[#5b3be0]"
              >
                See all
              </Link>
            </div>

            <div className="pp-app-card mt-3 overflow-hidden px-4 sm:px-5">
              {state.recentAchievement ? (
                <MomentumRow
                  icon="★"
                  title={state.recentAchievement}
                  detail="A verified win from your recent PipuPath work."
                  badge="Earned"
                />
              ) : null}
              {state.quest ? (
                <MomentumRow
                  icon="⚡"
                  title={state.quest.title}
                  detail={
                    state.quest.status === "evidence_submitted"
                      ? "Proof saved. Reflection is waiting."
                      : "Your current real-world challenge is active."
                  }
                  href={`/quests/${state.quest.id}`}
                  badge={
                    state.quest.status === "evidence_submitted"
                      ? "Reflect"
                      : "Active"
                  }
                />
              ) : null}
              {state.project?.id ? (
                <MomentumRow
                  icon="+"
                  title={state.project.title}
                  detail={
                    state.projectProgress
                      ? `${state.projectProgress.completed} of ${state.projectProgress.total} milestones complete.`
                      : "Your major Build is moving."
                  }
                  href={`/projects/${state.project.id}`}
                  badge="Build"
                />
              ) : null}
              <MomentumRow
                icon="↑"
                title={`${level.current} · ${state.totalXp} XP`}
                detail={
                  level.next
                    ? `${level.xpToNext} verified XP until ${level.next}.`
                    : "Highest current Builder level reached."
                }
                href="/profile"
                badge="Level"
              />
            </div>
          </section>

          <section className="pp-app-card pp-mobile-section mt-4 flex items-center gap-4 p-4 sm:p-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f0ebff] text-2xl text-[#593bd7]">
              ✓
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-[#25284a]">
                Today&apos;s Next Step
              </p>
              <p className="mt-1 text-sm leading-5 text-[#6f768f]">
                {move.title}
              </p>
              <p className="mt-1 text-xs text-[#9299ad]">{move.signal}</p>
            </div>
            <ButtonLink href={move.href} className="shrink-0 rounded-full px-4">
              {move.label}
            </ButtonLink>
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/guide"
              className="pp-app-card pp-app-card-interactive p-5"
            >
              <span className="text-xs font-bold tracking-[0.12em] text-[#6545dc] uppercase">
                Pipu · Builder Guide
              </span>
              <h2 className="mt-2 text-lg font-bold text-[#25284a]">
                Need clarity, not more noise?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#747b90]">
                Ask for private guidance grounded in your current evidence and
                next real action.
              </p>
            </Link>
            <Link
              href="/connect"
              className="pp-app-card pp-app-card-interactive p-5"
            >
              <span className="text-xs font-bold tracking-[0.12em] text-[#16a28f] uppercase">
                Builder World
              </span>
              <h2 className="mt-2 text-lg font-bold text-[#25284a]">
                Find people who complement your mission.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#747b90]">
                No follower contest. Connect around capability, contribution and
                collaboration.
              </p>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

function MomentumRow({
  icon,
  title,
  detail,
  badge,
  href,
}: {
  icon: string;
  title: string;
  detail: string;
  badge: string;
  href?: string;
}) {
  const row = (
    <div className="flex min-h-[5.4rem] items-center gap-3 border-b border-[#ececf3] py-3 last:border-0">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#efeaff] to-[#e8f9f6] text-base font-bold text-[#563fd2]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#2a2d4d]">
          {title}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#777f96]">
          {detail}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-[#f0ebff] px-2.5 py-1 text-[0.68rem] font-bold text-[#6243df]">
        {badge}
      </span>
    </div>
  );

  return href ? (
    <Link href={href} className="block transition-opacity active:opacity-70">
      {row}
    </Link>
  ) : (
    row
  );
}
