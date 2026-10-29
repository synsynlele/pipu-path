import Link from "next/link";
import { PublicShell } from "@/components/shells/public-shell";

export default function HomePage() {
  return (
    <PublicShell>
      <main id="main-content" className="bg-[#f7f8fc]">
        <section className="mx-auto grid min-h-[80svh] max-w-6xl items-center gap-9 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#5436df] uppercase">
              PipuPath · Build a better world
            </p>
            <h1 className="mt-4 text-4xl leading-tight font-extrabold text-[#1d2d4d] sm:text-6xl">
              Your city. Your choices. A better life for people.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#5d6b84]">
              Step into The Unbuilt City. Meet people, solve challenges, and
              watch your decisions shape a living world. Then take what you
              learn into real life with a PipuPath Quest.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#5436df] px-7 font-bold text-white"
                style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
              >
                Play free →
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#a2afc6] bg-white px-7 font-bold text-[#243b78]"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#243b78",
                  WebkitTextFillColor: "#243b78",
                }}
              >
                Build in real life
              </Link>
            </div>
            <p className="mt-5 text-sm text-[#74809a]">
              No account needed to try the city. Real Quests and evidence are
              personal, private and account-linked.
            </p>
          </div>
          <div className="rounded-[2.25rem] bg-gradient-to-br from-[#183255] via-[#267b7a] to-[#71986e] p-8 text-white shadow-xl">
            <p className="text-xs font-bold tracking-widest text-[#f3d17e] uppercase">
              One connected journey
            </p>
            <ol className="mt-6 space-y-5">
              <li>
                <strong className="text-xl">01 · Play</strong>
                <p className="mt-1 text-sm leading-6 text-[#e1f1f0]">
                  Make decisions that physically change a city and improve how
                  people live.
                </p>
              </li>
              <li>
                <strong className="text-xl">02 · Real Quests</strong>
                <p className="mt-1 text-sm leading-6 text-[#e1f1f0]">
                  Try a meaningful action outside the game. Bring back evidence
                  and reflect.
                </p>
              </li>
              <li>
                <strong className="text-xl">03 · You</strong>
                <p className="mt-1 text-sm leading-6 text-[#e1f1f0]">
                  Discover your potential and see how real experiences shape
                  your growth.
                </p>
              </li>
            </ol>
            <p className="mt-7 border-t border-white/20 pt-5 text-xs leading-6 text-[#e1f1f0]">
              Game results are practice—not real-world evidence, earned XP or
              completed Quests.
            </p>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
