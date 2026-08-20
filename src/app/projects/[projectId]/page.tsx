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
      className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white sm:p-8 lg:p-9">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-64 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-10 -bottom-36 size-72 rounded-full bg-[#f3c86b]/12 blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.17em] text-[#f3c86b] uppercase">
                Major Build · Private
              </p>
              <p className="mt-1 text-xs text-blue-100/60">
                Built from verified Quest evidence
              </p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-blue-50">
              {projectStatusLabel(project.status)}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            {project.desired_outcome}
          </p>

          <div className="mt-6 max-w-3xl">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-blue-100/65">Verified build progress</span>
              <span className="font-semibold text-[#f3c86b]">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#f3c86b] transition-[width] motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Surface className="p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                  Boss Build path
                </p>
                <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                  Clear the three milestones with evidence.
                </h2>
              </div>
              <span className="text-muted text-xs">
                Target{" "}
                {new Date(`${project.target_date}T00:00:00`).toLocaleDateString(
                  "en",
                  { dateStyle: "medium" },
                )}
              </span>
            </div>

            <ol
              className="mt-6 grid grid-cols-3 gap-2"
              aria-label="Major Build milestone path"
            >
              {milestones.map((milestone, index) => {
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
                        aria-label={`Milestone ${milestone.sequence_order}: ${projectMilestoneStatusLabel(milestone.status)}`}
                      >
                        {completed ? "✓" : current ? "●" : "?"}
                      </span>
                      <p
                        className={`mt-3 text-[0.65rem] font-semibold tracking-wide uppercase ${current ? "text-primary" : completed ? "text-success" : "text-muted"}`}
                      >
                        {projectMilestoneStatusLabel(milestone.status)}
                      </p>
                      <h3 className="text-navy mt-1 line-clamp-2 text-sm leading-5 font-semibold">
                        {milestone.title}
                      </h3>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Surface>

          {project.status === "active" && currentMilestone ? (
            <Surface className="border-primary/25 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                    Build focus now · Milestone{" "}
                    {currentMilestone.sequence_order}
                  </p>
                  <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                    {currentMilestone.title}
                  </h2>
                </div>
                <span className="border-primary/15 bg-primary-soft text-primary rounded-full border px-3 py-1.5 text-xs font-semibold">
                  {projectMilestoneStatusLabel(currentMilestone.status)}
                </span>
              </div>
              <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                {currentMilestone.intended_outcome}
              </p>
              <div className="border-border mt-4 rounded-2xl border p-4">
                <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                  What proves this milestone is cleared?
                </p>
                <p className="text-navy mt-2 text-sm leading-6">
                  {currentMilestone.completion_signal}
                </p>
              </div>
              <div className="mt-5">
                <ProjectUpdateForm
                  projectId={project.id}
                  milestoneId={currentMilestone.id}
                />
              </div>
            </Surface>
          ) : project.status === "completed" ? (
            <Surface className="border-gold/30 bg-gold/5 relative overflow-hidden p-6 sm:p-8">
              <div
                aria-hidden="true"
                className="bg-gold/10 absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
              />
              <div className="relative">
                <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase">
                  Major Build cleared
                </p>
                <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
                  You built something with an evidence trail.
                </h2>
                <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                  The full Project remains private. Choose only what you want to
                  turn into public-safe Builder Vault proof.
                </p>
                <ButtonLink href={`/portfolio/${project.id}`} className="mt-5">
                  Prepare Builder Vault Proof →
                </ButtonLink>
              </div>
            </Surface>
          ) : (
            <Surface className="border-border bg-panel p-6 sm:p-8">
              <p className="text-muted text-xs font-semibold tracking-[0.15em] uppercase">
                Archived Build
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                This Build closed without being marked complete.
              </h2>
              <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
                Its definition and private evidence remain saved as part of your
                history. Archived work is not treated as a completed Build and
                cannot be prepared as Builder Vault proof.
              </p>
              <ButtonLink href="/projects" variant="secondary" className="mt-5">
                Back to Builds
              </ButtonLink>
            </Surface>
          )}

          <details className="border-border bg-panel rounded-2xl border p-5">
            <summary className="text-navy cursor-pointer text-sm font-semibold">
              Open full Project definition
            </summary>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Problem", project.problem_statement],
                ["People served", project.people_served],
                ["Smallest useful version", project.smallest_useful_version],
                ["Success signal", project.success_signal],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-border rounded-xl border p-4"
                >
                  <dt className="text-muted text-xs tracking-wide uppercase">
                    {label}
                  </dt>
                  <dd className="text-navy mt-2 text-sm leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>

        <aside className="space-y-5">
          <Surface className="p-5 sm:p-6">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Quest provenance
            </p>
            <h2 className="text-navy mt-2 text-lg font-semibold">
              {sourceQuest?.title ?? "Completed HQLS Quest"}
            </h2>
            <p className="text-muted mt-2 text-sm leading-6">
              {sourceQuest?.real_world_outcome ??
                "The Project remains linked to its original private Quest proof."}
            </p>
          </Surface>

          <details className="border-border bg-panel rounded-2xl border p-5">
            <summary className="text-navy cursor-pointer text-sm font-semibold">
              Private evidence trail · {updates.length}{" "}
              {updates.length === 1 ? "update" : "updates"}
            </summary>
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
                        <p className="text-navy text-xs font-semibold">
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
                      <p className="text-navy mt-2 text-sm leading-6">
                        {update.proof_text}
                      </p>
                      {update.proof_link ? (
                        <a
                          href={update.proof_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary mt-2 inline-block text-sm font-semibold underline underline-offset-4"
                        >
                          Open proof link
                        </a>
                      ) : null}
                      {update.marks_milestone_complete ? (
                        <p className="text-success mt-2 text-xs font-semibold uppercase">
                          Milestone cleared
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
          </details>
        </aside>
      </section>
    </main>
  );
}
