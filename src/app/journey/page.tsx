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
type DisplayJourney = NonNullable<
  Awaited<ReturnType<typeof getCurrentJourneyState>>["draft"]
>;

function JourneyDetails({ journey }: { journey: DisplayJourney }) {
  const progress = calculateJourneyProgress(
    journey.milestones.map((milestone) => milestone.status),
  );
  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-gold text-xs font-semibold tracking-wide uppercase">
            Target Outcome
          </h3>
          <p className="text-muted mt-2 leading-7">{journey.target_outcome}</p>
        </div>
        <div>
          <h3 className="text-gold text-xs font-semibold tracking-wide uppercase">
            Suggested Duration
          </h3>
          <p className="text-muted mt-2 leading-7">
            {durationLabels[journey.suggested_duration]}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-gold text-xs font-semibold tracking-wide uppercase">
          Journey Summary
        </h3>
        <p className="text-muted mt-2 leading-7">{journey.summary}</p>
      </div>
      {journey.status === "active" ? (
        <p className="mt-5 text-sm font-semibold">Progress: {progress}%</p>
      ) : null}
      <ol className="mt-8 grid gap-5">
        {journey.milestones.map((milestone) => (
          <li
            key={milestone.id}
            className="border-border rounded-2xl border p-5"
          >
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Milestone {milestone.sequence_order} · {milestone.status}
            </p>
            <h3 className="mt-2 text-xl font-semibold">{milestone.title}</h3>
            <p className="text-muted mt-3 leading-7">{milestone.purpose}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Expected outcome</dt>
                <dd className="text-muted mt-1">
                  {milestone.expected_outcome}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Suggested duration</dt>
                <dd className="text-muted mt-1">
                  {milestone.suggested_duration}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Completion signal</dt>
                <dd className="text-muted mt-1">
                  {milestone.completion_signal}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Resource note</dt>
                <dd className="text-muted mt-1">{milestone.resource_note}</dd>
              </div>
            </dl>
            <p className="text-muted mt-4 text-sm">
              Capabilities: {milestone.capabilities_to_develop.join(", ")}
            </p>
          </li>
        ))}
      </ol>
    </>
  );
}

export default async function JourneyPage() {
  const context = await getJourneyContext();
  const state = await getCurrentJourneyState(context?.missionId);
  const attemptsRemaining = Math.max(0, 3 - state.attempts);
  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Your practical Builder Journey
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Turn your mission into milestones.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        Your Journey is a flexible pathway, not a fixed future. It shows the
        major milestones to test your direction with real action.
      </p>
      {!context ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">
            Your active mission comes first
          </h2>
          <p className="text-muted mt-3 leading-7">
            Generate and accept one practical mission before building a Journey.
          </p>
          <ButtonLink href="/mission" className="mt-6">
            Open my mission
          </ButtonLink>
        </Surface>
      ) : state.active ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Active Journey · Cycle {state.active.cycleNumber}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {state.active.title}
          </h2>
          <JourneyDetails journey={state.active} />
          <ButtonLink href="/journey/complete" className="mt-8">
            Start First Milestone
          </ButtonLink>
        </Surface>
      ) : state.draft ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Journey Review · Cycle {state.draft.cycleNumber}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {state.draft.title}
          </h2>
          <JourneyDetails journey={state.draft} />
          <div className="mt-8 flex flex-wrap gap-3">
            <form action={activateJourneyAction}>
              <input type="hidden" name="journeyId" value={state.draft.id} />
              <Button type="submit">Accept Journey</Button>
            </form>
            <JourneyGenerationForm
              kind="regenerate"
              attemptsRemaining={attemptsRemaining}
            />
          </div>
          <JourneyRefinementForm
            journeyId={state.draft.id}
            attemptsRemaining={attemptsRemaining}
          />
        </Surface>
      ) : state.completed ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Completed Journey · Cycle {state.completed.cycleNumber}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {state.completed.title}
          </h2>
          <p className="text-muted mt-4 max-w-2xl leading-7">
            This Journey is now evidence, not an ending. Your next cycle should
            deepen what worked, correct what failed and convert learning into a
            stronger repeatable result.
          </p>
          {state.continuationAvailable ? (
            <div className="border-gold/30 bg-gold/5 mt-7 rounded-2xl border p-5">
              <h3 className="text-xl font-semibold">
                Build growth cycle {state.nextCycleNumber}
              </h3>
              <p className="text-muted mt-2 leading-7">
                Your completed Project unlocks a fresh three-attempt Journey
                budget. The new Journey will build on the previous cycle rather
                than restart your development.
              </p>
              <div className="mt-5">
                <JourneyGenerationForm
                  kind="continue"
                  attemptsRemaining={attemptsRemaining}
                  sourceJourneyId={state.completed.id}
                />
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <p className="text-muted leading-7">
                Complete one Builder Project from this Journey before opening
                the next growth cycle.
              </p>
              <ButtonLink href="/projects" className="mt-5">
                Continue Builder Project
              </ButtonLink>
            </div>
          )}
        </Surface>
      ) : (
        <Surface className="mt-10 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">
            Your mission is ready for a pathway
          </h2>
          <p className="text-muted mt-3 max-w-2xl leading-7">
            PipuPath can shape four to six practical milestones from your active
            mission.
          </p>
          <div className="mt-7">
            <JourneyGenerationForm
              kind="initial"
              attemptsRemaining={attemptsRemaining}
            />
          </div>
        </Surface>
      )}
    </main>
  );
}
