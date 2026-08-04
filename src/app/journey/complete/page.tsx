import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getCurrentJourneyState } from "@/modules/journey/infrastructure/journey-dal";

export const metadata: Metadata = {
  title: "Journey active",
  robots: { index: false, follow: false },
};

export default async function JourneyCompletePage() {
  const state = await getCurrentJourneyState();
  if (!state.active) redirect("/journey");
  const first = state.active.milestones[0];

  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Journey active
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Your first milestone is ready for action.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        Your Journey and milestone order are saved. HQLS Quests now turn this
        pathway into focused action, honest evidence and reflection.
      </p>

      <Surface className="mt-10 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Milestone 1
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{first?.title}</h2>
        <p className="text-muted mt-3 leading-8">{first?.purpose}</p>
        <div className="border-border mt-6 border-t pt-6">
          <p className="text-muted leading-7">
            The milestone receives three ordered Quests. Completing the first
            Quest unlocks the second; only the third genuine completion
            completes this milestone.
          </p>
          <ButtonLink href="/quests" className="mt-6">
            Begin HQLS Quests
          </ButtonLink>
        </div>
      </Surface>

      <ButtonLink href="/journey" variant="secondary" className="mt-6">
        Review active Journey
      </ButtonLink>
    </main>
  );
}
