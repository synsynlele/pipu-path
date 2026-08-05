"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  saveProjectPortfolioAction,
  type PortfolioFormState,
} from "../application/portfolio-actions";
import type { ProjectPortfolioRow } from "../infrastructure/portfolio-dal";
import type {
  BuilderProjectMilestoneRow,
  BuilderProjectRow,
} from "@/modules/project/infrastructure/project-dal";

const initialState: PortfolioFormState = { status: "idle" };
const inputClass =
  "border-border bg-white mt-2 min-h-12 w-full rounded-xl border px-3 text-sm shadow-sm transition-colors focus:border-primary";
const textareaClass =
  "border-border bg-white mt-2 min-h-28 w-full rounded-2xl border p-4 text-sm leading-6 shadow-sm transition-colors focus:border-primary";

export function PortfolioEditorForm({
  project,
  milestones,
  portfolio,
  defaultBuilderName,
}: {
  project: BuilderProjectRow;
  milestones: BuilderProjectMilestoneRow[];
  portfolio: ProjectPortfolioRow | null;
  defaultBuilderName: string;
}) {
  const [state, action, pending] = useActionState(
    saveProjectPortfolioAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending} className="grid gap-8">
      <input type="hidden" name="projectId" value={project.id} />

      <section className="border-gold/25 bg-gold/8 rounded-2xl border p-5 sm:p-6">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Public-safe boundary
        </p>
        <h2 className="text-navy mt-3 text-xl font-semibold">
          Rewrite for the public. Do not copy private evidence.
        </h2>
        <p className="text-muted mt-3 max-w-3xl text-sm leading-6">
          Avoid names, contact details, school identifiers, private reflections,
          screenshots, exact locations or anything another person did not agree
          to share. PipuPath publishes only the fields in this form.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="builderName"
            className="text-navy text-sm font-semibold"
          >
            Public Builder name
          </label>
          <p className="text-muted mt-1 text-xs">
            Use your preferred public name—not contact information.
          </p>
          <input
            id="builderName"
            name="builderName"
            required
            minLength={2}
            maxLength={80}
            defaultValue={portfolio?.builder_name ?? defaultBuilderName}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="publicTitle"
            className="text-navy text-sm font-semibold"
          >
            Public Project title
          </label>
          <input
            id="publicTitle"
            name="publicTitle"
            required
            minLength={3}
            maxLength={100}
            defaultValue={portfolio?.public_title ?? project.title}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="publicSummary"
            className="text-navy text-sm font-semibold"
          >
            Public summary
          </label>
          <textarea
            id="publicSummary"
            name="publicSummary"
            required
            minLength={40}
            maxLength={1000}
            defaultValue={portfolio?.public_summary ?? ""}
            className={textareaClass}
            placeholder="In a few sentences, explain what you built, why it mattered and what happened."
          />
        </div>
        <div>
          <label
            htmlFor="publicProblem"
            className="text-navy text-sm font-semibold"
          >
            Problem addressed
          </label>
          <textarea
            id="publicProblem"
            name="publicProblem"
            required
            minLength={20}
            maxLength={800}
            defaultValue={
              portfolio?.public_problem ?? project.problem_statement
            }
            className={textareaClass}
          />
        </div>
        <div>
          <label
            htmlFor="publicAudience"
            className="text-navy text-sm font-semibold"
          >
            People or community served
          </label>
          <textarea
            id="publicAudience"
            name="publicAudience"
            required
            minLength={10}
            maxLength={400}
            defaultValue={portfolio?.public_audience ?? project.people_served}
            className={textareaClass}
            placeholder="Describe the group without naming private people."
          />
        </div>
        <div>
          <label
            htmlFor="publicOutcome"
            className="text-navy text-sm font-semibold"
          >
            Useful outcome achieved
          </label>
          <textarea
            id="publicOutcome"
            name="publicOutcome"
            required
            minLength={20}
            maxLength={800}
            defaultValue={portfolio?.public_outcome ?? project.desired_outcome}
            className={textareaClass}
          />
        </div>
        <div>
          <label
            htmlFor="impactSignal"
            className="text-navy text-sm font-semibold"
          >
            Truthful impact signal
          </label>
          <textarea
            id="impactSignal"
            name="impactSignal"
            required
            minLength={10}
            maxLength={500}
            defaultValue={portfolio?.impact_signal ?? project.success_signal}
            className={textareaClass}
            placeholder="State one observable result without exaggeration."
          />
        </div>
      </section>

      <section>
        <p className="text-primary text-xs font-semibold tracking-wide uppercase">
          Public execution story
        </p>
        <h2 className="text-navy mt-3 text-2xl font-semibold">
          Summarise the three milestones safely.
        </h2>
        <div className="mt-5 grid gap-5">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="border-border bg-soft/55 rounded-2xl border p-5"
            >
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                Milestone {index + 1} · {milestone.title}
              </p>
              <label
                htmlFor={`milestoneSummary${index + 1}`}
                className="text-navy mt-3 block text-sm font-semibold"
              >
                Public-safe summary
              </label>
              <textarea
                id={`milestoneSummary${index + 1}`}
                name={`milestoneSummary${index + 1}`}
                required
                minLength={10}
                maxLength={500}
                defaultValue={
                  portfolio?.milestone_summaries[index] ??
                  milestone.intended_outcome
                }
                className={textareaClass}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <label htmlFor="proofLink" className="text-navy text-sm font-semibold">
          Public proof link <span className="text-muted">(optional)</span>
        </label>
        <p className="text-muted mt-1 max-w-2xl text-xs leading-5">
          Use only an HTTPS link that is already safe for anyone with the URL.
          Private Quest evidence is never attached automatically.
        </p>
        <input
          id="proofLink"
          name="proofLink"
          type="url"
          pattern="https://.*"
          maxLength={500}
          defaultValue={portfolio?.proof_link ?? ""}
          placeholder="https://…"
          className={inputClass}
        />
      </section>

      <div>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Preparing safe preview…"
            : "Save and Preview Public Proof"}
        </Button>
        {pending ? (
          <p role="status" className="text-muted mt-3 text-sm">
            Saving a private draft. Nothing is public yet…
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="text-error mt-3 text-sm">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
