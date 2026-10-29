import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { realWorldMove } from "@/modules/city/domain/real-world-move";
import {
  cityInspiration,
  cityInterests,
} from "@/modules/city/domain/city-inspiration";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const metadata: Metadata = {
  title: "Real Quests",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function RealQuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string }>;
}) {
  const [state, params] = await Promise.all([
    requireAuthenticatedHomeState(),
    searchParams,
  ]);
  const move = realWorldMove(state);
  const idea = cityInspiration(params.district);
  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-4 py-7 pb-14 sm:px-8"
    >
      <section className="rounded-[2rem] bg-[#172a47] px-6 py-9 text-white sm:p-10">
        <p className="text-xs font-bold tracking-[0.16em] text-[#e9cd82] uppercase">
          PipuPath · Beyond the city
        </p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
          Real Quests
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#dfebf3]">
          The city lets you practise making decisions. A real Quest is where you
          try something useful, learn what happened, and bring back honest
          proof.
        </p>
      </section>
      <form
        method="get"
        className="mt-5 rounded-2xl border border-[#d9e1ed] bg-white p-5 text-[#20324e]"
      >
        <label htmlFor="city-interest" className="block font-bold">
          Which need inspired you?
        </label>
        <select
          id="city-interest"
          name="district"
          defaultValue={idea?.id ?? ""}
          className="mt-3 min-h-12 w-full rounded-xl border border-[#b3c2d1] bg-white p-3 text-[#20324e]"
        >
          <option value="">Choose a need</option>
          {cityInterests.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="mt-3 min-h-11 rounded-xl bg-[#5436df] px-5 font-bold text-white"
        >
          Explore this idea
        </button>
      </form>
      {idea ? (
        <section className="mt-5 rounded-2xl border border-[#d6e8de] bg-[#f0f8f2] p-5 text-[#265343]">
          <p className="text-xs font-bold tracking-[0.12em] uppercase">
            A starting idea · {idea.title}
          </p>
          <p className="mt-2 text-sm leading-6">{idea.idea}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            <li>Notice the need in a familiar place, with permission.</li>
            <li>Listen to someone you know who experiences it.</li>
            <li>Sketch one small, safe improvement using what you have.</li>
            <li>
              Try it with appropriate adult guidance and ask for feedback.
            </li>
            <li>
              Keep a sketch or notes, then explain what you would improve.
            </li>
          </ol>
          <p className="mt-3 text-sm">
            What changed for the person? What would you try next? Keep names,
            faces and private details out of your notes.
          </p>
          <p className="mt-2 text-xs">
            This is inspiration, not an assigned or completed Quest, and earns
            no XP. Follow your own Quest’s steps and evidence requirements.
          </p>
        </section>
      ) : null}
      <section className="mt-5 rounded-3xl border border-[#d9e1ed] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold tracking-widest text-[#5436df] uppercase">
          Your next genuine step
        </p>
        <h2 className="mt-3 text-2xl font-bold text-[#20324e]">{move.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[#62738b]">{move.detail}</p>
        <ButtonLink
          href={move.href}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#5436df] px-6 font-bold text-white"
        >
          {move.label} →
        </ButtonLink>
      </section>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/build/play"
          className="inline-flex min-h-11 items-center rounded-full border border-[#d6dfea] px-5 text-sm font-bold text-[#34425f]"
        >
          Return to the city
        </Link>
        <Link
          href="/profile"
          className="inline-flex min-h-11 items-center rounded-full border border-[#d6dfea] px-5 text-sm font-bold text-[#34425f]"
        >
          My potential and tools
        </Link>
      </div>
    </main>
  );
}
