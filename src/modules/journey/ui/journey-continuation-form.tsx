"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  continueJourneyAction,
  type JourneyContinuationState,
} from "../application/journey-continuation-action";

const initialState: JourneyContinuationState = { status: "idle" };

export function JourneyContinuationForm({
  sourceJourneyId,
  nextCycleNumber,
  attemptsRemaining,
}: {
  sourceJourneyId: string;
  nextCycleNumber: number;
  attemptsRemaining: number;
}) {
  const [state, action, pending] = useActionState(
    continueJourneyAction,
    initialState,
  );
  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="sourceJourneyId" value={sourceJourneyId} />
      <Button type="submit" disabled={pending || attemptsRemaining < 1}>
        {pending
          ? `Shaping Journey Cycle ${nextCycleNumber}…`
          : `Create Journey Cycle ${nextCycleNumber}`}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-4 text-sm">
          PipuPath is using your completed evidence to create a stronger next
          cycle.
        </p>
      ) : null}
      <p className="text-muted mt-3 text-xs">
        {attemptsRemaining} of 3 continuation attempts remaining.
      </p>
      {state.status === "error" ? (
        <p role="alert" className="text-error mt-4 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
