import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getQuestById } from "@/modules/quest/infrastructure/quest-dal";

export const metadata: Metadata = {
  title: "Quest complete",
  robots: { index: false, follow: false },
};

export default async function QuestCompletePage({
  params,
}: {
  params: Promise<{ questId: string }>;
}) {
  const { questId } = await params;
  const detail = await getQuestById(questId);
  if (!detail) notFound();
  if (detail.quest.status !== "completed") redirect(`/quests/${detail.quest.id}`);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-panel p-7 text-center sm:p-12">
        <div aria-hidden="true" className="absolute inset-x-1/4 -top-32 h-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">HQLS loop complete</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Proof created. Progress earned.</h1>
          <p className="text-muted mx-auto mt-5 max-w-2xl text-lg leading-8">You acted, preserved honest evidence and reflected on what the experience taught you. That is real Builder progress.</p>
          <div className="mx-auto mt-8 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-gold/40 bg-gold/10"><span className="text-gold text-3xl font-semibold">+{detail.xpAwarded}</span><span className="text-muted text-xs tracking-wide uppercase">XP</span></div>
        </div>
      </section>
      <Surface className="mt-8 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">Quest {detail.quest.sequence_order} completed</p>
        <h2 className="mt-3 text-2xl font-semibold">{detail.quest.title}</h2>
        <p className="text-muted mt-4 leading-7">{detail.reflection?.nortnspoil_reflection}</p>
        <div className="border-border mt-6 border-t pt-6">
          {detail.nextQuest ? <><p className="text-muted text-sm">Next unlocked action</p><p className="mt-2 text-lg font-semibold">{detail.nextQuest.title}</p><ButtonLink href={`/quests/${detail.nextQuest.id}`} className="mt-5">Open Next Quest</ButtonLink></> : <><p className="text-muted leading-7">Review the Quest path to see whether the milestone is complete or the next milestone is ready.</p><ButtonLink href="/quests" className="mt-5">Review Quest Path</ButtonLink></>}
        </div>
      </Surface>
      <ButtonLink href="/app" variant="secondary" className="mt-6">Return to dashboard</ButtonLink>
    </main>
  );
}
