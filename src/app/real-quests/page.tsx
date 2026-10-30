import type { Metadata } from "next";
import Link from "next/link";
import { cityInspiration } from "@/modules/city/domain/city-inspiration";
import { cityQuestHandoff } from "@/modules/city/domain/city-quest-handoff";
import { getBuildHome } from "@/modules/real-build/infrastructure/dal";
import { difficultyLabel } from "@/modules/real-build/domain/build";
import { BuildChoiceForm } from "@/modules/real-build/ui/choice-form";
export const metadata: Metadata = {
  title: "Real Quests",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export default async function RealQuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; service?: string }>;
}) {
  const [home, params] = await Promise.all([getBuildHome(), searchParams]);
  const suggestion = cityQuestHandoff(params.service);
  const idea = cityInspiration(suggestion?.topic ?? params.district);
  return (
    <main id="main-content">
      <p className="text-xs font-bold tracking-widest text-[#1d4ed8] uppercase">
        Real Quests
      </p>
      <h1 className="mt-3 text-3xl font-extrabold">Build something useful.</h1>
      <p className="mt-3 text-sm leading-6 text-[#52647c]">
        Start small, build real solutions and take on harder challenges as you
        practise and learn.
      </p>
      {home.current ? (
        <section className="build-card mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-[#2059bd]">
              YOUR CURRENT QUEST
            </p>
            <span className="rounded-full border border-[#c8dbf7] bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#16488f]">
              Level {home.current.difficulty}/5 ·{" "}
              {difficultyLabel(home.current.difficulty)}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-[#345781]">
            {home.current.focus}
          </p>
          {home.current.source === "reviewed" ? (
            <p className="mt-3 text-xs font-semibold text-[#225a91]">
              Reviewed practical starter
            </p>
          ) : null}
          <h2 className="mt-3 text-xl font-bold">
            {home.current.challenge.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#52647c]">
            {home.current.challenge.outcome}
          </p>
          <Link
            href={`/real-quests/${home.current.id}`}
            className="build-primary mt-5 w-full"
          >
            Continue my Quest →
          </Link>
          <p className="mt-3 text-xs text-[#52647c]">
            Your saved work is waiting. You can set this aside from its page.
          </p>
        </section>
      ) : (
        <>
          {suggestion ? (
            <section
              aria-label="From your city to real life"
              className="mt-6 rounded-2xl border border-[#c8dbf7] bg-[#eef5ff] p-4 text-sm leading-6 text-[#264e89]"
            >
              <p className="font-bold">From your city: {suggestion.title}</p>
              <p className="mt-1">
                You tested an idea in a fictional city. Here is a safe real-life
                starting point. Change it to suit your own surroundings before
                creating your Quest. Playing the game does not count as
                real-world evidence or earn XP.
              </p>
            </section>
          ) : null}
          <BuildChoiceForm
            initialTopic={idea?.id}
            initialFocus={suggestion?.focus}
          />
        </>
      )}
      <section
        className="mt-7 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-[#52647c]"
        aria-label="How Real Quests works"
      >
        <p>1. Try a small build</p>
        <p>2. Save honest evidence</p>
        <p>3. Grow to harder levels</p>
      </section>
      <section className="build-card mt-7">
        <h2 className="text-lg font-extrabold">Build with people you trust</h2>
        <p className="mt-2 text-sm leading-6 text-[#52647c]">
          Eligible adult Builders and authorised school networks can use the
          existing protected Project collaboration system. Invitations require
          accepted connections; contributions are recorded without unrestricted
          stranger chat. Your Quest evidence remains private.
        </p>
        <Link
          href="/connect/collaborations"
          className="mt-3 inline-block py-3 text-sm font-bold text-[#2059bd]"
        >
          Open protected Builder collaboration →
        </Link>
      </section>
      <Link href="/you" className="mt-7 inline-block py-3 text-sm font-bold">
        My saved attempts →
      </Link>
    </main>
  );
}
