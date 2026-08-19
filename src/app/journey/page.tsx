import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { activateJourneyAction } from "@/modules/journey/application/journey-actions";
import { calculateJourneyProgress } from "@/modules/journey/domain/journey-contract";
import {
  getCurrentJourneyState,
  getJourneyContext,
} from "@/modules/journey/infrastructure/journey-dal";
import { JourneyGenerationForm } from "@/modules/journey/ui/journey-generation-form";
import { JourneyRefinementForm } from "@/modules/journey/ui/journey-refinement-form";

export const metadata: Metadata = {
  title: "My Builder Journey",
  robots: { index: false, follow: false },
};

const durationLabels = {
  two_weeks: "Two weeks",
  four_weeks: "Four weeks",
  six_weeks: "Six weeks",
  eight_weeks: "Eight weeks",
  twelve_weeks: "Twelve weeks",
};

const pathwayPhases = ["Learn", "Practice", "Build", "Test"] as const;

type DisplayJourney = NonNullable<
  Awaited<ReturnType<typeof getCurrentJourneyState>>["draft"]
>;

type DisplayMilestone = DisplayJourney["milestones"][number];

function isThirtyDayJourney(journey: DisplayJourney | null) {
  if (!journey) return false;
  if (
    journey.suggested_duration !== "four_weeks" ||
    journey.milestones.length !== 4
  ) {
    return false;
  }
  return journey.milestones.every((milestone, index) => {
    const title = milestone.title.toLowerCase();
    return (
      title.includes(`week ${index + 1}`) &&
      title.includes(pathwayPhases[index].toLowerCase())
    );
  });
}

function milestonePhase(milestone: DisplayMilestone, isThirtyDayPathway: boolean) {
  if (!isThirtyDayPathway) return `Milestone ${milestone.sequence_order}`;
  return `Week ${milestone.sequence_order} · ${pathwayPhases[milestone.sequence_order - 1] ?? "Build"}`;
}

function milestoneStateLabel(status: DisplayMilestone["status"]) {
  if (status === "completed") return "Cleared";
  if (status === "active") return "You are here";
  if (status === "available") return "Ready";
  return "Locked";
}

function JourneyMap({
  journey,
  isThirtyDayPathway,
}: {
  journey: DisplayJourney;
  isThirtyDayPathway: boolean;
}) {
  const progress = calculateJourneyProgress(
    journey.milestones.map((milestone) => milestone.status),
  );
  const currentMilestone =
    journey.milestones.find((milestone) => milestone.status === "active") ??
    journey.milestones.find((milestone) => milestone.status === "available") ??
    null;

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
            Adventure map
          </p>
          <p className="text-navy mt-1 text-sm font-semibold">
            {journey.status === "draft"
              ? "Preview the route before you enter it."
              : currentMilestone
                ? `${milestonePhase(currentMilestone, isThirtyDayPathway)} is your current chapter.`
                : "This route has been completed."}
          </p>
        </div>
        <span className="border-primary/15 bg-primary-soft text-primary rounded-full border px-3 py-1.5 text-xs font-semibold">
          {progress}% complete
        </span>
      </div>

      <div
        className="mt-5 overflow-x-auto pb-3 [scrollbar-width:thin]"
        aria-label="Journey milestone map"
      >
        <ol className="flex min-w-max items-stretch gap-0 pr-5">
          {journey.milestones.map((milestone, index) => {
            const completed = milestone.status === "completed";
            const current =
              milestone.status === "active" || milestone.status === "available";
            return (
              <li key={milestone.id} className="relative flex w-48 shrink-0 flex-col sm:w-56">
                <div className="flex items-center">
                  <div
                    className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${
                      completed
                        ? "border-success bg-success/10 text-success"
                        : current
                          ? "border-primary bg-primary text-white shadow-[0_0_0_6px_rgba(79,124,255,0.09)]"
                          : "border-border bg-background text-muted"
                    }`}
                    aria-label={`${milestonePhase(milestone, isThirtyDayPathway)}: ${milestoneStateLabel(milestone.status)}`}
                  >
                    {completed ? "✓" : current ? "●" : "?"}
                  </div>
                  {index < journey.milestones.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className={`h-0.5 flex-1 ${completed ? "bg-success/45" : current ? "bg-primary/35" : "bg-border"}`}
                    />
                  ) : null}
                </div>
                <div className="mt-3 pr-5">
                  <p className={`text-[0.68rem] font-semibold tracking-wide uppercase ${current ? "text-primary" : completed ? "text-success" : "text-muted"}`}>
                    {milestoneStateLabel(milestone.status)}
                  </p>
                  <h3 className="text-navy mt-1 line-clamp-2 text-sm font-semibold leading-5">
                    {milestone.title}
                  </h3>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="bg-soft-blue mt-2 h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-[width] motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function JourneyDetails({
  journey,
  isThirtyDayPathway,
}: {
  journey: DisplayJourney;
  isThirtyDayPathway: boolean;
}) {
  const currentMilestone =
    journey.milestones.find((milestone) => milestone.status === "active") ??
    journey.milestones.find((milestone) => milestone.status === "available") ??
    journey.milestones[0] ??
    null;

  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="border-border bg-background rounded-full border px-3 py-1.5 text-xs font-semibold">
          {durationLabels[journey.suggested_duration]}
        </span>
        <span className="border-border bg-background rounded-full border px-3 py-1.5 text-xs font-semibold">
          {journey.milestones.length} chapters
        </span>
        <span className="border-border bg-background rounded-full border px-3 py-1.5 text-xs font-semibold capitalize">
          {journey.status}
        </span>
      </div>

      <JourneyMap journey={journey} isThirtyDayPathway={isThirtyDayPathway} />

      {currentMilestone ? (
        <div className="border-primary/20 bg-primary-soft/35 mt-6 rounded-2xl border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                {journey.status === "draft" ? "First chapter" : "Current chapter"}
              </p>
              <h3 className="text-navy mt-2 text-xl font-semibold">
                {currentMilestone.title}
              </h3>
            </div>
            <span className="text-muted text-xs font-semibold">
              {milestonePhase(currentMilestone, isThirtyDayPathway)}
            </span>
          </div>
          <p className="text-muted mt-3 text-sm leading-6">
            {currentMilestone.expected_outcome}
          </p>
          {currentMilestone.capabilities_to_develop.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {currentMilestone.capabilities_to_develop.map((capability) => (
                <span
                  key={capability}
                  className="border-border bg-background rounded-full border px-2.5 py-1 text-xs"
                >
                  {capability}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <details className="border-border mt-5 rounded-2xl border p-4 open:bg-background/40">
        <summary className="text-navy cursor-pointer text-sm font-semibold">
          Why this route and what each chapter means
        </summary>
        <div className="mt-4 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-gold text-xs font-semibold tracking-wide uppercase">
                Target outcome
              </h3>
              <p className="text-muted mt-2 text-sm leading-6">{journey.target_outcome}</p>
            </div>
            <div>
              <h3 className="text-gold text-xs font-semibold tracking-wide uppercase">
                Route summary
              </h3>
              <p className="text-muted mt-2 text-sm leading-6">{journey.summary}</p>
            </div>
          </div>
          <ol className="grid gap-3">
            {journey.milestones.map((milestone) => (
              <li key={milestone.id} className="border-border rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                    {milestonePhase(milestone, isThirtyDayPathway)}
                  </p>
                  <span className="text-muted text-xs">{milestone.suggested_duration}</span>
                </div>
                <h4 className="text-navy mt-2 font-semibold">{milestone.title}</h4>
                <p className="text-muted mt-2 text-sm leading-6">{milestone.purpose}</p>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <p><strong>Completion:</strong> <span className="text-muted">{milestone.completion_signal}</span></p>
                  <p><strong>Resources:</strong> <span className="text-muted">{milestone.resource_note}</span></p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </>
  );
}

export default async function JourneyPage() {
  const context = await getJourneyContext();
  const state = await getCurrentJourneyState(context?.missionId);
  const attemptsRemaining = Math.max(0, 3 - state.attempts);
  const existingJourney = state.active ?? state.draft ?? state.completed;
  const isThirtyDayPathway = existingJourney
    ? isThirtyDayJourney(existingJourney)
    : Boolean(context?.selectedPath);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-12 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white sm:p-9">
        <div aria-hidden="true" className="absolute -top-28 -right-20 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute right-12 -bottom-32 size-72 rounded-full bg-[#4f7cff]/18 blur-3xl" />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Journey · Adventure map
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {existingJourney?.title ??
              (isThirtyDayPathway
                ? "Your next 30 days are waiting to be mapped."
                : "Turn your Mission into a route you can actually travel.")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            {existingJourney
              ? "Each chapter exists to move you into real action. Clear what is in front of you; the rest unfolds as you build evidence."
              : "PipuPath will turn your active Mission into practical chapters. The map is a direction—not a prediction of your future."}
          </p>
        </div>
      </section>

      {!context ? (
        <Surface className="mt-6 p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">Before the map</p>
          <h2 className="text-navy mt-2 text-2xl font-semibold">Choose the Campaign first.</h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            Your Mission gives the Journey a destination. Activate one practical direction before opening the map.
          </p>
          <ButtonLink href="/mission" className="mt-5">Open my Mission</ButtonLink>
        </Surface>
      ) : state.active ? (
        <Surface className="mt-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Active Journey · Cycle {state.active.cycleNumber}
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Keep moving. One chapter at a time.
              </h2>
            </div>
            <span className="border-success/20 bg-success/10 text-success rounded-full border px-3 py-1.5 text-xs font-semibold">
              In progress
            </span>
          </div>
          <JourneyDetails journey={state.active} isThirtyDayPathway={isThirtyDayPathway} />
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/quests">Enter Current Quest →</ButtonLink>
            <ButtonLink href="/build" variant="secondary">Open Build</ButtonLink>
          </div>
        </Surface>
      ) : state.draft ? (
        <Surface className="mt-6 p-5 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Route preview · Cycle {state.draft.cycleNumber}
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Look at the map. Then decide to enter.
          </h2>
          <JourneyDetails journey={state.draft} isThirtyDayPathway={isThirtyDayPathway} />
          <div className="mt-6 flex flex-wrap gap-3">
            <form action={activateJourneyAction}>
              <input type="hidden" name="journeyId" value={state.draft.id} />
              <Button type="submit">
                {isThirtyDayPathway ? "Enter 30-Day Adventure" : "Enter this Journey"}
              </Button>
            </form>
            <JourneyGenerationForm kind="regenerate" attemptsRemaining={attemptsRemaining} />
          </div>
          <details className="border-border mt-5 rounded-2xl border p-4">
            <summary className="text-navy cursor-pointer text-sm font-semibold">
              Want to adjust the route?
            </summary>
            <div className="mt-4">
              <JourneyRefinementForm
                journeyId={state.draft.id}
                attemptsRemaining={attemptsRemaining}
              />
            </div>
          </details>
        </Surface>
      ) : state.completed ? (
        <Surface className="mt-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-success text-xs font-semibold tracking-wide uppercase">
                Journey cleared · Cycle {state.completed.cycleNumber}
              </p>
              <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
                You have evidence from this route now.
              </h2>
            </div>
            <span className="border-success/20 bg-success/10 text-success rounded-full border px-3 py-1.5 text-xs font-semibold">Completed</span>
          </div>
          <JourneyDetails journey={state.completed} isThirtyDayPathway={isThirtyDayPathway} />
          {state.continuationAvailable ? (
            <div className="border-gold/30 bg-gold/5 mt-6 rounded-2xl border p-5">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">Next route available</p>
              <h3 className="text-navy mt-2 text-xl font-semibold">Open growth cycle {state.nextCycleNumber}</h3>
              <p className="text-muted mt-2 text-sm leading-6">
                The next Journey builds on what actually happened here. It does not erase your previous evidence.
              </p>
              <div className="mt-4">
                <JourneyGenerationForm
                  kind="continue"
                  attemptsRemaining={attemptsRemaining}
                  sourceJourneyId={state.completed.id}
                />
              </div>
            </div>
          ) : (
            <div className="border-border mt-6 rounded-2xl border p-5">
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">One major Build remains</p>
              <h3 className="text-navy mt-2 text-xl font-semibold">Turn this Journey into something useful.</h3>
              <ButtonLink href="/projects" className="mt-4">Continue Builder Project</ButtonLink>
            </div>
          )}
        </Surface>
      ) : (
        <Surface className="mt-6 p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">Map generation</p>
          <h2 className="text-navy mt-2 text-2xl font-semibold">
            {isThirtyDayPathway
              ? `Map a 30-Day ${context.selectedPath?.pathName ?? "Builder"} Adventure`
              : "Your Mission is ready to become a Journey."}
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            {isThirtyDayPathway
              ? "Four evidence-based chapters: Learn, Practice, Build and Test."
              : "PipuPath will shape practical milestones from your active Mission, then Quests will turn each one into action."}
          </p>
          <div className="mt-5">
            <JourneyGenerationForm kind="initial" attemptsRemaining={attemptsRemaining} />
          </div>
        </Surface>
      )}
    </main>
  );
}
