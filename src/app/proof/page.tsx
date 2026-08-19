import { redirect } from "next/navigation";
import { getAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProofEntryPage() {
  const state = await getAuthenticatedHomeState();

  if (!state) {
    redirect("/login?next=/proof");
  }

  if (state.quest?.id) {
    if (state.quest.status === "active") {
      redirect(`/quests/${state.quest.id}/proof`);
    }
    redirect(`/quests/${state.quest.id}`);
  }

  redirect("/quests");
}
