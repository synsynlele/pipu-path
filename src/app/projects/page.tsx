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
    ? calculateProjectProgress(active.milestones.map((milestone) => milestone.status))
    : 0;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <section className="border-gold/20 bg-panel relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl"
        />
        <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
          Builder Project Studio
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Turn proof into something useful.
        </h1>
        <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
          Build one focused Project from a completed Quest, preserve real
          progress and let evidence—not ambition—move each milestone forward.
        </p>
      </section>

      {active ? (
        <>
          <section
            aria-label="Project progress"
            className="mt-8 grid gap-4 sm:grid-cols-3"
          >
            <Surface className="p-5">
              <p className="text-muted text-xs tracking-wide uppercase">
                Project progress
              </p>
              <p className="mt-2 text-3xl font-semibold">{progress}%</p>
              <p className="text-muted mt-2 text-xs">
                Completed milestones only
              </p>
            </Surface>
            <Surface className="p-5">
              <p className="text-muted text-xs tracking-wide uppercase">
                Durable updates
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {active.updates.length}
              </p>
              <p className="text-muted mt-2 text-xs">
                Private progress records
              </p>
            </Surface>
            <Surface className="p-5">
              <p className="text-muted text-xs tracking-wide uppercase">
                Target date
              </p>
              <p className="mt-2 text-lg font-semibold">
                {new Date(`${active.project.target_date}T00:00:00`).toLocaleDateString(
                  "en",
                  { dateStyle: "medium" },
                )}
              </p>
              <p className="text-muted mt-2 text-xs">
                A direction, not invented completion
              </p>
            </Surface>
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <Surface className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                    Active Builder Project
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    {active.project.title}
                  </h2>
                </div>
                <span className="border-gold/30 bg-gold/5 rounded-full border px-3 py-1.5 text-xs font-semibold">
                  {projectStatusLabel(active.project.status)}
                </span>
              </div>
              <p className="text-muted mt-4 max-w-3xl leading-7">
                {active.project.desired_outcome}
              </p>
              <div className="mt-6">
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-muted">Verified milestone progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="bg-background mt-2 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-gold h-full rounded-full transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <ol className="mt-8 grid gap-4">
                {active.milestones.map((milestone) => (
                  <li
                    key={milestone.id}
                    className="border-border bg-background/40 rounded-2xl border p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                        Milestone {milestone.sequence_order}
                      </p>
                      <span className="border-border rounded-full border px-2.5 py-1 text-xs">
                        {milestone.status === "completed"
                          ? "Completed"
                          : milestone.status === "active"
                            ? "In progress"
                            : milestone.status === "available"
                              ? "Ready"
                              : "Locked"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold">
                      {milestone.title}
                    </h3>
                    <p className="text-muted mt-2 leading-7">
                      {milestone.intended_outcome}
                    </p>
                  </li>
                ))}
              </ol>
              <ButtonLink href={`/projects/${active.project.id}`} className="mt-6">
                Open Project Command Centre
              </ButtonLink>
            </Surface>

            <aside className="space-y-6">
              <Surface className="p-6">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Proof origin
                </p>
                <h3 className="mt-3 text-lg font-semibold">
                  {active.sourceQuest?.title ?? "Completed HQLS Quest"}
                </h3>
                <p className="text-muted mt-3 text-sm leading-6">
                  {active.sourceQuest?.real_world_outcome ??
                    "This Project remains linked to its completed private Quest proof."}
                </p>
              </Surface>
              <Surface className="p-6">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Focus rule
                </p>
                <p className="text-muted mt-3 text-sm leading-6">
                  PipuPath allows one active Project at a time so attention,
                  evidence and learning remain coherent.
                </p>
              </Surface>
            </aside>
          </section>
        </>
      ) : (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Surface className="p-6 sm:p-8">
            {state.eligibleSources.length > 0 ? (
              <>
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Proof is ready
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Your next step is larger than a Quest.
                </h2>
                <p className="text-muted mt-4 max-w-2xl leading-7">
                  You have completed evidence-backed action that can become the
                  foundation of one focused Builder Project.
                </p>
                <ButtonLink href="/projects/new" className="mt-6">
                  Create My Builder Project
                </ButtonLink>
              </>
            ) : (
              <>
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Completed proof required
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Finish a Quest before starting a Project.
                </h2>
                <p className="text-muted mt-4 max-w-2xl leading-7">
                  Projects grow from action that already has evidence and
                  reflection. PipuPath will not create a Project from an idea
                  alone.
                </p>
                <ButtonLink href="/quests" className="mt-6">
                  Continue HQLS Quests
                </ButtonLink>
              </>
            )}
          </Surface>
          <Surface className="p-6">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Stage 8 promise
            </p>
            <ol className="text-muted mt-4 space-y-3 text-sm leading-6">
              <li>1. Start from completed Quest proof</li>
              <li>2. Define one reachable useful outcome</li>
              <li>3. Execute three measurable milestones</li>
              <li>4. Preserve progress and proof privately</li>
              <li>5. Complete only when the evidence is true</li>
            </ol>
          </Surface>
        </section>
      )}

      {state.history.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Completed Projects</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {state.history.map((project) => (
              <Surface key={project.id} className="p-5">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  {projectStatusLabel(project.status)}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{project.title}</h3>
                <p className="text-muted mt-2 line-clamp-3 text-sm leading-6">
                  {project.desired_outcome}
                </p>
                <ButtonLink
                  href={`/projects/${project.id}`}
                  variant="secondary"
                  className="mt-5"
                >
                  Review Project
                </ButtonLink>
              </Surface>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
