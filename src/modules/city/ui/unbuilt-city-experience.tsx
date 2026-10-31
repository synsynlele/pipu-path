import Link from "next/link";
import { PowerDistrictFrame } from "./power-district-frame";

export function UnbuiltCityExperience({
  questTitle,
  outcome,
  cloudEligible = false,
}: {
  questHref?: string;
  questLabel?: string;
  questTitle?: string;
  outcome?: string;
  cloudEligible?: boolean;
}) {
  return (
    <main
      id="main-content"
      className="adventure-dark unbuilt-city-experience min-h-screen bg-[#07142f] p-3 pb-24 text-white sm:p-6"
    >
      <div className="mx-auto max-w-7xl space-y-3">
        <header>
          <h1 className="text-2xl font-extrabold">The Unbuilt City</h1>
          <p className="mt-1 text-sm text-[#d1e1dd]">
            Build a city that helps people live better. Your next step is real.
          </p>
        </header>
        <PowerDistrictFrame
          questHref="/real-quests"
          questLabel="Real Quests →"
           cloudEligible={cloudEligible}
        />
        {questTitle ? (
          <section
            aria-label="Your current real Quest"
            className="rounded-2xl border border-white/20 p-4"
          >
            <h2 className="text-sm font-bold">Your real Quest: {questTitle}</h2>
            {outcome ? (
              <p className="mt-2 text-sm leading-6 text-[#d1e1dd]">{outcome}</p>
            ) : null}
            <Link
              href="/real-quests"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-[#e4c185]"
            >
              Continue my real Quest →
            </Link>
          </section>
        ) : null}
        <p className="text-xs leading-5 text-[#bdcfc9]">
          The city is a fictional simulation. It does not award verified XP or
          create Quest evidence. Only real-world action does that.
        </p>
      </div>
    </main>
  );
}
