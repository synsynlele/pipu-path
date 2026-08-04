"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateJourneyAction,
  type JourneyFormState,
} from "../application/journey-actions";
const initialState: JourneyFormState = { status: "idle" };
export function JourneyRefinementForm({
  journeyId,
  attemptsRemaining,
}: {
  journeyId: string;
  attemptsRemaining: number;
}) {
  const [state, action, pending] = useActionState(
    generateJourneyAction,
    initialState,
  );
  return (
    <form action={action} className="mt-6" aria-busy={pending}>
      <input type="hidden" name="kind" value="refine" />
      <input type="hidden" name="sourceJourneyId" value={journeyId} />
      <label htmlFor="journeyRefinement" className="text-sm font-semibold">
        Refine this Journey
      </label>
      <textarea
        id="journeyRefinement"
        name="refinementInstruction"
        required
        minLength={3}
        maxLength={240}
        placeholder="For example: Make every milestone possible without spending money"
        className="border-border bg-background mt-2 min-h-24 w-full rounded-xl border p-3 text-sm"
      />
      <Button
        type="submit"
        variant="secondary"
        className="mt-3"
        disabled={pending || attemptsRemaining < 1}
      >
        {pending ? "Refining Journey…" : "Refine Journey"}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-3 text-sm">
          PipuPath is refining your Journey…
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
