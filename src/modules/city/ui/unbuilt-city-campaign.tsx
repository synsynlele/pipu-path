import Link from "next/link";

/** Districts share one city document, clock, fund and evaluated operating days. */
export function UnbuiltCityCampaign({ playHref }: { playHref: string }) {
  return (
    <section
      aria-labelledby="city-campaign-heading"
      className="unbuilt-city-campaign space-y-5"
    >
      <header className="overflow-hidden rounded-3xl border border-[#4f7cff]/30 bg-[#0d1d3d] p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[.2em] text-[#e5c96f] uppercase">
          The Unbuilt City
        </p>
        <h1
          id="city-campaign-heading"
          className="mt-3 max-w-lg text-3xl font-extrabold sm:text-4xl"
        >
          One city. Every choice connected.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#c5d2ec]">
          The workshop, market and learning club exist in the same place. Walk
          between them, build useful systems and watch the whole city respond.
        </p>
        <Link
          href={playHref}
          className="adventure-action mt-5 inline-flex min-h-12 items-center rounded-full px-6 text-sm font-extrabold"
        >
          Enter The Unbuilt City →
        </Link>
        <p className="mt-4 text-xs leading-5 text-[#94a8ce]">
          One 3D neighbourhood · a shared city fund · two connected operating
          days
        </p>
      </header>
      <section
        aria-labelledby="inside-city"
        className="rounded-3xl border border-[#4f7cff]/20 bg-[#0c1c3c] p-5 sm:p-6"
      >
        <h2 id="inside-city" className="text-lg font-extrabold">
          Inside your city
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-[#132b5c]/40 p-4">
            <p className="text-xs font-bold text-[#e5c96f]">POWER DISTRICT</p>
            <h3 className="mt-2 text-base font-bold">Keep services running</h3>
            <p className="mt-2 text-xs leading-6 text-[#c1ceea]">
              Generation and storage power the workshop, evening class and
              market cooling.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#132b5c]/40 p-4">
            <p className="text-xs font-bold text-[#e5c96f]">HARVEST EXCHANGE</p>
            <h3 className="mt-2 text-base font-bold">Make food reach people</h3>
            <p className="mt-2 text-xs leading-6 text-[#c1ceea]">
              Collection, protection and fair payments affect losses and the
              city’s next investment.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#132b5c]/40 p-4">
            <p className="text-xs font-bold text-[#e5c96f]">LEARNING COMMONS</p>
            <h3 className="mt-2 text-base font-bold">
              Help understanding grow
            </h3>
            <p className="mt-2 text-xs leading-6 text-[#c1ceea]">
              Investigate fictional learner examples, build an activity and keep
              the club’s power dependable.
            </p>
          </article>
        </div>
        <p className="mt-5 text-sm leading-6 text-[#d2def2]">
          Dust, delayed collection and late payment arrive together. Adapt the
          city you already built—your equipment and people stay in place.
        </p>
      </section>
      <p className="text-xs leading-5 text-[#a7b8d8]">
        This first connected-city prototype stays in the current session.
        Earlier practice saves are not converted. It does not simulate a full
        economy or award verified XP.
      </p>
    </section>
  );
}
