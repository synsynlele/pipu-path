"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateJourneyAction,
  type JourneyFormState,
} from "../application/journey-actions";
const initialState: JourneyFormState = { status: "idle" };
export function JourneyGenerationForm({
  kind,
  attemptsRemaining,
  sourceJourneyId,
}: {
  kind: "initial" | "regenerate" | "continue";
  attemptsRemaining: number;
  sourceJourneyId?: string;
}) {
  const [state, action, pending] = useActionState(
    generateJourneyAction,
    initialState,
  );
  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="kind" value={kind} />
      {sourceJourneyId ? (
        <input type="hidden" name="sourceJourneyId" value={sourceJourneyId} />
      ) : null}
      <Button
        type="submit"
        variant={kind === "regenerate" ? "secondary" : "primary"}
        disabled={pending || attemptsRemaining < 1}
      >
        {pending
          ? "PipuPath is shaping your Journey…"
          : kind === "initial"
            ? "Generate My Journey"
            : kind === "continue"
              ? "Build My Next Journey"
              : "Generate Another"}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-4 text-sm">
          PipuPath is shaping the next evidence-based milestones from your
          mission…
        </p>
      ) : null}
      <p className="text-muted mt-3 text-xs">
        {attemptsRemaining} of 3 generation attempts remaining.
      </p>
      {state.status === "error" ? (
        <p role="alert" className="text-error mt-4 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
