"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateMissionAction,
  type MissionFormState,
} from "../application/mission-actions";

const initialState: MissionFormState = { status: "idle" };

export function MissionRefinementForm({
  missionId,
  attemptsRemaining,
}: {
  missionId: string;
  attemptsRemaining: number;
}) {
  const [state, action, pending] = useActionState(
    generateMissionAction,
    initialState,
  );
  return (
    <form action={action} className="mt-6" aria-busy={pending}>
      <input type="hidden" name="kind" value="refine" />
      <input type="hidden" name="sourceMissionId" value={missionId} />
      <label htmlFor="refinementInstruction" className="text-sm font-semibold">
        Refine this mission
      </label>
      <textarea
        id="refinementInstruction"
        name="refinementInstruction"
        required
        minLength={3}
        maxLength={240}
        placeholder="For example: Make it possible without money"
        className="border-border bg-background mt-2 min-h-24 w-full rounded-xl border p-3 text-sm"
      />
      <Button
        type="submit"
        variant="secondary"
        className="mt-3"
        disabled={pending || attemptsRemaining < 1}
      >
        {pending ? "Refining mission…" : "Refine Mission"}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-3 text-sm">
          PipuPath is refining your practical mission…
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
