"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  generateQuestPackAction,
  type QuestFormState,
} from "../application/quest-actions";

const initialState: QuestFormState = { status: "idle" };

export function QuestGenerationForm({
  attemptsRemaining,
  autoStart = false,
}: {
  attemptsRemaining: number;
  autoStart?: boolean;
}) {
  const [state, action, pending] = useActionState(
    generateQuestPackAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (
      autoStart &&
      attemptsRemaining > 0 &&
      !startedRef.current &&
      state.status === "idle"
    ) {
      startedRef.current = true;
      formRef.current?.requestSubmit();
    }
  }, [autoStart, attemptsRemaining, state.status]);

  return (
    <form ref={formRef} action={action} aria-busy={pending}>
      <Button type="submit" disabled={pending || attemptsRemaining < 1}>
        {pending
          ? "Shaping your Quest pack…"
          : state.status === "error"
            ? "Retry Quest Generation"
            : autoStart
              ? "Prepare Quests Now"
              : "Generate My First Quests"}
      </Button>
      {pending || (autoStart && state.status === "idle") ? (
        <p role="status" className="text-muted mt-4 text-sm">
          PipuPath is creating three practical HQLS Quests from this milestone…
        </p>
      ) : null}
      <p className="text-muted mt-3 text-xs">
        {attemptsRemaining} of 3 safe generation attempts remaining.
      </p>
      {state.status === "error" ? (
        <p role="alert" className="text-error mt-4 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
