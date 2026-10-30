import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CityContext } from "@/modules/city/ui/city-episode";
import { UnbuiltCityExperience } from "@/modules/city/ui/unbuilt-city-experience";
import { cityContinuation } from "@/modules/city/domain/continuation";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { getQuestById } from "@/modules/quest/infrastructure/quest-dal";

export const metadata: Metadata = {
  title: "The Unbuilt City · Play",
  robots: { index: false, follow: false },
};
export default async function CityPage({
  searchParams,
}: {
  searchParams: Promise<{ quest?: string }>;
}) {
  const params = await searchParams;
  const state = await requireAuthenticatedHomeState();
  const selectedId =
    params.quest ??
    (state.quest?.status === "locked" ? undefined : state.quest?.id);
  let context: CityContext | null = null;
  if (selectedId) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        selectedId,
      )
    )
      notFound();
    // This DAL authenticates ownership; never trust a query parameter as context.
    const detail = await getQuestById(selectedId);
    if (!detail || detail.quest.status === "locked") notFound();
    const next = cityContinuation(detail.quest);
    context = {
      questId: detail.quest.id,
      questTitle: detail.quest.title,
      journeyTitle:
        detail.journey?.title ?? state.journey?.title ?? "Your journey",
      outcome: detail.quest.real_world_outcome,
      returnHref: next.actionHref,
      returnLabel: next.actionLabel,
    };
  }
  const next = cityContinuation(state.quest);
  return (
    <UnbuiltCityExperience
      questHref={context?.returnHref ?? next.actionHref}
      questLabel={context?.returnLabel ?? next.actionLabel}
      questTitle={context?.questTitle}
      outcome={context?.outcome}
      cloudEligible
    />
  );
}
