import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { calculateJourneyProgress } from "@/modules/journey/domain/journey-contract";
import { getCurrentJourneyState } from "@/modules/journey/infrastructure/journey-dal";
import { calculateQuestPackProgress } from "@/modules/quest/domain/quest-contract";
import {
  getCurrentQuestState,
  getQuestContext,
  questStatusLabel,
} from "@/modules/quest/infrastructure/quest-dal";
import { QuestGenerationForm } from "@/modules/quest/ui/quest-generation-form";

export const metadata: Metadata = {
  title: "HQLS Quests",
  robots: { index: false, follow: false },
};

export default async function QuestsPage() {
  const [journeyState, context] = await Promise.all([
    getCurrentJourneyState(),
    getQuestContext(),
  ]);
  const state = context
    ? await getCurrentQuestState(context.milestoneId)
    : null;
  const attemptsRemaining = state ? Math.max(0, 3 - state.attempts) : 0;
  const questProgress = state
    ? calculateQuestPackProgress(state.quests.map((quest) => quest.status))
    : 0;
  const journeyProgress = journeyState.active
    ? calculateJourneyProgress(
        journeyState.active.milestones.map((milestone) => milestone.status),
      )
    : 0;
  const currentQuest = state?.quests.find(
    (quest) =>
      quest.status === "available" ||
      quest.status === "active" ||
      quest.status === "evidence_submitted",
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-12 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-20 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-12 -bottom-36 size-72 rounded-full bg-[#4f7cff]/18 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Quest path · Real-world action
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {context?.milestoneTitle ?? "Your Journey creates the challenges."}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            {context
              ? "Clear one challenge at a time. Action creates proof; proof creates learning; learning opens what comes next."
              : "Activate a Journey first. PipuPath only creates Quests when there is a real milestone to move forward."}
          </p>
          {state ? (
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-blue-50">
                Journey {journeyProgress}%
              </span>
              <span className="rounded-full border border-[#f3c86b]/25 bg-[#f3c86b]/8 px-3 py-1.5 font-semibold text-[#f3c86b]">
                {state.totalXp} verified XP
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-blue-100">
                Milestone {questProgress}%
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {!journeyState.active || !context || !state ? (
        <Surface className="mt-6 p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Quest path locked
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold">
            Enter an active Journey first.
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            Quests grow from the current Journey milestone. PipuPath does not invent disconnected activities just to keep you busy.
          </p>
          <ButtonLink href="/journey" className="mt-5">
            Open Journey Map →
          </ButtonLink>
        </Surface>
      ) : state.quests.length === 0 ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Surface className="border-gold/30 bg-gold/5 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              New Quest chain
            </p>
            <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
              Shape three challenges for this chapter.
            </h2>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
              Quest 1 creates a useful result. Quest 2 tests and improves it. Quest 3 demonstrates stronger capability and clears the milestone.
            </p>
            <div className="mt-5">
              <QuestGenerationForm attemptsRemaining={attemptsRemaining} />
            </div>
          </Surface>
          <Surface className="p-5 sm:p-6">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Chapter outcome
            </p>
            <p className="text-navy mt-2 text-sm leading-6">
              {context.milestoneExpectedOutcome}
            </p>
            <p className="text-muted mt-4 text-xs font-semibold tracking-wide uppercase">
              Completion signal
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              {context.milestoneCompletionSignal}
            </p>
          </Surface>
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <Surface className="p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                    Three-Quest chain
                  </p>
                  <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                    The next challenge reveals itself through action.
                  </h2>
                </div>
                <span className="border-primary/15 bg-primary-soft text-primary rounded-full border px-3 py-1.5 text-xs font-semibold">
                  {questProgress}% cleared
                </span>
              </div>

              <ol className="mt-7 grid grid-cols-3 gap-2" aria-label="Quest chain">
                {state.quests.map((quest, index) => {
                  const completed = quest.status === "completed";
                  const current = quest.id === currentQuest?.id;
                  return (
                    <li key={quest.id} className="relative min-w-0">
                      {index > 0 ? (
                        <span
                          aria-hidden="true"
                          className={`absolute top-5 -left-1/2 h-px w-full ${completed || current ? "bg-primary/45" : "bg-border"}`}
                        />
                      ) : null}
                      <div className="relative z-10">
                        <span
                          className={`grid size-10 place-items-center rounded-full border text-xs font-bold ${
                            completed
                              ? "border-success/30 bg-success/10 text-success"
                              : current
                                ? "border-primary bg-primary text-white shadow-[0_0_0_5px_rgba(79,124,255,0.09)]"
                                : "border-border bg-background text-muted"
                          }`}
                          aria-label={`Quest ${quest.sequence_order}: ${questStatusLabel(quest.status)}`}
                        >
                          {completed ? "✓" : current ? "●" : "?"}
                        </span>
                        <p
                          className={`mt-3 text-[0.65rem] font-semibold tracking-wide uppercase ${current ? "text-primary" : completed ? "text-success" : "text-muted"}`}
                        >
                          Quest {quest.sequence_order}
                        </p>
                        <h3 className="text-navy mt-1 line-clamp-2 text-sm font-semibold leading-5">
                          {quest.title}
                        </h3>
                        <p className="text-muted mt-1 text-[0.68rem]">
                          {completed
                            ? "Cleared"
                            : current
                              ? questStatusLabel(quest.status)
                              : "Hidden until ready"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="bg-soft-blue mt-6 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-[width] motion-reduce:transition-none"
                  style={{ width: `${questProgress}%` }}
                />
              </div>

              {currentQuest ? (
                <div className="border-primary/20 bg-primary-soft/30 mt-6 rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                        Your challenge now
                      </p>
                      <h3 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                        {currentQuest.title}
                      </h3>
                    </div>
                    <span className="border-gold/25 bg-gold/8 text-gold rounded-full border px-3 py-1.5 text-xs font-semibold">
                      +{currentQuest.xp_value} XP
                    </span>
                  </div>
                  <p className="text-muted mt-3 text-sm leading-6">
                    {currentQuest.real_world_outcome}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <ButtonLink href={`/quests/${currentQuest.id}`}>
                      {currentQuest.status === "evidence_submitted"
                        ? "Reflect and Complete →"
                        : currentQuest.status === "active"
                          ? "Continue Challenge →"
                          : "Enter Challenge →"}
                    </ButtonLink>
                    <span className="text-muted text-xs">
                      ≈ {currentQuest.estimated_minutes} min
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-success/20 bg-success/5 mt-6 rounded-2xl border p-5">
                  <p className="text-success text-xs font-semibold tracking-[0.14em] uppercase">
                    Quest chain cleared
                  </p>
                  <h3 className="text-navy mt-2 text-xl font-semibold">
                    Check the Journey Map for the next chapter.
                  </h3>
                  <ButtonLink href="/journey" className="mt-4">
                    Open Journey Map →
                  </ButtonLink>
                </div>
              )}
            </Surface>

            <aside className="space-y-5">
              <Surface className="p-5 sm:p-6">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  What this chapter develops
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {context.capabilitiesToDevelop.map((capability) => (
                    <span
                      key={capability}
                      className="border-border bg-background rounded-full border px-3 py-1.5 text-xs font-semibold"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
                <details className="border-border mt-5 border-t pt-4">
                  <summary className="text-navy cursor-pointer text-sm font-semibold">
                    Chapter outcome and completion signal
                  </summary>
                  <p className="text-muted mt-3 text-sm leading-6">
                    {context.milestoneExpectedOutcome}
                  </p>
                  <p className="text-muted mt-3 text-xs font-semibold uppercase">
                    Completion signal
                  </p>
                  <p className="text-muted mt-2 text-sm leading-6">
                    {context.milestoneCompletionSignal}
                  </p>
                </details>
              </Surface>

              <Surface className="p-5 sm:p-6">
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  The PipuPath rule
                </p>
                <p className="text-muted mt-2 text-sm leading-6">
                  Do something real → bring back proof → reflect → let the saved evidence decide what opens next.
                </p>
              </Surface>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}
