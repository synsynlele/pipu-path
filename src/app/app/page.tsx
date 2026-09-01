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
  const adventureProgress = completedGrowthCycle
    ? 100
    : Math.max(
        8,
        Math.round(((Math.max(0, currentStageIndex) + 1) / adventureStages.length) * 100),
      );

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
    >
      {adminRole ? (
        <section className="border-gold/30 bg-gold/8 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3">
          <div>
            <p className="text-navy text-sm font-semibold">Mission Control</p>
            <p className="text-muted mt-0.5 text-xs capitalize">
              Platform {adminRole}
            </p>
          </div>
          <ButtonLink href="/admin" variant="secondary" className="min-h-10">
            Open
          </ButtonLink>
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white shadow-[0_32px_90px_-52px_rgba(79,124,255,0.9)] sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-14 size-64 rounded-full bg-[#4f7cff]/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-14 size-60 rounded-full bg-[#c9a54d]/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-blue-200 uppercase">
                Welcome back, {state.preferredName}
              </p>
              <p className="mt-2 text-sm text-blue-100/72">
                {level.current} · {state.totalXp} verified XP
              </p>
            </div>
            <div
              className="border-primary-light/25 bg-white/8 grid size-12 shrink-0 place-items-center rounded-full border text-xs font-bold text-blue-50"
              aria-label={`${level.progressPercent}% through ${level.current}`}
            >
              {level.progressPercent}%
            </div>
          </div>

          <div className="mt-7 max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.15em] text-[#e5c96f] uppercase">
              {state.mission ? "Your mission" : "Your adventure"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {state.mission?.title ?? "Discover what you can become by building."}
            </h1>
            {state.mission?.mission_statement ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/78 sm:text-base">
                {state.mission.mission_statement}
              </p>
            ) : null}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 text-xs text-blue-100/75">
              <span>Your path</span>
              <span>{adventureProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#79a8ff] to-[#e5c96f] transition-[width] motion-reduce:transition-none"
                style={{ width: `${adventureProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[1.65rem] border border-white/12 bg-white/7 p-4 backdrop-blur-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#e5c96f] uppercase">
                ⚡ Next move
              </p>
              <span className="rounded-full border border-white/12 px-3 py-1 text-[0.7rem] font-semibold text-blue-100">
                {move.signal}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {move.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50/74">
              {move.detail}
            </p>
            <ButtonLink href={move.href} variant="premium" className="mt-5 min-w-40">
              {move.label} →
            </ButtonLink>
          </div>
        </div>
      </section>

      <nav
        aria-label="Adventure shortcuts"
        className="mt-4 -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        <div className="flex w-max gap-3">
          <AdventureShortcut
            href="/discover"
            icon="◇"
            title="Discover"
            detail={currentStageIndex <= 1 ? "Current" : "Insights"}
          />
          <AdventureShortcut
            href="/journey"
            icon="↗"
            title="Journey"
            detail={state.journey ? "Active" : "Next"}
          />
          <AdventureShortcut
            href={state.quest?.id ? `/quests/${state.quest.id}` : "/build"}
            icon="⚡"
            title="Quest"
            detail={state.quest ? "Continue" : "Prepare"}
          />
          <AdventureShortcut
            href={state.project?.id ? `/projects/${state.project.id}` : "/build"}
            icon="＋"
            title="Build"
            detail={state.project ? "In progress" : "Create"}
          />
          <AdventureShortcut
            href="/portfolio"
            icon="▣"
            title="Vault"
            detail={portfolioPublished ? "Published" : "Private"}
          />
        </div>
      </nav>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Surface className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Your momentum
              </p>
              <h2 className="text-navy mt-1 text-xl font-semibold tracking-tight">
                What is moving because you acted
              </h2>
            </div>
            <Link href="/profile" className="text-primary text-sm font-semibold">
              See profile →
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
                  : "Current highest Builder level reached. Keep building for evidence and impact."
              }
              href="/profile"
            />
          </div>
        </Surface>

        <div className="grid gap-4">
          <Surface className="p-5 sm:p-6">
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              Builder Guide
            </p>
            <h2 className="text-navy mt-2 text-xl font-semibold tracking-tight">
              Need clarity, not more noise?
            </h2>
            <p className="text-muted mt-3 text-sm leading-6">
              Ask for private guidance grounded in your current evidence and next
              real-world action.
            </p>
            <ButtonLink href="/guide" variant="secondary" className="mt-5">
              Ask Pipu
            </ButtonLink>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Builder world
            </p>
            <h2 className="text-navy mt-2 text-xl font-semibold tracking-tight">
              Find people who complement what you are building.
            </h2>
            <p className="text-muted mt-3 text-sm leading-6">
              No follower contest. Connect around missions, capabilities and
              useful collaboration.
            </p>
            <ButtonLink href="/connect" variant="secondary" className="mt-5">
              Explore Connect
            </ButtonLink>
          </Surface>
        </div>
      </section>
    </main>
  );
}

function AdventureShortcut({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="border-border bg-panel hover:border-primary/35 group flex min-h-24 w-28 touch-manipulation flex-col justify-between rounded-3xl border p-3.5 transition-colors sm:w-32"
    >
      <span
        aria-hidden="true"
        className="border-primary/20 bg-primary-soft/70 text-primary-light grid size-9 place-items-center rounded-full border text-sm transition-transform motion-safe:group-hover:-translate-y-0.5"
      >
        {icon}
      </span>
      <span>
        <span className="text-navy block text-sm font-semibold">{title}</span>
        <span className="text-muted mt-0.5 block text-[0.7rem]">{detail}</span>
      </span>
    </Link>
  );
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
        className={`grid size-10 shrink-0 place-items-center rounded-full border text-sm ${accent === "gold" ? "border-gold/25 bg-gold/10 text-gold-light" : "border-primary/20 bg-primary-soft/65 text-primary-light"}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-muted block text-[0.68rem] font-semibold tracking-[0.1em] uppercase">
          {eyebrow}
        </span>
        <span className="text-navy mt-1 block font-semibold">{title}</span>
        <span className="text-muted mt-1 block text-sm leading-5">{detail}</span>
      </span>
      {href ? (
        <span className="text-primary shrink-0 text-lg" aria-hidden="true">
          ›
        </span>
      ) : null}
    </>
  );

  const classes =
    "border-border flex items-center gap-3 border-b py-4 last:border-b-0";

  if (!href) return <div className={classes}>{content}</div>;

  return (
    <Link href={href} className={`${classes} group`}>
      {content}
    </Link>
  );
}
