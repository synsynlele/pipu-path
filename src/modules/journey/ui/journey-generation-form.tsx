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
}: {
  kind: "initial" | "regenerate";
  attemptsRemaining: number;
}) {
  const [state, action, pending] = useActionState(
    generateJourneyAction,
    initialState,
  );
  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="kind" value={kind} />
      <Button
        type="submit"
        variant={kind === "initial" ? "primary" : "secondary"}
        disabled={pending || attemptsRemaining < 1}
      >
        {pending
          ? "PipuPath is shaping your Journeyâ€¦"
          : kind === "initial"
            ? "Generate My Journey"
            : "Generate Another"}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-4 text-sm">
          PipuPath is shaping milestones from your active missionâ€¦
        </p>
      ) : null}
      <p className="text-muted mt-3 text-xs">
        {attemptsRemaining} of 3 generation attempts remaining.
      </p>
      {state.status === "error" ? (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
Ÿ®8