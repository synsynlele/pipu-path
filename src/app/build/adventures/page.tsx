import "@/modules/city/ui/adventure-theme.css";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { getBuilderLevelProgress } from "@/modules/identity/domain/builder-level";
import { cityContinuation } from "@/modules/city/domain/continuation";
import { AdventurePathMap } from "@/modules/city/ui/adventure-path-map";

export const metadata: Metadata = {
  title: "Your Adventure Path | PipuPath",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdventureHubPage() {
  const state = await requireAuthenticatedHomeState();
  const quest = state.quest?.status === "locked" ? null : state.quest;
  const next = cityContinuation(quest);
  const level = getBuilderLevelProgress(state.totalXp);
  const proofSaved =
    quest?.status === "evidence_submitted" || quest?.status === "completed";

  return (
    <main
      id="main-content"
      className="adventure-dark min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-[#091a29] pb-16 text-white"
    >
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-5 px-3 pt-3 sm:px-6 sm:pt-6">
        <header className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <Link
            href="/build"
            className="inline-flex min-h-11 items-center text-xs font-semibold text-[#d1e2eb]"
          >
            ← Back to Build
          </Link>
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center rounded-full border border-[#e2b963]/40 bg-[#e2b963]/10 px-3 text-xs font-bold text-[#f1d28d]"
            aria-label={`Your builder level: ${level.current}, ${state.totalXp} earned XP`}
          >
            {level.current} · {state.totalXp} earned XP
          </Link>
        </header>

        <AdventurePathMap userId={state.userId} cityHref={next.playHref} />

        <section
          aria-labelledby="real-quest-heading"
          className="rounded-3xl border border-[#c3b080]/35 bg-[#142e39] p-5 sm:p-7"
        >
          <p className="text-xs font-extrabold tracking-[.16em] text-[#f3cd8e] uppercase">
            Beyond the game
          </p>
          <h2 id="real-quest-heading" className="mt-2 text-xl font-extrabold">
            Turn what you learn into real impact.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#d3e2e9]">
            {quest?.title
              ? `Your Quest: ${quest.title}. ${proofSaved ? "Your proof is already recorded." : "Try something useful in real life and bring back honest proof."}`
              : "Choose a real-world Quest, take action and show what you built. Practice games never create verified proof or XP."}
          </p>
          <Link
            href={next.actionHref}
            className="adventure-action mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-bold sm:w-auto"
          >
            {proofSaved ? "Continue my real Quest" : "Open my real-world Quest"}{" "}
            →
          </Link>
        </section>
        <p className="pb-2 text-center text-[0.7rem] leading-5 text-[#8fa7b5]">
          The mission path is your practice journey. Earned XP and real Quest
          progress remain separate. World photography: Unsplash.
        </p>
      </div>
    </main>
  );
}
