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
  if (state.snapshot.completedProjectId) {
    redirect("/projects");
  }
  redirect(
    state.destination.path === "/app" ? "/projects" : state.destination.path,
  );
}
