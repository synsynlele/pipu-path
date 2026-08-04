"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  publishProjectPortfolioAction,
  type PortfolioFormState,
} from "../application/portfolio-actions";

const initialState: PortfolioFormState = { status: "idle" };

export function PortfolioPublishForm({
  portfolioId,
  projectId,
}: {
  portfolioId: string;
  projectId: string;
}) {
  const [state, action, pending] = useActionState(
    publishProjectPortfolioAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending} className="mt-6">
      <input type="hidden" name="portfolioId" value={portfolioId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="consentVersion" value="project-portfolio-v1" />
      <label className="border-gold/30 bg-gold/5 flex items-start gap-3 rounded-2xl border p-4 text-sm">
        <input
          name="consentConfirmed"
          type="checkbox"
          required
          className="mt-1 h-4 w-4"
        />
        <span>
          <strong className="block">
            I choose to publish this exact proof
          </strong>
          <span className="text-muted mt-1 block leading-6">
            I confirm that every field is truthful, public-safe and contains no
            private person, contact detail, school identifier, reflection or
            unapproved evidence.
          </span>
        </span>
      </label>
      <Button type="submit" disabled={pending} className="mt-4">
        {pending ? "Publishing selected proof…" : "Publish This Project Proof"}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-3 text-sm">
          Creating the public-safe page…
        </p>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
