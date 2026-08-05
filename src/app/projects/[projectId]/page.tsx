import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  calculateProjectProgress,
  projectMilestoneStatusLabel,
  projectStatusLabel,
} from "@/modules/project/domain/project-contract";
import { getBuilderProjectById } from "@/modules/project/infrastructure/project-dal";
import { ProjectUpdateForm } from "@/modules/project/ui/project-update-form";

export const metadata: Metadata = {
  title: "Project command centre",
  robots: { index: false, follow: false },
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const detail = await getBuilderProjectById(projectId);
  if (!detail) notFound();

  const { project, milestones, updates, sourceQuest } = detail;
  const progress = calculateProjectProgress(
    milestones.map((milestone) => milestone.status),
  );
  const currentMilestone = milestones.find(
    (milestone) =>
      milestone.status === "available" || milestone.status === "active",
  );
  const milestoneById = new Map(
    milestones.map((milestone) => [milestone.id, milestone]),
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
              Builder Project · Private
            </p>
            <span className="border-gold/30 bg-gold/5 rounded-full border px-3 py-1.5 text-xs font-semibold">
              {projectStatusLabel(project.status)}
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="text-muted mt-4 max-w-3xl text-lg leading-8">
            {project.desired_outcome}
          </p>
          <div className="mt-7 max-w-2xl">
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-muted">Verified Project progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="bg-background mt-2 h-2 overflow-hidden rounded-full">
              <div
                className="bg-gold h-full rounded-full transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Surface className="p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Project definition
            </p>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              {[
                ["Problem", project.problem_statement],
                ["People served", project.people_served],
                ["Smallest useful version", project.smallest_useful_version],
                ["Success signal", project.success_signal],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-border rounded-2xl border p-4"
                >
                  <dt className="text-muted text-xs tracking-wide uppercase">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </Surface>

          <Surface className="p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Execution path
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  Three evidence-based milestones
                </h2>
              </div>
              <span className="text-muted text-sm">
                Target{" "}
                {new Date(`${project.target_date}T00:00:00`).toLocaleDateString(
                  "en",
                  { dateStyle: "medium" },
                )}
              </span>
            </div>
            <ol className="mt-6 grid gap-4">
              {milestones.map((milestone) => (
                <li
                  key={milestone.id}
                  className={`rounded-2xl border p-5 ${
                    milestone.id === currentMilestone?.id
                      ? "border-gold/40 bg-gold/5"
                      : "border-border bg-background/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                      Milestone {milestone.sequence_order}
                    </p>
                    <span className="border-border rounded-full border px-2.5 py-1 text-xs">
                      {projectMilestoneStatusLabel(milestone.status)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">
                    {milestone.title}
                  </h3>
                  <p className="text-muted mt-2 leading-7">
                    {milestone.intended_outcome}
                  </p>
                  <div className="border-border mt-4 border-t pt-4">
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      Completion signal
                    </p>
                    <p className="text-muted mt-2 text-sm leading-6">
                      {milestone.completion_signal}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Surface>

          {project.status === "active" && currentMilestone ? (
            <Surface className="p-6 sm:p-8">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Current execution focus
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {currentMilestone.title}
              </h2>
              <p className="text-muted mt-3 max-w-2xl leading-7">
                Record progress even when the milestone is not finished. Mark it
                complete only when the stated completion signal is genuinely
                true.
              </p>
              <ProjectUpdateForm
                projectId={project.id}
                milestoneId={currentMilestone.id}
              />
            </Surface>
          ) : (
            <Surface className="border-gold/30 bg-gold/5 p-6 sm:p-8">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Project complete
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                A useful result now has an evidence trail.
              </h2>
              <p className="text-muted mt-4 max-w-2xl leading-7">
                This completed Project remains private until you intentionally
                prepare a public-safe portfolio draft. Raw evidence, reflections
                and private updates are never published automatically.
              </p>
              <ButtonLink href={`/portfolio/${project.id}`} className="mt-6">
                Prepare Selective Public Proof
              </ButtonLink>
            </Surface>
          )}
        </div>

        <aside className="space-y-6">
          <Surface className="p-6">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Quest provenance
            </p>
            <h2 className="mt-3 text-lg font-semibold">
              {sourceQuest?.title ?? "Completed HQLS Quest"}
            </h2>
            <p className="text-muted mt-3 text-sm leading-6">
              {sourceQuest?.real_world_outcome ??
                "The Project remains linked to its original private Quest proof."}
            </p>
          </Surface>

          <Surface className="p-6">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Private update trail
            </p>
            {updates.length === 0 ? (
              <p className="text-muted mt-3 text-sm leading-6">
                No Project update has been recorded yet.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {updates.map((update) => {
                  const milestone = milestoneById.get(update.milestone_id);
                  return (
                    <li
                      key={update.id}
                      className="border-border border-l-2 pl-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold">
                          {milestone?.title ?? "Project milestone"}
                        </p>
                        <span className="text-muted text-[0.7rem]">
                          {new Date(update.created_at).toLocaleDateString(
                            "en",
                            {
                              dateStyle: "medium",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-muted mt-2 text-sm leading-6">
                        {update.progress_note}
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {update.proof_text}
                      </p>
                      {update.proof_link ? (
                        <a
                          href={update.proof_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold mt-2 inline-block text-sm underline underline-offset-4"
                        >
                          Open proof link
                        </a>
                      ) : null}
                      {update.marks_milestone_complete ? (
                        <p className="text-gold mt-2 text-xs font-semibold uppercase">
                          Milestone completed
                        </p>
                      ) : (
                        <p className="text-muted mt-2 text-xs">
                          Next: {update.next_step}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Surface>
        </aside>
      </section>
    </main>
  );
}
