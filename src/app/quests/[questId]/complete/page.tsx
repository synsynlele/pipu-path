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
  if (detail.quest.status !== "completed") {
    redirect(`/quests/${detail.quest.id}`);
  }

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-4 py-7 sm:px-8 sm:py-14"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-[#f3c86b]/25 bg-[#07142f] p-6 text-white sm:p-10">
        <div
          aria-hidden="true"
          className="absolute inset-x-1/4 -top-28 h-56 rounded-full bg-[#f3c86b]/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 -bottom-24 size-64 rounded-full border border-white/10"
        />
        <div className="relative text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#f3c86b] uppercase">
            Quest cleared · Reveal
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            You did more than finish a screen.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-50/75 sm:text-base">
            You acted in the real world, preserved proof and turned the
            experience into learning. That is Builder progress.
          </p>

          <div className="mx-auto mt-7 grid size-28 place-items-center rounded-full border border-[#f3c86b]/35 bg-[#f3c86b]/10 shadow-[0_0_50px_-20px_rgba(243,200,107,0.9)]">
            <div>
              <span className="block text-3xl font-bold text-[#f3c86b]">
                +{detail.xpAwarded}
              </span>
              <span className="mt-1 block text-[0.65rem] font-semibold tracking-[0.16em] text-blue-100/65 uppercase">
                verified XP
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
        <Surface className="p-5 sm:p-6">
          <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
            What you just cleared
          </p>
          <h2 className="text-navy mt-2 text-xl font-semibold">
            {detail.quest.title}
          </h2>
          {detail.reflection?.nortnspoil_reflection ? (
            <p className="text-muted mt-3 text-sm leading-6">
              {detail.reflection.nortnspoil_reflection}
            </p>
          ) : null}
        </Surface>

        <Surface
          className={`p-5 sm:p-7 ${detail.nextQuest ? "border-primary/25 bg-primary-soft/25" : ""}`}
        >
          {detail.nextQuest ? (
            <>
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                New challenge unlocked
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {detail.nextQuest.title}
              </h2>
              <p className="text-muted mt-3 text-sm leading-6">
                Your evidence from the last Quest opened the next real-world
                action. You can enter it now or return later from your Adventure
                Home.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href={`/quests/${detail.nextQuest.id}`}>
                  Enter Next Quest →
                </ButtonLink>
                <ButtonLink href="/app" variant="secondary">
                  Return Home
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <p className="text-success text-xs font-semibold tracking-[0.16em] uppercase">
                Chapter checkpoint reached
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                Check the map for what opened next.
              </h2>
              <p className="text-muted mt-3 text-sm leading-6">
                The current milestone may now be complete, or the next milestone
                may be ready. PipuPath will only show progress the saved state
                can prove.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/quests">Review Quest Path</ButtonLink>
                <ButtonLink href="/journey" variant="secondary">
                  Open Journey Map
                </ButtonLink>
              </div>
            </>
          )}
        </Surface>
      </section>
    </main>
  );
}
