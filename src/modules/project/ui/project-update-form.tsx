"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  addBuilderProjectUpdateAction,
  type ProjectFormState,
} from "../application/project-actions";

const initialState: ProjectFormState = { status: "idle" };

export function ProjectUpdateForm({
  projectId,
  milestoneId,
}: {
  projectId: string;
  milestoneId: string;
}) {
  const [state, action, pending] = useActionState(
    addBuilderProjectUpdateAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending} className="mt-6 grid gap-5">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="milestoneId" value={milestoneId} />
      <div>
        <label htmlFor="progressNote" className="text-sm font-semibold">
          What progress did you make?
        </label>
        <p className="text-muted mt-1 text-sm">
          Describe the action, decision or result—not the intention.
        </p>
        <textarea
          id="progressNote"
          name="progressNote"
          required
          minLength={20}
          maxLength={2000}
          className="border-border bg-background mt-2 min-h-32 w-full rounded-2xl border p-4 text-sm leading-6"
          placeholder="I completed…, spoke with…, built…, tested…"
        />
      </div>
      <div>
        <label htmlFor="proofText" className="text-sm font-semibold">
          What proof exists?
        </label>
        <p className="text-muted mt-1 text-sm">
          Record what another person, result or artefact can honestly confirm.
        </p>
        <textarea
          id="proofText"
          name="proofText"
          required
          minLength={20}
          maxLength={2000}
          className="border-border bg-background mt-2 min-h-32 w-full rounded-2xl border p-4 text-sm leading-6"
          placeholder="The proof is…, the response was…, the measured result was…"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="proofLink" className="text-sm font-semibold">
            Relevant proof link <span className="text-muted">(optional)</span>
          </label>
          <input
            id="proofLink"
            name="proofLink"
            type="url"
            maxLength={500}
            placeholder="https://…"
            className="border-border bg-background mt-2 min-h-11 w-full rounded-xl border px-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="nextStep" className="text-sm font-semibold">
            What is the next practical action?
          </label>
          <input
            id="nextStep"
            name="nextStep"
            required
            minLength={10}
            maxLength={1000}
            placeholder="Next I will…"
            className="border-border bg-background mt-2 min-h-11 w-full rounded-xl border px-3 text-sm"
          />
        </div>
      </div>
      <label className="border-gold/20 bg-gold/5 flex items-start gap-3 rounded-2xl border p-4 text-sm">
        <input
          name="marksMilestoneComplete"
          type="checkbox"
          className="mt-1 h-4 w-4"
        />
        <span>
          <strong className="block">
            This milestone is genuinely complete
          </strong>
          <span className="text-muted mt-1 block leading-6">
            Select this only when the completion signal above is true. Otherwise
            this update will preserve progress and keep the milestone active.
          </span>
        </span>
      </label>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving Project progress…" : "Record Progress and Proof"}
        </Button>
        {pending ? (
          <p role="status" className="text-muted mt-3 text-sm">
            Preserving this update privately…
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
