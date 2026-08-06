import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { activateJourneyAction } from "@/modules/journey/application/journey-actions";
import { calculateJourneyProgress } from "@/modules/journey/domain/journey-contract";
import {
  getCurrentJourneyState,
  getJourneyContext,
} from "@/modules/journey/infrastructure/journey-dal";
import { JourneyContinuationForm } from "@/modules/journey/ui/journey-continuation-form";
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
      {journey.status === "active" || journey.status === "completed" ? (
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
  const continuationAttemptsRemaining = Math.max(
    0,
    3 - state.continuationAttempts,
  );
  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Your practical Builder Journey
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Turn your mission into continuing cycles of action.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        A Journey is not a one-time course. Each completed cycle remains in your
        history, and the next cycle builds on evidence from the one before it.
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
            Continue Current Milestone
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
            {state.draft.cycleNumber === 1 ? (
              <JourneyGenerationForm
                kind="regenerate"
                attemptsRemaining={attemptsRemaining}
              />
            ) : null}
          </div>
          {state.draft.cycleNumber === 1 ? (
            <JourneyRefinementForm
              journeyId={state.draft.id}
              attemptsRemaining={attemptsRemaining}
            />
          ) : null}
        </Surface>
      ) : state.latestCompleted ? (
        <>
          <Surface className="mt-10 p-6 sm:p-8">
            <p className="text-success text-xs font-semibold tracking-wide uppercase">
              Journey Cycle {state.latestCompleted.cycleNumber} complete
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {state.latestCompleted.title}
            </h2>
            <p className="text-muted mt-4 leading-7">
              This cycle remains part of your private history. Continue only when
              you are ready to deepen the same Mission through a stronger test.
            </p>
            <JourneyDetails journey={state.latestCompleted} />
          </Surface>
          <Surface className="mt-6 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold uppercase">
              Continue moving
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Build Journey Cycle {state.latestCompleted.cycleNumber + 1}
            </h2>
            <p className="text-muted mt-3 max-w-2xl leading-7">
              PipuPath will use your active Mission and completed Journey evidence
              to create a new cycle without erasing or repeating the previous one.
            </p>
            <div className="mt-6">
              <JourneyContinuationForm
                sourceJourneyId={state.latestCompleted.id}
                nextCycleNumber={state.latestCompleted.cycleNumber + 1}
                attemptsRemaining={continuationAttemptsRemaining}
              />
            </div>
          </Surface>
        </>
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
