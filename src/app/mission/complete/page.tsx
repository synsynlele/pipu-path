import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getCurrentMissionState } from "@/modules/mission/infrastructure/mission-dal";

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
      className="mx-auto max-w-4xl px-4 py-7 sm:px-8 sm:py-14"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-[#f3c86b]/25 bg-[#07142f] p-7 text-white sm:p-11">
        <div
          aria-hidden="true"
          className="absolute inset-x-1/4 -top-28 h-56 rounded-full bg-[#f3c86b]/12 blur-3xl"
        />
        <div className="relative text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#f3c86b] uppercase">
            Campaign activated
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Direction chosen. The map can now open.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-50/75 sm:text-base">
            Your Campaign is saved. The Journey will turn this direction into practical chapters, then Quests will move those chapters into real life.
          </p>
        </div>
      </section>

      <Surface className="border-primary/20 bg-primary-soft/25 mt-5 p-6 sm:p-8">
        <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
          Active Campaign
        </p>
        <h2 className="text-navy mt-2 text-2xl font-semibold">
          {state.active.title}
        </h2>
        <p className="text-muted mt-3 text-sm leading-6">
          {state.active.mission_statement}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/journey">Open Journey Map →</ButtonLink>
          <ButtonLink href="/app" variant="secondary">
            Return Home
          </ButtonLink>
        </div>
      </Surface>
    </main>
  );
}
