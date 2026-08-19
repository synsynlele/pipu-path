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

type QuestStatus =
  | "available"
  | "active"
  | "evidence_submitted"
  | "completed";

const phases = ["Understand", "Act", "Prove", "Reflect", "Reveal"] as const;

function phaseState(status: QuestStatus, index: number) {
  if (status === "available") {
    return index === 0 ? "current" : "ahead";
  }
  if (status === "active") {
    if (index === 0) return "complete";
    if (index === 1) return "current";
    return "ahead";
  }
  if (status === "evidence_submitted") {
    if (index <= 2) return "complete";
    if (index === 3) return "current";
    return "ahead";
  }
  return "complete";
}

function QuestPhasePath({ status }: { status: QuestStatus }) {
  return (
    <ol className="mt-6 grid grid-cols-5 gap-1" aria-label="Quest phases">
      {phases.map((phase, index) => {
        const state = phaseState(status, index);
        return (
          <li key={phase} className="relative min-w-0 text-center">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={`absolute top-4 -left-1/2 h-px w-full ${state === "ahead" ? "bg-white/15" : "bg-[#f3c86b]/50"}`}
              />
            ) : null}
            <span
              className={`relative z-10 mx-auto grid size-8 place-items-center rounded-full border text-xs font-bold ${
                state === "complete"
                  ? "border-[#f3c86b]/40 bg-[#f3c86b]/15 text-[#f3c86b]"
                  : state === "current"
                    ? "border-white bg-white text-[#07142f] shadow-[0_0_0_5px_rgba(255,255,255,0.08)]"
                    : "border-white/15 bg-[#07142f] text-blue-100/45"
              }`}
              aria-label={`${phase}: ${state}`}
            >
              {state === "complete" ? "✓" : state === "current" ? "●" : "?"}
            </span>
            <span className={`mt-2 block truncate text-[0.58rem] font-semibold sm:text-xs ${state === "current" ? "text-white" : state === "complete" ? "text-[#f3c86b]" : "text-blue-100/45"}`}>
              {phase}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

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
  const status = quest.status as QuestStatus;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white sm:p-8 lg:p-9">
        <div aria-hidden="true" className="absolute -top-24 -right-16 size-64 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute right-10 -bottom-36 size-72 rounded-full bg-[#4f7cff]/18 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.17em] text-[#f3c86b] uppercase">
                Quest {quest.sequence_order} · Real-world challenge
              </p>
              {milestone ? (
                <p className="mt-1 text-xs text-blue-100/60">{milestone.title}</p>
              ) : null}
            </div>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-blue-50">
              {questStatusLabel(quest.status)}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {quest.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            {quest.real_world_outcome}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/12 px-3 py-1.5 text-blue-100">
              ≈ {quest.estimated_minutes} min
            </span>
            <span className="rounded-full border border-[#f3c86b]/25 bg-[#f3c86b]/8 px-3 py-1.5 font-semibold text-[#f3c86b]">
              +{quest.xp_value} verified XP
            </span>
            {journey ? (
              <span className="rounded-full border border-white/12 px-3 py-1.5 text-blue-100">
                {journey.title}
              </span>
            ) : null}
          </div>

          <QuestPhasePath status={status} />
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {quest.status === "available" ? (
            <Surface className="border-primary/25 p-5 sm:p-7">
              <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                Phase 1 · Understand
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                Know the challenge. Then leave the screen.
              </h2>
              <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                Read the action below, start when you are ready, and do the real work outside PipuPath.
              </p>
              <div className="mt-5">
                <QuestStartForm questId={quest.id} />
              </div>
            </Surface>
          ) : null}

          {quest.status === "active" ? (
            <Surface className="border-primary/25 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                    Phase 2 · Act
                  </p>
                  <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                    Do it in the real world. Bring back proof.
                  </h2>
                </div>
                <span className="border-gold/25 bg-gold/8 text-gold rounded-full border px-3 py-1.5 text-xs font-semibold">
                  Proof unlocks reflection
                </span>
              </div>
              <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                Evidence does not need to look impressive. It needs to be true and connected to what you actually did.
              </p>
              <QuestEvidenceForm questId={quest.id} today={today} />
            </Surface>
          ) : null}

          {quest.status === "evidence_submitted" && evidence ? (
            <>
              <Surface className="border-success/25 bg-success/5 p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-success text-xs font-semibold tracking-[0.15em] uppercase">
                      Proof secured
                    </p>
                    <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                      You acted. Now turn experience into capability.
                    </h2>
                  </div>
                  <span className="border-success/20 bg-success/10 text-success rounded-full border px-3 py-1.5 text-xs font-semibold">
                    Phase 4 · Reflect
                  </span>
                </div>
                <details className="border-border mt-5 rounded-2xl border p-4">
                  <summary className="text-navy cursor-pointer text-sm font-semibold">
                    Review the proof you submitted
                  </summary>
                  <p className="text-muted mt-3 text-sm leading-6 whitespace-pre-wrap">
                    {evidence.evidence_text}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {evidence.evidence_link ? (
                      <a
                        href={evidence.evidence_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-sm font-semibold underline underline-offset-4"
                      >
                        Open evidence link
                      </a>
                    ) : null}
                    {imageUrl ? (
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-sm font-semibold underline underline-offset-4"
                      >
                        View private evidence image
                      </a>
                    ) : null}
                  </div>
                </details>
              </Surface>

              <Surface className="border-gold/25 p-5 sm:p-7">
                <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase">
                  Nortnspoil · Learn & power up
                </p>
                <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                  What changed because you tried?
                </h2>
                <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                  Success and failure both contain useful data. Reflection completes the developmental loop.
                </p>
                <QuestReflectionForm
                  questId={quest.id}
                  prompts={quest.reflection_prompts}
                />
              </Surface>
            </>
          ) : null}

          {quest.status === "completed" && reflection ? (
            <Surface className="relative overflow-hidden border-gold/30 bg-gold/5 p-5 sm:p-8">
              <div aria-hidden="true" className="bg-gold/12 absolute -top-16 -right-16 size-48 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase">
                      Quest cleared · Reveal
                    </p>
                    <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
                      Proof created. Progress earned.
                    </h2>
                  </div>
                  <span className="bg-gold text-navy rounded-full px-4 py-2 text-sm font-bold">
                    +{xpAwarded} XP
                  </span>
                </div>
                <p className="text-muted mt-4 max-w-3xl text-sm leading-6">
                  {reflection.nortnspoil_reflection}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={`/quests/${quest.id}/complete`}>
                    See what unlocked →
                  </ButtonLink>
                  <ButtonLink href="/quests" variant="secondary">
                    Return to Quest path
                  </ButtonLink>
                </div>
              </div>
            </Surface>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Surface className="p-5 sm:p-6">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              The challenge
            </p>
            <h2 className="text-navy mt-2 text-lg font-semibold">Your action steps</h2>
            <ol className="mt-4 grid gap-3">
              {quest.action_steps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-xl border border-border p-3">
                  <span className="border-primary/25 bg-primary-soft text-primary grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold">
                    {index + 1}
                  </span>
                  <p className="text-muted pt-0.5 text-sm leading-5">{step}</p>
                </li>
              ))}
            </ol>
          </Surface>

          <details className="border-border bg-panel rounded-2xl border p-5">
            <summary className="text-navy cursor-pointer text-sm font-semibold">
              Why this matters
            </summary>
            <p className="text-muted mt-3 text-sm leading-6">{quest.why_it_matters}</p>
          </details>

          <details className="border-border bg-panel rounded-2xl border p-5">
            <summary className="text-navy cursor-pointer text-sm font-semibold">
              What counts as honest proof?
            </summary>
            <ul className="text-muted mt-3 grid gap-2 text-sm leading-6">
              {quest.evidence_requirements.map((requirement) => (
                <li key={requirement} className="flex gap-2">
                  <span aria-hidden="true" className="text-gold">•</span>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
            <div className="border-border mt-4 border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide">Completion signal</p>
              <p className="text-muted mt-2 text-sm leading-6">{quest.completion_criteria}</p>
            </div>
          </details>

          <details className="border-border bg-panel rounded-2xl border p-5">
            <summary className="text-navy cursor-pointer text-sm font-semibold">
              Resources and low-resource option
            </summary>
            {quest.resources_needed.length > 0 ? (
              <ul className="text-muted mt-3 grid gap-2 text-sm">
                {quest.resources_needed.map((resource) => (
                  <li key={resource}>• {resource}</li>
                ))}
              </ul>
            ) : null}
            <p className="text-muted mt-3 text-sm leading-6">
              <strong className="text-navy">If resources are tight:</strong>{" "}
              {quest.low_resource_alternative}
            </p>
          </details>

          <Surface className="border-error/15 bg-error/5 p-5">
            <p className="text-error text-xs font-semibold tracking-[0.14em] uppercase">
              Safety boundary
            </p>
            <p className="text-muted mt-2 text-sm leading-6">{quest.safety_guidance}</p>
          </Surface>
        </aside>
      </section>
    </main>
  );
}
