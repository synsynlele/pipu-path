"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateMissionAction,
  type MissionFormState,
} from "../application/mission-actions";

const initialState: MissionFormState = { status: "idle" };

export function MissionGenerationForm({
  kind,
  attemptsRemaining,
}: {
  kind: "initial" | "regenerate";
  attemptsRemaining: number;
}) {
  const [state, action, pending] = useActionState(
    generateMissionAction,
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
          ? "PipuPath is shaping a practical mission from your profile…"
          : kind === "initial"
            ? "Generate My Mission"
            : "Generate Another"}
      </Button>
      {pending ? (
        <p className="text-muted mt-4 text-sm leading-6" role="status">
          PipuPath is shaping a practical mission from your profile…
        </p>
      ) : null}
      <p className="text-muted mt-3 text-xs">
        {attemptsRemaining} of 3 generation attempts remaining.
      </p>
      {state.status === "error" ? (
        <p className="text-error mt-4 text-sm leading-6" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
