import { MissionExperience } from "@/modules/city/ui/world-simulation";
import type { Metadata } from "next";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { cityContinuation } from "@/modules/city/domain/continuation";
import { Neighbourhood } from "@/modules/city/ui/neighbourhood";
export const metadata: Metadata = {
  title: "Your neighbourhood",
  robots: { index: false, follow: false },
};
export default async function NeighbourhoodPage() {
  const state = await requireAuthenticatedHomeState();
  const next = cityContinuation(state.quest);
  return (
    <MissionExperience
      worldId="neighbourhood"
      userId={state.userId}
      questHref={next.actionHref}
    >
      <Neighbourhood
        userId={state.userId}
        questHref={next.actionHref}
        questTitle={state.quest?.title ?? null}
      />
    </MissionExperience>
  );
}
