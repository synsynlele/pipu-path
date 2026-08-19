import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  getCurrentQuestState,
  getQuestById,
} from "@/modules/quest/infrastructure/quest-dal";
import { QuestEvidenceForm } from "@/modules/quest/ui/quest-evidence-form";

export const metadata: Metadata = {
  title: "Submit Quest proof",
  robots: { index: false, follow: false },
};

const phases = ["Understand", "Act", "Prove", "Reflect", "Reveal"] as const;

function proofDestination(status: string, questId: string) {
  return status === "active" ? `/quests/${questId}/proof` : `/quests/${questId}`;
}

export default async function QuestProofPage({
  params,
}: {
  params: Promise<{ questId: string }>;
}) {
  const { questId } = await params;
  const detail = await getQuestById(questId);

  if (!detail) {
    const state = await getCurrentQuestState();
    const current = state.active ?? state.available;

    if (current && current.id !== questId) {
      redirect(proofDestination(current.status, current.id));
    }
    redirect("/quests");
  }

  const { quest, milestone, journey } = detail;

  if (quest.status === "locked") redirect("/quests");
  if (quest.status !== "active") redirect(`/quests/${quest.id}`);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white shadow-[0_30px_90px_-52px_rgba(79,124,255,0.9)] sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-8 -bottom-40 size-80 rounded-full bg-[#4f7cff]/20 blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
                Phase 3 · Prove
              </p>
              <p className="mt-1 text-xs text-blue-100/65">
                {journey?.title ?? "Your active Journey"}
                {milestone?.title ? ` · ${milestone.title}` : ""}
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              Private by default
            </span>
          </div>

          <div className="mt-7 max-w-4xl">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Bring back what happened.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
              You already left the screen and acted. Now capture enough honest
              proof for PipuPath to remember the attempt and unlock reflection.
            </p>
          </div>

          <div className="mt-7 rounded-[1.6rem] border border-white/12 bg-white/7 p-4 backdrop-blur-sm sm:p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-blue-200 uppercase">
              Current challenge
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              {quest.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/70">
              {quest.real_world_outcome}
            </p>
          </div>

          <ol className="mt-7 grid grid-cols-5 gap-1" aria-label="Quest phases">
            {phases.map((phase, index) => {
              const complete = index < 2;
              const current = index === 2;
              return (
                <li key={phase} className="relative min-w-0 text-center">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className={`absolute top-4 -left-1/2 h-px w-full ${complete || current ? "bg-[#f3c86b]/45" : "bg-white/15"}`}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 mx-auto grid size-8 place-items-center rounded-full border text-xs font-bold ${
                      complete
                        ? "border-[#f3c86b]/40 bg-[#f3c86b]/15 text-[#f3c86b]"
                        : current
                          ? "border-white bg-white text-[#07142f] shadow-[0_0_0_5px_rgba(255,255,255,0.08)]"
                          : "border-white/15 bg-[#07142f] text-blue-100/45"
                    }`}
                    aria-label={`${phase}: ${complete ? "complete" : current ? "current" : "ahead"}`}
                  >
                    {complete ? "✓" : current ? "●" : "?"}
                  </span>
                  <span
                    className={`mt-2 block truncate text-[0.58rem] font-semibold sm:text-xs ${
                      current
                        ? "text-white"
                        : complete
                          ? "text-[#f3c86b]"
                          : "text-blue-100/45"
                    }`}
                  >
                    {phase}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Surface className="overflow-hidden p-0">
          <div className="border-border border-b p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                  Proof of action
                </p>
                <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Show the action, not perfection.
                </h2>
              </div>
              <span className="border-primary/15 bg-primary-soft text-primary rounded-full border px-3 py-1.5 text-xs font-semibold">
                +{quest.xp_value} XP after reflection
              </span>
            </div>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
              A short truthful description is the core proof. Add a link or
              image only when it genuinely helps verify what you did.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <QuestEvidenceForm questId={quest.id} today={today} />
          </div>
        </Surface>

        <aside className="space-y-5">
          <Surface className="p-5 sm:p-6">
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              What counts as honest proof?
            </p>
            <ul className="mt-4 grid gap-3">
              {quest.evidence_requirements.map((requirement, index) => (
                <li
                  key={requirement}
                  className="border-border flex gap-3 rounded-2xl border p-3.5"
                >
                  <span className="border-gold/25 bg-gold/8 text-gold grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-muted pt-0.5 text-sm leading-5">
                    {requirement}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-border mt-5 border-t pt-4">
              <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                Completion signal
              </p>
              <p className="text-navy mt-2 text-sm leading-6">
                {quest.completion_criteria}
              </p>
            </div>
          </Surface>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#07142f] p-5 text-white sm:p-6">
            <div
              aria-hidden="true"
              className="absolute -right-12 -bottom-16 size-40 rounded-full bg-[#f3c86b]/10 blur-3xl"
            />
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#f3c86b] uppercase">
                What happens next
              </p>
              <ol className="mt-4 grid gap-4 text-sm text-blue-50/75">
                <li className="flex gap-3">
                  <span className="font-mono text-[#f3c86b]">01</span>
                  <span>Your proof is stored privately.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[#f3c86b]">02</span>
                  <span>Reflection unlocks immediately.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[#f3c86b]">03</span>
                  <span>
                    Progress is earned only after you reflect and clear the
                    Quest.
                  </span>
                </li>
              </ol>
            </div>
          </div>

          <Surface className="p-5 sm:p-6">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Your privacy
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              Quest proof is private developmental evidence. Nothing here is
              published to your Builder Vault, profile or public proof page
              automatically.
            </p>
            <ButtonLink
              href={`/quests/${quest.id}`}
              variant="secondary"
              className="mt-4"
            >
              Back to Quest
            </ButtonLink>
          </Surface>
        </aside>
      </section>
    </main>
  );
}
