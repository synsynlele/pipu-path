"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateQuestPackAction,
  type QuestFormState,
} from "../application/quest-actions";

const initialState: QuestFormState = { status: "idle" };

export function QuestGenerationForm({
  attemptsRemaining,
}: {
  attemptsRemaining: number;
}) {
  const [state, action, pending] = useActionState(
    generateQuestPackAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending}>
      <Button type="submit" disabled={pending || attemptsRemaining < 1}>
        {pending ? "Shaping your Quest pack…" : "Generate My First Quests"}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-4 text-sm">
          PipuPath is creating three practical HQLS Quests from this milestone…
        </p>
      ) : null}
      <p className="text-muted mt-3 text-xs">
        {attemptsRemaining} of 3 safe generation attempts remaining.
      </p>
      {state.status === "error" ? (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
