import Link from "next/link";
import { PowerDistrictFrame } from "./power-district-frame";

/** The new mission replaces the original city runner at its existing route. */
export function UnbuiltCityExperience({
  questHref,
  questLabel,
  questTitle,
  outcome,
}: {
  questHref: string;
  questLabel: string;
  questTitle?: string;
  outcome?: string;
}) {
  return (
    <main
      id="main-content"
      className="adventure-dark unbuilt-city-experience min-h-screen bg-[#07142f] px-3 py-4 pb-24 text-white sm:px-6"
    >
      <div className="mx-auto max-w-7xl space-y-4">
        <Link
          href="/build/adventures"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[#dce5dc]"
        >
          ← The Unbuilt City · Mission path
        </Link>
        <header className="max-w-2xl space-y-2">
          <p className="text-xs font-bold tracking-widest text-[#e4c185] uppercase">
            The Unbuilt City · one world, shared consequences
          </p>
          <h1 className="text-2xl font-extrabold">
            Your city. Your next move.
          </h1>
          <p className="text-sm leading-6 text-[#d1e1dd]">
            Walk between the workshop, market and learning club. Build, run the
            city day, and watch how each decision affects the whole place.
          </p>
        </header>
        <PowerDistrictFrame questHref={questHref} questLabel={questLabel} />
        {questTitle ? (
          <section
            aria-label="Your real-world connection"
            className="rounded-2xl border border-white/20 p-4"
          >
            <h2 className="text-sm font-bold">Your real Quest: {questTitle}</h2>
            {outcome ? (
              <p className="mt-2 text-sm leading-6 text-[#d1e1dd]">{outcome}</p>
            ) : null}
            <Link
              href={questHref}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-[#e4c185]"
            >
              {questLabel}
            </Link>
          </section>
        ) : null}
        <p className="text-xs leading-5 text-[#bdcfc9]">
          Fictional practice. Reflection stays in this session; leaving or
          reloading resets it. Practice does not award XP, submit evidence or
          complete your real Quest. Take what you learn into your real-world
          challenge.
        </p>
      </div>
    </main>
  );
}
