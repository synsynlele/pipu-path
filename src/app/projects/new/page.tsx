import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getCurrentEconomicPathwayState } from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { getBuilderProjectState } from "@/modules/project/infrastructure/project-dal";
import { ProjectCreateForm } from "@/modules/project/ui/project-create-form";

export const metadata: Metadata = {
  title: "First Value Challenge",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage() {
  const [state, pathways] = await Promise.all([
    getBuilderProjectState(),
    getCurrentEconomicPathwayState(),
  ]);
  if (state.active) redirect(`/projects/${state.active.project.id}`);

  const todayDate = new Date();
  const maximumDate = new Date(todayDate);
  maximumDate.setUTCDate(maximumDate.getUTCDate() + 365);
  const today = todayDate.toISOString().slice(0, 10);
  const maximum = maximumDate.toISOString().slice(0, 10);
  const selectedPath = pathways?.selectedPath ?? null;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <ButtonLink href="/projects" variant="secondary">
        Back to Projects
      </ButtonLink>
      <section className="border-gold/20 bg-panel relative mt-6 overflow-hidden rounded-[2rem] border p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
        />
        <div className="relative">
          <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
            {selectedPath ? "First Value Challenge" : "Project definition"}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {selectedPath
              ? "Create value first. Test whether somebody finds it useful."
              : "Build from what you have already proved."}
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-lg leading-8">
            {selectedPath
              ? `Use evidence from your ${selectedPath.pathName} pathway to solve one small problem for a reachable person or group. Payment is optional; useful delivery, feedback and learning are the real proof.`
              : "Keep the Project small enough to execute, useful enough to matter and clear enough that evidence can show whether it worked."}
          </p>
        </div>
      </section>

      {state.eligibleSources.length === 0 ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            No unused Quest proof
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Complete another Quest before creating a Project.
          </h2>
          <p className="text-muted mt-3 max-w-2xl leading-7">
            A completed Quest may seed only one Project, and every Project must
            retain evidence and reflection provenance.
          </p>
          <ButtonLink href="/quests" className="mt-6">
            Open HQLS Quests
          </ButtonLink>
        </Surface>
      ) : (
        <Surface className="mt-8 p-6 sm:p-8">
          <ProjectCreateForm
            sources={state.eligibleSources}
            today={today}
            maximumDate={maximum}
            selectedPathName={selectedPath?.pathName ?? null}
          />
        </Surface>
      )}
    </main>
  );
}
