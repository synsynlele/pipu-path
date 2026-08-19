import type { Metadata } from "next";
import Link from "next/link";
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
  { key: "discovery", label: "Discover" },
  { key: "potential-profile", label: "Profile" },
  { key: "mission", label: "Mission" },
  { key: "journey", label: "Journey" },
  { key: "quests", label: "Quest" },
  { key: "project", label: "Build" },
  { key: "portfolio", label: "Prove" },
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
  if (status === "available") return "Start this Quest";
  if (status === "active") return "Continue this Quest";
  if (status === "evidence_submitted") return "Reflect and complete";
  return null;
}

function nextMove(
  state: Awaited<ReturnType<typeof requireAuthenticatedHomeState>>,
) {
  if (state.quest?.id) {
    return {
      eyebrow: "Your next move",
      title: state.quest.title,
      detail:
        state.quest.status === "evidence_submitted"
          ? "Your proof is saved. Turn the experience into learning and complete the Quest."
          : "Take the challenge into real life. Come back with honest proof of what happened.",
      href: `/quests/${state.quest.id}`,
      label: questAction(state.quest.status) ?? "Open Quest",
      reward: "Real-world action",
    };
  }

  if (state.project?.id && state.project.status === "active") {
    return {
      eyebrow: "Your next move",
      title: state.project.title,
      detail: state.projectProgress
        ? `${state.projectProgress.completed} of ${state.projectProgress.total} build milestones complete. Move the next one forward with evidence.`
        : "Advance the next evidence-backed milestone in your active Build.",
      href: `/projects/${state.project.id}`,
      label: "Continue the Build",
      reward: "Build real value",
    };
  }

  return {
    eyebrow: "Your next move",
    title: state.destination.label,
    detail: state.destination.description,
    href: state.destination.path,
    label: state.destination.label,
    reward: "Advance your path",
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
  const portfolioPublished = state.portfolio?.status === "published";

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
    >
      {adminRole ? (
        <section className="border-gold/30 bg-gold/8 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="border-gold/35 bg-gold/10 text-gold grid size-9 place-items-center rounded-xl border text-sm"
            >
              ◈
            </span>
            <div>
              <p className="text-navy text-sm font-semibold">
                Mission Control available
              </p>
              <p className="text-muted text-xs capitalize">
                Platform {adminRole}
              </p>
            </div>
          </div>
          <ButtonLink href="/admin" variant="secondary" className="min-h-10">
            Enter Mission Control
          </ButtonLink>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.38fr_0.62fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white shadow-[0_30px_80px_-48px_rgba(79,124,255,0.8)] sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-16 size-72 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute right-20 -bottom-40 size-80 rounded-full bg-[#4f7cff]/20 blur-3xl"
          />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-blue-200 uppercase">
                  Welcome back, {state.preferredName}
                </p>
                <p className="mt-2 text-sm text-blue-100/75">
                  {level.current} · {state.totalXp} XP
                </p>
              </div>
              {state.mission ? (
                <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-blue-50">
                  Campaign active
                </span>
              ) : null}
            </div>

            <div className="mt-7 max-w-4xl">
              <p className="text-xs font-semibold tracking-[0.16em] text-blue-200 uppercase">
                {state.mission ? "Your campaign" : "Your adventure"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {state.mission?.title ??
                  "Discover what you can become by building."}
              </h1>
              {state.mission?.mission_statement ? (
                <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50/80 sm:text-lg">
                  {state.mission.mission_statement}
                </p>
              ) : null}
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-white/12 bg-white/7 p-4 backdrop-blur-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#f3c86b] uppercase">
                    ⚡ {move.eyebrow}
                  </p>
                  <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {move.title}
                  </h2>
                </div>
                <span className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-blue-100">
                  {move.reward}
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
                {move.detail}
              </p>
              <ButtonLink
                href={move.href}
                variant="premium"
                className="mt-5 min-w-44"
              >
                {move.label} →
              </ButtonLink>
            </div>
          </div>
        </div>

        <Surface className="overflow-hidden p-0">
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                  Builder level
                </p>
                <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
                  {level.current}
                </h2>
              </div>
              <div className="border-primary/15 bg-primary-soft text-primary grid size-14 place-items-center rounded-2xl border text-sm font-bold">
                {level.progressPercent}%
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-muted">{state.totalXp} XP earned</span>
                {level.next ? (
                  <span className="text-navy font-semibold">{level.next}</span>
                ) : (
                  <span className="text-navy font-semibold">Top MVP level</span>
                )}
              </div>
              <div
                className="bg-soft-blue mt-2 h-2.5 overflow-hidden rounded-full"
                aria-label={`${level.progressPercent}% through ${level.current}`}
              >
                <div
                  className="bg-primary h-full rounded-full transition-[width] motion-reduce:transition-none"
                  style={{ width: `${level.progressPercent}%` }}
                />
              </div>
              <p className="text-muted mt-3 text-sm leading-6">
                {level.next
                  ? `${level.xpToNext} verified XP until ${level.next}. XP comes from completed developmental action, not screen time.`
                  : "You reached the current highest Builder level. Keep building for evidence, capability and impact—not points alone."}
              </p>
            </div>
          </div>

          {state.recentAchievement ? (
            <div className="border-border bg-gold/8 border-t p-5 sm:p-7">
              <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
                Latest real win
              </p>
              <p className="text-navy mt-2 font-semibold">
                {state.recentAchievement}
              </p>
              <p className="text-muted mt-1 text-xs">
                Recorded from completed PipuPath work.
              </p>
            </div>
          ) : null}
        </Surface>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Surface className="overflow-hidden p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                Adventure map
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                {completedGrowthCycle
                  ? "A new growth cycle is open"
                  : "See where you are. Not everything comes at once."}
              </h2>
            </div>
            {state.journey?.title ? (
              <Link
                href="/journey"
                className="text-primary text-sm font-semibold"
              >
                Open Journey →
              </Link>
            ) : null}
          </div>

          <ol
            className="mt-7 grid grid-cols-7 gap-1 sm:gap-2"
            aria-label="Builder adventure progress"
          >
            {adventureStages.map((stage, index) => {
              const isPortfolioProof = stage.key === "portfolio";
              const completed = isPortfolioProof
                ? portfolioPublished
                : !completedGrowthCycle && index < currentStageIndex;
              const active =
                !completedGrowthCycle && index === currentStageIndex;
              const reset = completedGrowthCycle && stage.key === "journey";
              const stateLabel = completed
                ? "completed"
                : active || reset
                  ? "current"
                  : "ahead";

              return (
                <li key={stage.key} className="relative min-w-0 text-center">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className={`absolute top-[1.15rem] -left-1/2 h-px w-full ${completed || active || reset ? "bg-primary/50" : "bg-border"}`}
                    />
                  ) : null}
                  <div
                    className={`relative z-10 mx-auto grid size-9 place-items-center rounded-full border text-xs font-bold sm:size-10 ${
                      completed
                        ? "border-success/30 bg-success/10 text-success"
                        : active || reset
                          ? "border-primary bg-primary text-white shadow-[0_0_0_5px_rgba(79,124,255,0.09)]"
                          : "border-border bg-background text-muted"
                    }`}
                    aria-label={`${stage.label}: ${stateLabel}`}
                  >
                    {completed ? "✓" : active || reset ? "●" : "?"}
                  </div>
                  <span
                    className={`mt-2 block truncate text-[0.62rem] font-semibold sm:text-xs ${active || reset ? "text-primary" : "text-muted"}`}
                  >
                    {stage.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="border-border mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <div>
              <p className="text-muted text-xs tracking-wide uppercase">
                Current chapter
              </p>
              <p className="text-navy mt-1 font-semibold">
                {state.journey?.title ?? state.destination.label}
              </p>
            </div>
            {state.milestone ? (
              <div className="text-right">
                <p className="text-muted text-xs tracking-wide uppercase">
                  Current milestone
                </p>
                <p className="text-navy mt-1 text-sm font-semibold">
                  {state.milestone.title}
                </p>
              </div>
            ) : null}
          </div>
        </Surface>

        <Surface className="p-5 sm:p-7">
          <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase">
            Builder Guide
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
            Stuck? Ask about the next move.
          </h2>
          <p className="text-muted mt-3 text-sm leading-6">
            Get private guidance grounded in your current PipuPath evidence and
            development state.
          </p>
          <ButtonLink href="/guide" variant="secondary" className="mt-5">
            Ask Builder Guide
          </ButtonLink>
        </Surface>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
              Builder toolkit
            </p>
            <h2 className="text-navy mt-1 text-lg font-semibold">
              Go somewhere specific
            </h2>
          </div>
          <span className="text-muted text-xs">
            Your adventure stays the priority.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <ToolkitLink href="/journey" icon="◇" label="Journey" />
          <ToolkitLink href="/build" icon="⚒" label="Build" />
          <ToolkitLink href="/portfolio" icon="▣" label="Portfolio" />
          <ToolkitLink href="/connect" icon="◎" label="Connect" />
          <ToolkitLink href="/opportunities" icon="↗" label="Opportunities" />
          <ToolkitLink href="/profile" icon="◉" label="Me" />
        </div>
      </section>
    </main>
  );
}

function ToolkitLink({
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
      className="border-border bg-panel hover:border-primary/30 hover:bg-primary-soft/40 group flex min-h-20 items-center gap-3 rounded-2xl border p-3 transition-colors"
    >
      <span
        aria-hidden="true"
        className="border-border bg-background text-primary grid size-9 shrink-0 place-items-center rounded-xl border text-sm transition-transform motion-safe:group-hover:-translate-y-0.5"
      >
        {icon}
      </span>
      <span className="text-navy min-w-0 text-sm font-semibold">{label}</span>
    </Link>
  );
}
