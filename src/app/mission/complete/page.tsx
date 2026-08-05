import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getCurrentMissionState } from "@/modules/mission/infrastructure/mission-dal";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mission active",
  robots: { index: false, follow: false },
};

export default async function MissionCompletePage() {
  const state = await getCurrentMissionState();
  if (!state.active) redirect("/mission");
  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Mission active
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Your direction is ready for a Journey.
      </h1>
      <Surface className="mt-10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">{state.active.title}</h2>
        <p className="text-muted mt-3 leading-8">
          Your mission is saved and will survive refresh. You can now turn it
          into a flexible Journey of practical milestones.
        </p>
      </Surface>
      <ButtonLink href="/journey" className="mt-8">
        Build My Journey
      </ButtonLink>
      <ButtonLink href="/app" variant="secondary" className="mt-4">
        Return to dashboard
      </ButtonLink>
    </main>
  );
}
