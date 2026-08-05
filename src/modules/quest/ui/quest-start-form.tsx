"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  startQuestAction,
  type QuestFormState,
} from "../application/quest-actions";

const initialState: QuestFormState = { status: "idle" };

export function QuestStartForm({ questId }: { questId: string }) {
  const [state, action, pending] = useActionState(
    startQuestAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="questId" value={questId} />
      <Button type="submit" disabled={pending}>
        {pending ? "Opening focus mode…" : "Start This Quest"}
      </Button>
      {state.status === "error" ? (
        <p role="alert" className="text-error mt-4 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
