import type { Metadata } from "next";
import Link from "next/link";
import { InstallPwaCard } from "@/components/pwa/install-prompt";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
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
  { key: "potential-profile", label: "Profile", icon: "◉" },
  { key: "mission", label: "Mission", icon: "↗" },
  { key: "journey", label: "Journey", icon: "⌁" },
  { key: "quests", label: "Quest", icon: "⚡" },
  { key: "project", label: "Build", icon: "＋" },
  { key: "portfolio", label: "Prove", icon: "▣" },
] as const;

type AdventureStageKey = (typeof adventureStages)[number]["key"];

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

function nextMove(
  state: Awaited<ReturnType<typeof requireAuthenticatedHomeState>>,
) {
  if (state.quest?.id) {
    return {
      title: state.quest.title,
      detail:
        state.quest.status === "evidence_submitted"
          ? "Your proof is saved. Reflect on what happened and reveal what comes next."
          : "Take this into real life, then return with honest proof of what happened.",
      href: `/quests/${state.quest.id}`,
      label: questAction(state.quest.status) ?? "Open Quest",
      signal: "Your next real-world move",
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
      signal: "Continue where you left off",
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
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
    >
      <div className="mb-5 flex items-start justify-between gap-4 px-1">
        <div>
          <p className="text-sm font-medium text-slate-500">Welcome back</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-[#18233d] sm:text-3xl">
            {state.preferredName}
          </h1>
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-full border border-[#e4e6f0] bg-white px-3 py-2 shadow-sm"
        >
          <span className="grid size-8 place-items-center rounded-full bg-[#eef0ff] text-xs font-bold text-[#5757e8]">
            {level.progressPercent}%
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-[#18233d]">
              {level.current}
            </span>
            <span className="block text-[0.65rem] text-slate-500">
              {state.totalXp} XP
            </span>
          </span>
        </Link>
      </div>

      {adminRole ? (
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eadfbf] bg-[#fffaf0] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#5d4920]">
              Mission Control
            </p>
            <p className="mt-0.5 text-xs text-[#8a7446] capitalize">
              Platform {adminRole}
            </p>
          </div>
          <ButtonLink
            href="/admin"
            variant="secondary"
            className="min-h-10 rounded-full"
          >
            Open admin
          </ButtonLink>
        </section>
      ) : null}

      <section className="pp-social-card relative overflow-hidden rounded-[2rem] p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 size-72 rounded-full bg-[#eef0ff] blur-2xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.13em] text-[#6f79f7] uppercase">
                {state.mission ? "Your mission" : "Your adventure"}
              </p>
              <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-[#18233d] sm:text-3xl">
                {state.mission?.title ??
                  "Discover what you can become by building."}
              </h2>
            </div>
            <span className="rounded-full bg-[#f2f3f8] px-3 py-1.5 text-xs font-semibold text-slate-500">
              {adventureProgress}% path
            </span>
          </div>

          {state.mission?.mission_statement ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {state.mission.mission_statement}
            </p>
          ) : null}

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf0f6]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5757e8] via-[#7278f2] to-[#d4aa4c] transition-[width] motion-reduce:transition-none"
              style={{ width: `${adventureProgress}%` }}
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.65rem] bg-gradient-to-br from-[#5556e8] via-[#646cf0] to-[#7a7ff5] p-5 text-white shadow-[0_20px_44px_-24px_rgba(87,87,232,0.75)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.13em] text-indigo-100 uppercase">
                {move.signal}
              </p>
              <span className="rounded-full bg-white/12 px-3 py-1 text-[0.68rem] font-semibold text-white/90">
                Ready when you are
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {move.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-50/90">
              {move.detail}
            </p>
            <Link
              href={move.href}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#5757e8] shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {move.label} →
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5" aria-labelledby="path-heading">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 id="path-heading" className="text-sm font-bold text-[#18233d]">
            Your path
          </h2>
          <Link
            href="/discover"
            className="text-xs font-semibold text-[#5757e8]"
          >
            Explore →
          </Link>
        </div>
        <div className="pp-scrollbar-hidden -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {adventureStages.map((stage, index) => {
            const active = stage.key === currentStage;
            const complete = completedGrowthCycle || index < currentStageIndex;
            return (
              <Link
                key={stage.key}
                href={stageHref(stage.key, state)}
                className="flex w-[4.8rem] shrink-0 flex-col items-center gap-2 text-center"
              >
                <span
                  className={`grid size-14 place-items-center rounded-full border text-base font-bold shadow-sm ${
                    active
                      ? "border-[#5757e8] bg-[#5757e8] text-white"
                      : complete
                        ? "border-[#dadcf4] bg-[#eef0ff] text-[#5757e8]"
                        : "border-[#e7e9ef] bg-white text-slate-400"
                  }`}
                >
                  {complete && !active ? "✓" : stage.icon}
                </span>
                <span
                  className={`text-[0.68rem] font-semibold ${active ? "text-[#5757e8]" : "text-slate-500"}`}
                >
                  {stage.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Surface className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
                Your momentum
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#18233d]">
                Progress that came from action
              </h2>
            </div>
            <Link
              href="/profile"
              className="text-sm font-semibold text-[#5757e8]"
            >
              Profile →
            </Link>
          </div>

          <div className="mt-3 px-5 pb-5 sm:px-6 sm:pb-6">
            {state.recentAchievement ? (
              <MomentumRow
                icon="★"
                eyebrow="Latest real win"
                title={state.recentAchievement}
                detail="Recorded from completed PipuPath work."
                accent="gold"
              />
            ) : null}

            {state.quest ? (
              <MomentumRow
                icon="⚡"
                eyebrow="Current challenge"
                title={state.quest.title}
                detail={
                  state.quest.status === "evidence_submitted"
                    ? "Proof saved · reflection is the next step."
                    : "Take action in real life, then bring back proof."
                }
                href={`/quests/${state.quest.id}`}
              />
            ) : null}

            {state.project?.id ? (
              <MomentumRow
                icon="＋"
                eyebrow="Major build"
                title={state.project.title}
                detail={
                  state.projectProgress
                    ? `${state.projectProgress.completed} of ${state.projectProgress.total} milestones complete.`
                    : "Keep turning your capability into something useful."
                }
                href={`/projects/${state.project.id}`}
              />
            ) : null}

            <MomentumRow
              icon="↑"
              eyebrow="Builder level"
              title={`${level.current} · ${state.totalXp} XP`}
              detail={
                level.next
                  ? `${level.xpToNext} verified XP until ${level.next}.`
                  : "Highest Builder level reached. Keep building for evidence and impact."
              }
              href="/profile"
            />
          </div>
        </Surface>

        <div className="grid gap-4">
          <InstallPwaCard />

          <Surface className="p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#c59a36] uppercase">
              Builder Guide
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[#18233d]">
              Need clarity, not more noise?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ask for private guidance grounded in your evidence and next
              real-world action.
            </p>
            <ButtonLink
              href="/guide"
              variant="secondary"
              className="mt-4 rounded-full"
            >
              Ask Pipu
            </ButtonLink>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
              Builder world
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[#18233d]">
              Find people who complement what you are building.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              No follower contest. Connect around missions, capabilities and
              useful collaboration.
            </p>
            <ButtonLink
              href="/connect"
              variant="secondary"
              className="mt-4 rounded-full"
            >
              Explore Connect
            </ButtonLink>
          </Surface>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-[#e8eaf2] bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
              Come back for movement
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#18233d]">
              PipuPath should always reopen at the next useful thing.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              We measure return by action—Quest progress, proof, reflection,
              building and collaboration—not by how long you scroll.
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eef0ff] text-[#5757e8]">
            ↻
          </span>
        </div>
      </section>
    </main>
  );
}

function stageHref(
  stage: AdventureStageKey,
  state: Awaited<ReturnType<typeof requireAuthenticatedHomeState>>,
) {
  if (stage === "discovery" || stage === "potential-profile")
    return "/discover";
  if (stage === "mission") return "/mission";
  if (stage === "journey") return "/journey";
  if (stage === "quests")
    return state.quest?.id ? `/quests/${state.quest.id}` : "/quests";
  if (stage === "project")
    return state.project?.id ? `/projects/${state.project.id}` : "/projects";
  return "/portfolio";
}

function MomentumRow({
  icon,
  eyebrow,
  title,
  detail,
  href,
  accent = "primary",
}: {
  icon: string;
  eyebrow: string;
  title: string;
  detail: string;
  href?: string;
  accent?: "primary" | "gold";
}) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className={`grid size-10 shrink-0 place-items-center rounded-full border text-sm ${
          accent === "gold"
            ? "border-[#eadfbf] bg-[#fff8e7] text-[#b2872e]"
            : "border-[#dedff7] bg-[#eef0ff] text-[#5757e8]"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.66rem] font-semibold tracking-[0.1em] text-slate-400 uppercase">
          {eyebrow}
        </span>
        <span className="mt-1 block font-semibold text-[#18233d]">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">
          {detail}
        </span>
      </span>
      {href ? (
        <span className="shrink-0 text-lg text-[#5757e8]" aria-hidden="true">
          ›
        </span>
      ) : null}
    </>
  );

  const classes =
    "flex items-center gap-3 border-b border-[#eef0f4] py-4 last:border-b-0";

  if (!href) return <div className={classes}>{content}</div>;

  return (
    <Link href={href} className={`${classes} group`}>
      {content}
    </Link>
  );
}
