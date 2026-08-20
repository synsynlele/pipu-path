import { redirect } from "next/navigation";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Continue building",
  robots: { index: false, follow: false },
};

export default async function BuildPage() {
  const state = await requireAuthenticatedHomeState();

  if (state.snapshot.activeProjectId) {
    redirect(`/projects/${state.snapshot.activeProjectId}`);
  }
  if (state.quest || state.snapshot.journeyStatus === "active") {
    redirect("/quests");
  }

  // Build is a permanent workspace, not a progression redirect. After a Path
  // change there is intentionally no current Mission/Journey yet, but the
  // Builder must still be able to review completed/archived Builds and see the
  // next Build requirement instead of being bounced back to Mission.
  redirect("/projects");
}
