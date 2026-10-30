import type { Metadata } from "next";
import Link from "next/link";
import { cityInspiration } from "@/modules/city/domain/city-inspiration";
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
  searchParams: Promise<{ district?: string }>;
}) {
  const [home, params] = await Promise.all([getBuildHome(), searchParams]);
  const idea = cityInspiration(params.district);
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
        <BuildChoiceForm initialTopic={idea?.id} />
      )}
      <section
        className="mt-7 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-[#52647c]"
        aria-label="How Real Quests works"
      >
        <p>1. Try a small build</p>
        <p>2. Save honest evidence</p>
        <p>3. Grow to harder levels</p>
      </section>
      <Link href="/you" className="mt-7 inline-block py-3 text-sm font-bold">
        My saved attempts →
      </Link>
    </main>
  );
}
