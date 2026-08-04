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
  const state = context ? await getCurrentQuestState(context.milestoneId) : null;
  const attemptsRemaining = state ? Math.max(0, 3 - state.attempts) : 0;
  const questProgress = state
    ? calculateQuestPackProgress(state.quests.map((quest) => quest.status))
    : 0;
  const journeyProgress = journeyState.active
    ? calculateJourneyProgress(
        journeyState.active.milestones.map((milestone) => milestone.status),
      )
    : 0;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-panel px-6 py-10 sm:px-10 sm:py-14">
        <div aria-hidden="true" className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">HQLS Quest Lab</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Build proof, not just plans.</h1>
        <p className="text-muted mt-5 max-w-2xl text-lg leading-8">Take one focused real-world action, record honest evidence, reflect deeply and use what you learn to improve the next action.</p>
      </section>

      {!journeyState.active || !context || !state ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">Journey required</p>
          <h2 className="mt-3 text-2xl font-semibold">Activate your Builder Journey first.</h2>
          <p className="text-muted mt-3 max-w-2xl leading-7">Quests come from the first available milestone in your active Journey. PipuPath will not invent activity before that pathway is ready.</p>
          <ButtonLink href="/journey" className="mt-6">Open My Journey</ButtonLink>
        </Surface>
      ) : (
        <>
          <section aria-label="Builder progress" className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Journey progress", `${journeyProgress}%`, "Completed milestones only"],
              ["Current milestone", `${questProgress}%`, "Completed Quests only"],
              ["Verified XP", `${state.totalXp}`, "Awarded once per Quest"],
            ].map(([label, value, detail]) => (
              <Surface key={label} className="p-5">
                <p className="text-muted text-xs tracking-wide uppercase">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
                <p className="text-muted mt-2 text-xs">{detail}</p>
              </Surface>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <Surface className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-gold text-xs font-semibold tracking-wide uppercase">Current milestone</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">{context.milestoneTitle}</h2></div>
                <span className="border-border bg-background rounded-full border px-3 py-1.5 text-xs font-semibold">{context.capabilitiesToDevelop.join(" · ")}</span>
              </div>
              <p className="text-muted mt-4 leading-7">{context.milestonePurpose}</p>
              <div className="mt-6"><div className="flex justify-between gap-4 text-xs"><span className="text-muted">Quest-pack progress</span><span className="font-semibold">{questProgress}%</span></div><div className="bg-background mt-2 h-2 overflow-hidden rounded-full"><div className="bg-gold h-full rounded-full transition-[width]" style={{ width: `${questProgress}%` }} /></div></div>

              {state.quests.length === 0 ? (
                <div className="border-gold/20 bg-gold/5 mt-8 rounded-2xl border p-5 sm:p-6">
                  <h3 className="text-xl font-semibold">Shape three practical Quests</h3>
                  <p className="text-muted mt-3 leading-7">Quest 1 creates a small useful result. Quest 2 tests and improves it. Quest 3 demonstrates stronger capability and completes this milestone.</p>
                  <div className="mt-6"><QuestGenerationForm attemptsRemaining={attemptsRemaining} /></div>
                </div>
              ) : (
                <ol className="mt-8 grid gap-4">
                  {state.quests.map((quest) => (
                    <li key={quest.id} className="border-border bg-background/40 rounded-2xl border p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-gold text-xs font-semibold tracking-wide uppercase">Quest {quest.sequence_order}</p><span className="border-border rounded-full border px-2.5 py-1 text-xs">{questStatusLabel(quest.status)}</span></div>
                      <h3 className="mt-3 text-xl font-semibold">{quest.title}</h3>
                      <p className="text-muted mt-2 leading-7">{quest.real_world_outcome}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs"><span className="text-muted">About {quest.estimated_minutes} minutes</span><span className="text-gold">+{quest.xp_value} XP</span></div>
                      {quest.status === "locked" ? <p className="text-muted mt-4 text-sm">Complete the previous Quest to unlock this action.</p> : <ButtonLink href={`/quests/${quest.id}`} variant={quest.status === "completed" ? "secondary" : "primary"} className="mt-5">{quest.status === "completed" ? "Review Quest" : quest.status === "evidence_submitted" ? "Complete Reflection" : quest.status === "active" ? "Continue Quest" : "Open Quest"}</ButtonLink>}
                    </li>
                  ))}
                </ol>
              )}
            </Surface>
            <aside className="space-y-6">
              <Surface className="p-6"><p className="text-gold text-xs font-semibold tracking-wide uppercase">Milestone outcome</p><p className="text-muted mt-3 leading-7">{context.milestoneExpectedOutcome}</p><h3 className="mt-5 text-sm font-semibold">Honest completion signal</h3><p className="text-muted mt-2 text-sm leading-6">{context.milestoneCompletionSignal}</p></Surface>
              <Surface className="p-6"><p className="text-gold text-xs font-semibold tracking-wide uppercase">HQLS loop</p><ol className="text-muted mt-4 space-y-3 text-sm"><li>1. Plan one useful action</li><li>2. Act in the real world</li><li>3. Preserve honest evidence</li><li>4. Reflect with Nortnspoil</li><li>5. Adapt the next action</li></ol></Surface>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}
