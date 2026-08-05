import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
export const metadata: Metadata = {
  title: "Home",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const stageOrder = [
  "identity",
  "discovery",
  "potential-profile",
  "mission",
  "journey",
  "quests",
  "project",
  "portfolio",
  "complete",
] as const;

const stageLabels: Record<(typeof stageOrder)[number], string> = {
  identity: "Identity",
  discovery: "Discovery",
  "potential-profile": "Profile",
  mission: "Mission",
  journey: "Journey",
  quests: "Quests",
  project: "Project",
  portfolio: "Portfolio",
  complete: "Builder Loop",
};

export default async function HomePage() {
  const state = await requireAuthenticatedHomeState();
  const currentIndex = Math.max(
    0,
    stageOrder.indexOf(
      state.destination.stage === "discovery-review"
        ? "discovery"
        : state.destination.stage === "sign-in"
          ? "identity"
          : state.destination.stage,
    ),
  );
  const progress = Math.round((currentIndex / (stageOrder.length - 1)) * 100);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#020817", color: "#f8fafc" }}
    >
      <main
        id="main-content"
        className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10"
      >
        <section
          className="shadow-primary/15 relative overflow-hidden rounded-[2rem] px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12"
          style={{
            backgroundColor: "#4f7cff",
            backgroundImage:
              "linear-gradient(135deg, #4f7cff 0%, #79a8ff 100%)",
            color: "#ffffff",
          }}
        >
          <div className="absolute -top-28 -right-20 size-72 rounded-full border border-white/15" />
          <div className="absolute right-20 -bottom-28 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-4xl">
            <p className="text-sm font-semibold tracking-[0.14em] text-blue-100 uppercase">
              Your PipuPath Home
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Welcome back, {state.preferredName}.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-50">
              {state.destination.description}
            </p>
            <ButtonLink
              href={state.destination.path}
              variant="premium"
              className="mt-7 min-w-48"
            >
              {state.destination.label}
            </ButtonLink>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Surface className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                  Current stage
                </p>
                <h2 className="text-navy mt-3 text-3xl font-semibold tracking-tight">
                  {stageLabels[stageOrder[currentIndex]]}
                </h2>
              </div>
              <span className="border-primary/20 bg-primary-soft text-primary rounded-full border px-3 py-1.5 text-sm font-semibold">
                {progress}% through the MVP path
              </span>
            </div>
            <div
              className="bg-soft-blue mt-7 h-2.5 overflow-hidden rounded-full"
              aria-label={`${progress}% complete`}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#4f7cff",
                  backgroundImage:
                    "linear-gradient(90deg, #4f7cff 0%, #79a8ff 100%)",
                }}
              />
            </div>
            <ol className="mt-7 grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {stageOrder.slice(1).map((stage, index) => {
                const completed =
                  index + 1 < currentIndex ||
                  state.destination.stage === "complete";
                const active =
                  index + 1 === currentIndex &&
                  state.destination.stage !== "complete";
                return (
                  <li key={stage} className="text-center">
                    <span
                      className={`mx-auto grid size-9 place-items-center rounded-2xl text-xs font-bold ${completed ? "bg-success/10 text-success" : active ? "bg-primary text-white" : "bg-soft text-muted"}`}
                    >
                      {completed ? "✓" : index + 1}
                    </span>
                    <span
                      className={`mt-2 block text-xs font-semibold ${active ? "text-primary" : "text-muted"}`}
                    >
                      {stageLabels[stage]}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Surface>

          <Surface className="p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
              Builder progress
            </p>
            <div className="mt-5 flex items-end gap-3">
              <strong className="text-navy text-5xl font-semibold tracking-tight">
                {state.totalXp}
              </strong>
              <span className="text-muted pb-1 text-sm font-semibold">
                XP earned
              </span>
            </div>
            <p className="text-muted mt-4 text-sm leading-6">
              XP appears only after completed Quests with evidence and
              reflection.
            </p>
            {state.recentAchievement ? (
              <div className="border-gold/25 bg-gold/8 mt-6 rounded-2xl border p-4">
                <p className="text-gold text-xs font-semibold uppercase">
                  Recent achievement
                </p>
                <p className="text-navy mt-2 font-semibold">
                  {state.recentAchievement}
                </p>
              </div>
            ) : null}
          </Surface>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            label="Active Mission"
            title={state.mission?.title ?? "Not chosen yet"}
            detail={
              state.mission?.mission_statement ??
              "Your Mission will appear after your Human Potential Profile is ready."
            }
            href="/mission"
          />
          <StatusCard
            label="Journey"
            title={state.journey?.title ?? "Not generated yet"}
            detail={
              state.milestone
                ? `Current milestone: ${state.milestone.title}`
                : "Your Journey turns Mission into ordered milestones."
            }
            href="/journey"
          />
          <StatusCard
            label="Next Builder action"
            title={
              state.quest?.title ??
              state.project?.title ??
              "No active build yet"
            }
            detail={
              state.quest
                ? "Complete the action, add evidence and reflect."
                : state.projectProgress
                  ? `${state.projectProgress.completed} of ${state.projectProgress.total} Project milestones completed.`
                  : "Quests and Projects appear only when earlier stages are complete."
            }
            href="/build"
          />
          <StatusCard
            label="Portfolio"
            title={state.portfolio?.public_title ?? "Private by default"}
            detail={
              state.portfolio
                ? `Status: ${state.portfolio.status ?? "not prepared"}`
                : "Choose what becomes public only after completing a Project."
            }
            href="/portfolio"
          />
        </section>
      </main>
    </div>
  );
}

function StatusCard({
  label,
  title,
  detail,
  href,
}: {
  label: string;
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <Surface className="flex h-full flex-col p-6">
      <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <h2 className="text-navy mt-3 text-xl font-semibold">{title}</h2>
      <p className="text-muted mt-3 flex-1 text-sm leading-6">{detail}</p>
      <ButtonLink
        href={href}
        variant="ghost"
        className="mt-5 justify-start px-0 hover:translate-y-0 hover:bg-transparent"
      >
        Open {label}
      </ButtonLink>
    </Surface>
  );
}
