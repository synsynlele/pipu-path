import { redirect } from "next/navigation";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { cityContinuation } from "@/modules/city/domain/continuation";

export default async function NeighbourhoodPage() {
  const state = await requireAuthenticatedHomeState();
  redirect(cityContinuation(state.quest).playHref);
}
