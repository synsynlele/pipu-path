import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  getQuestById,
  questStatusLabel,
} from "@/modules/quest/infrastructure/quest-dal";
import { QuestEvidenceForm } from "@/modules/quest/ui/quest-evidence-form";
import { QuestReflectionForm } from "@/modules/quest/ui/quest-reflection-form";
import { QuestStartForm } from "@/modules/quest/ui/quest-start-form";

export const metadata: Metadata = {
  title: "Quest focus",
  robots: { index: false, follow: false },
};

export default async function QuestFocusPage({
  params,
}: {
  params: Promise<{ questId: string }>;
}) {
  const { questId } = await params;
  const detail = await getQuestById(questId);
  if (!detail) notFound();
  if (detail.quest.status === "locked") redirect("/quests");

  const {
    quest,
    evidence,
    reflection,
    xpAwarded,
    milestone,
    journey,
    imageUrl,
  } = detail;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <ButtonLink href="/quests" variant="secondary">
        Back to Quest path
      </ButtonLink>
      <section className="border-gold/20 bg-panel relative mt-6 overflow-hidden rounded-[2rem] border p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
              Quest {quest.sequence_order} · Builder focus
            </p>
            <span className="border-gold/30 bg-gold/5 rounded-full border px-3 py-1.5 text-xs font-semibold">
              {questStatusLabel(quest.status)}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {quest.title}
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
            {quest.real_world_outcome}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="border-border bg-background rounded-full border px-3 py-1.5">
              About {quest.estimated_minutes} minutes
            </span>
            <span className="border-border bg-background text-gold rounded-full border px-3 py-1.5">
              +{quest.xp_value} verified XP
            </span>
            {milestone ? (
              <span className="border-border bg-background rounded-full border px-3 py-1.5">
                {milestone.title}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Surface className="p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Why this matters
            </p>
            <p className="text-muted mt-3 leading-8">{quest.why_it_matters}</p>
            <h2 className="mt-8 text-xl font-semibold">Your action steps</h2>
            <ol className="mt-5 grid gap-4">
              {quest.action_steps.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[2rem_1fr] items-start gap-3"
                >
                  <span className="border-gold/30 text-gold flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-muted pt-1 leading-7">{step}</p>
                </li>
              ))}
            </ol>
          </Surface>
          <Surface className="p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Proof standard
            </p>
            <h2 className="mt-3 text-xl font-semibold">
              What honest evidence should show
            </h2>
            <ul className="text-muted mt-4 grid gap-3 leading-7">
              {quest.evidence_requirements.map((requirement) => (
                <li key={requirement} className="flex gap-3">
                  <span aria-hidden="true" className="text-gold">
                    •
                  </span>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
            <div className="border-border mt-6 border-t pt-5">
              <h3 className="text-sm font-semibold">Completion criteria</h3>
              <p className="text-muted mt-2 leading-7">
                {quest.completion_criteria}
              </p>
            </div>
          </Surface>
        </div>
        <aside className="space-y-6">
          <Surface className="p-6">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Work with what you have
            </p>
            {quest.resources_needed.length > 0 ? (
              <>
                <h2 className="mt-3 text-sm font-semibold">Useful resources</h2>
                <ul className="text-muted mt-3 space-y-2 text-sm">
                  {quest.resources_needed.map((resource) => (
                    <li key={resource}>• {resource}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <h2 className="mt-5 text-sm font-semibold">
              Low-resource alternative
            </h2>
            <p className="text-muted mt-2 text-sm leading-6">
              {quest.low_resource_alternative}
            </p>
          </Surface>
          <Surface className="p-6">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Safety boundary
            </p>
            <p className="text-muted mt-3 text-sm leading-6">
              {quest.safety_guidance}
            </p>
          </Surface>
          {journey ? (
            <Surface className="p-6">
              <p className="text-muted text-xs tracking-wide uppercase">
                Active Journey
              </p>
              <p className="mt-2 font-semibold">{journey.title}</p>
            </Surface>
          ) : null}
        </aside>
      </section>

      <section className="mt-8">
        {quest.status === "available" ? (
          <Surface className="border-gold/30 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Ready to begin
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Start when you can give this Quest focused attention.
            </h2>
            <p className="text-muted mt-3 max-w-2xl leading-7">
              Starting saves this Quest as your one active action. Your state
              will survive refresh and sign-in recovery.
            </p>
            <div className="mt-6">
              <QuestStartForm questId={quest.id} />
            </div>
          </Surface>
        ) : null}
        {quest.status === "active" ? (
          <Surface className="border-gold/30 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Evidence
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Record what happened in the real world.
            </h2>
            <p className="text-muted mt-3 max-w-2xl leading-7">
              Evidence does not need to look impressive. It needs to be true,
              useful and connected to the action you actually took.
            </p>
            <QuestEvidenceForm questId={quest.id} today={today} />
          </Surface>
        ) : null}
        {quest.status === "evidence_submitted" && evidence ? (
          <div className="grid gap-6">
            <Surface className="p-6 sm:p-8">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Private evidence saved
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Your proof is ready for reflection.
              </h2>
              <p className="text-muted mt-5 leading-7 whitespace-pre-wrap">
                {evidence.evidence_text}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {evidence.evidence_link ? (
                  <a
                    href={evidence.evidence_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold text-sm font-semibold underline underline-offset-4"
                  >
                    Open evidence link
                  </a>
                ) : null}
                {imageUrl ? (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold text-sm font-semibold underline underline-offset-4"
                  >
                    View private evidence image
                  </a>
                ) : null}
              </div>
            </Surface>
            <Surface className="border-gold/30 p-6 sm:p-8">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Nortnspoil reflection
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Turn the experience into capability.
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-7">
                Reflection completes the HQLS loop. Your answers remain private
                and help you approach the next Quest with more clarity.
              </p>
              <QuestReflectionForm
                questId={quest.id}
                prompts={quest.reflection_prompts}
              />
            </Surface>
          </div>
        ) : null}
        {quest.status === "completed" && reflection ? (
          <Surface className="border-gold/30 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Quest completed
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  Proof created. Progress earned.
                </h2>
              </div>
              <span className="bg-gold rounded-full px-4 py-2 text-sm font-semibold text-[#100f0c]">
                +{xpAwarded} XP
              </span>
            </div>
            <p className="text-muted mt-5 leading-7">
              {reflection.nortnspoil_reflection}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={`/quests/${quest.id}/complete`}>
                View completion
              </ButtonLink>
              <ButtonLink href="/quests" variant="secondary">
                Return to Quest path
              </ButtonLink>
            </div>
          </Surface>
        ) : null}
      </section>
    </main>
  );
}
