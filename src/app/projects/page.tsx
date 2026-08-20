import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  calculateProjectProgress,
  projectStatusLabel,
} from "@/modules/project/domain/project-contract";
import { getBuilderProjectState } from "@/modules/project/infrastructure/project-dal";

export const metadata: Metadata = {
  title: "Builder Projects",
  robots: { index: false, follow: false },
};

export default async function ProjectsPage() {
  const state = await getBuilderProjectState();
  const active = state.active;
  const progress = active
    ? calculateProjectProgress(
        active.milestones.map((milestone) => milestone.status),
      )
    : 0;
  const currentMilestone = active?.milestones.find(
    (milestone) =>
      milestone.status === "available" || milestone.status === "active",
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-12 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-20 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-12 -bottom-36 size-72 rounded-full bg-[#f3c86b]/12 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Major Build · Builder Project
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {active
              ? active.project.title
              : state.eligibleSources.length > 0
                ? "Your Quest proof is ready for a bigger challenge."
                : "Quests prepare you. Projects prove what you can build."}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            {active
              ? active.project.desired_outcome
              : "A Builder Project combines what you have learned into one useful real-world result. Progress only moves when evidence does."}
          </p>
          {active ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-blue-50">
                {projectStatusLabel(active.project.status)}
              </span>
              <span className="rounded-full border border-[#f3c86b]/25 bg-[#f3c86b]/8 px-3 py-1.5 text-xs font-semibold text-[#f3c86b]">
                {progress}% verified progress
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {active ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <Surface className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                  Boss Build path
                </p>
                <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                  Three real milestones. No simulated progress.
                </h2>
              </div>
              <span className="text-muted text-xs">
                Target{" "}
                {new Date(
                  `${active.project.target_date}T00:00:00`,
                ).toLocaleDateString("en", { dateStyle: "medium" })}
              </span>
            </div>

            <ol
              className="mt-6 grid grid-cols-3 gap-2"
              aria-label="Project milestone path"
            >
              {active.milestones.map((milestone, index) => {
                const completed = milestone.status === "completed";
                const current = milestone.id === currentMilestone?.id;
                return (
                  <li key={milestone.id} className="relative min-w-0">
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className={`absolute top-5 -left-1/2 h-px w-full ${completed || current ? "bg-primary/45" : "bg-border"}`}
                      />
                    ) : null}
                    <div className="relative z-10">
                      <span
                        className={`grid size-10 place-items-center rounded-full border text-xs font-bold ${
                          completed
                            ? "border-success/30 bg-success/10 text-success"
                            : current
                              ? "border-primary bg-primary text-white shadow-[0_0_0_5px_rgba(79,124,255,0.09)]"
                              : "border-border bg-background text-muted"
                        }`}
                      >
                        {completed ? "✓" : current ? "●" : "?"}
                      </span>
                      <p
                        className={`mt-3 text-[0.65rem] font-semibold tracking-wide uppercase ${current ? "text-primary" : completed ? "text-success" : "text-muted"}`}
                      >
                        Milestone {milestone.sequence_order}
                      </p>
                      <h3 className="text-navy mt-1 line-clamp-2 text-sm leading-5 font-semibold">
                        {milestone.title}
                      </h3>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="bg-soft-blue mt-6 h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-[width] motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>

            {currentMilestone ? (
              <div className="border-primary/20 bg-primary-soft/30 mt-6 rounded-2xl border p-5">
                <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                  Your build focus now
                </p>
                <h3 className="text-navy mt-2 text-xl font-semibold">
                  {currentMilestone.title}
                </h3>
                <p className="text-muted mt-2 text-sm leading-6">
                  {currentMilestone.intended_outcome}
                </p>
              </div>
            ) : null}

            <ButtonLink
              href={`/projects/${active.project.id}`}
              className="mt-6"
            >
              Enter Major Build →
            </ButtonLink>
          </Surface>

          <div className="space-y-5">
            <Surface className="p-5 sm:p-6">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Built from real proof
              </p>
              <h3 className="text-navy mt-2 text-lg font-semibold">
                {active.sourceQuest?.title ?? "Completed HQLS Quest"}
              </h3>
              <p className="text-muted mt-2 text-sm leading-6">
                {active.sourceQuest?.real_world_outcome ??
                  "This Project remains linked to its completed private Quest proof."}
              </p>
            </Surface>
            <Surface className="p-5 sm:p-6">
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                Evidence trail
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-navy text-3xl font-semibold">
                  {active.updates.length}
                </span>
                <span className="text-muted pb-1 text-xs">
                  private progress{" "}
                  {active.updates.length === 1 ? "record" : "records"}
                </span>
              </div>
              <p className="text-muted mt-2 text-xs leading-5">
                Evidence remains private until you deliberately prepare selected
                Portfolio proof.
              </p>
            </Surface>
          </div>
        </section>
      ) : (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Surface
            className={`p-6 sm:p-8 ${state.eligibleSources.length > 0 ? "border-gold/30 bg-gold/5" : ""}`}
          >
            {state.eligibleSources.length > 0 ? (
              <>
                <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase">
                  Major Build unlocked
                </p>
                <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
                  Your next challenge is larger than one Quest.
                </h2>
                <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                  Completed evidence-backed action can now become one focused
                  Builder Project for real people.
                </p>
                <ButtonLink href="/projects/new" className="mt-5">
                  Define My Major Build →
                </ButtonLink>
              </>
            ) : (
              <>
                <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                  Build remains locked
                </p>
                <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
                  Clear a Quest with proof first.
                </h2>
                <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                  PipuPath will not create a Project from an idea alone. Act,
                  prove and reflect first; then the larger Build opens.
                </p>
                <ButtonLink href="/quests" className="mt-5">
                  Return to Quests
                </ButtonLink>
              </>
            )}
          </Surface>

          <Surface className="p-5 sm:p-6">
            <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
              How a Major Build works
            </p>
            <ol className="mt-4 grid gap-3 text-sm">
              {[
                "Start from completed Quest proof",
                "Define one useful reachable outcome",
                "Clear three evidence-backed milestones",
                "Keep the full trail private",
                "Choose what enters your Builder Vault",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="border-border bg-background text-primary grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-muted pt-1 leading-5">{step}</span>
                </li>
              ))}
            </ol>
          </Surface>
        </section>
      )}

      {state.history.length > 0 ? (
        <section className="mt-9">
          <div>
            <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
              Build history
            </p>
            <h2 className="text-navy mt-1 text-2xl font-semibold">
              Past Major Builds
            </h2>
            <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
              Completed and archived Builds stay here so your history is never
              rewritten when your direction changes.
            </p>
          </div>
          <div className="mt-4 flex [scrollbar-width:thin] gap-4 overflow-x-auto pb-3">
            {state.history.map((project) => (
              <Surface key={project.id} className="w-72 shrink-0 p-5">
                <p
                  className={`${
                    project.status === "completed"
                      ? "text-success"
                      : "text-muted"
                  } text-xs font-semibold tracking-wide uppercase`}
                >
                  {projectStatusLabel(project.status)}
                </p>
                <h3 className="text-navy mt-2 text-xl font-semibold">
                  {project.title}
                </h3>
                <p className="text-muted mt-2 line-clamp-3 text-sm leading-6">
                  {project.desired_outcome}
                </p>
                <ButtonLink
                  href={`/projects/${project.id}`}
                  variant="secondary"
                  className="mt-4"
                >
                  Review Build
                </ButtonLink>
              </Surface>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
