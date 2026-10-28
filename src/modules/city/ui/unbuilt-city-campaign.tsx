import Link from "next/link";

/** Authored missions only become playable when their actual game is available. */
export function UnbuiltCityCampaign({ playHref }: { playHref: string }) {
  return (
    <section aria-labelledby="city-campaign-heading" className="space-y-4">
      <header className="rounded-3xl border border-[#a2b889]/45 bg-[#19382f] p-6 sm:p-8">
        <p className="text-xs font-bold tracking-widest text-[#e4c185] uppercase">
          PipuPath · The Unbuilt City
        </p>
        <h1 id="city-campaign-heading" className="mt-3 text-3xl font-extrabold">
          Build a city that works for people.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#d3e2d5]">
          Enter places. Investigate what is happening. Build, test and improve a
          solution with the people who need it.
        </p>
        <Link
          href={playHref}
          className="adventure-action mt-5 inline-flex min-h-12 items-center rounded-full bg-[#d8e7a8] px-5 text-sm font-extrabold text-[#233e35]"
        >
          Enter The Unbuilt City →
        </Link>
      </header>
      <ol aria-label="New city mission path" className="space-y-3">
        <li className="rounded-2xl border border-[#8fab73]/70 bg-[#172e35] p-5">
          <p className="text-xs font-bold tracking-wide text-[#d8e7a8]">
            01 · POWER DISTRICT · PLAYABLE IN 3D
          </p>
          <h2 className="mt-2 text-xl font-extrabold">
            Keep the Workshop Running
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#d3e2e9]">
            Balance generation, storage, timing and upkeep. Face a dusty day and
            leave a service the cooperative can maintain.
          </p>
          <Link
            href={playHref}
            className="mt-3 inline-flex min-h-11 items-center font-bold text-[#efd399]"
          >
            Play the first mission ↗
          </Link>
        </li>
        <li className="rounded-2xl border border-white/15 bg-[#142730] p-5">
          <p className="text-xs font-bold tracking-wide text-[#bdcfc9]">
            02 · HARVEST EXCHANGE · PLANNED
          </p>
          <h2 className="mt-2 text-lg font-bold">The Collection Window</h2>
          <p className="mt-2 text-sm leading-6 text-[#bdcfc9]">
            Investigate produce losses, coordinate collection and keep supplier
            payments viable. This mission is being designed; it is not playable
            yet.
          </p>
        </li>
        <li className="rounded-2xl border border-white/15 bg-[#142730] p-5">
          <p className="text-xs font-bold tracking-wide text-[#bdcfc9]">
            03 · LEARNING COMMONS · PLANNED
          </p>
          <h2 className="mt-2 text-lg font-bold">Everyone Can Explain It</h2>
          <p className="mt-2 text-sm leading-6 text-[#bdcfc9]">
            Investigate barriers to understanding, create an activity and test
            transfer. This mission is being designed; it is not playable yet.
          </p>
        </li>
      </ol>
      <p className="text-xs leading-5 text-[#aebfc7]">
        This new campaign replaces the earlier city challenges. Earlier device
        saves are not converted into new mission completion. Practice stays
        separate from earned XP and real Quest proof.
      </p>
    </section>
  );
}
