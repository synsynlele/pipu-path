"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  completeQuestAction,
  type QuestFormState,
} from "../application/quest-actions";

const initialState: QuestFormState = { status: "idle" };
const fields = [
  [
    "whatIDid",
    "What did you do?",
    "Describe the action you took in your own words.",
  ],
  [
    "whatHappened",
    "What happened?",
    "Describe the real response, result or difficulty you observed.",
  ],
  [
    "whatILearned",
    "What did you learn?",
    "Name the capability, insight or truth this action revealed.",
  ],
  [
    "whatIWillChange",
    "What will you do differently next time?",
    "Choose one specific improvement for your next Quest.",
  ],
] as const;

export function QuestReflectionForm({
  questId,
  prompts,
}: {
  questId: string;
  prompts: string[];
}) {
  const [state, action, pending] = useActionState(
    completeQuestAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending} className="mt-6 grid gap-6">
      <input type="hidden" name="questId" value={questId} />
      {fields.map(([name, label, placeholder], index) => (
        <div key={name}>
          <label htmlFor={name} className="text-sm font-semibold">
            {label}
          </label>
          {prompts[index] ? (
            <p className="text-muted mt-1 text-sm">{prompts[index]}</p>
          ) : null}
          <textarea
            id={name}
            name={name}
            required
            minLength={20}
            maxLength={1200}
            placeholder={placeholder}
            className="border-border bg-background mt-2 min-h-28 w-full rounded-2xl border p-4 text-sm leading-6"
          />
        </div>
      ))}
      <div className="border-gold/20 bg-gold/5 rounded-2xl border p-5">
        <label
          htmlFor="nortnspoilReflection"
          className="text-gold text-sm font-semibold"
        >
          Nortnspoil reflection
        </label>
        <p className="text-muted mt-2 text-sm leading-6">
          What did this Quest prove about your ability to continue, adapt or
          begin again even when the result was imperfect?
        </p>
        <textarea
          id="nortnspoilReflection"
          name="nortnspoilReflection"
          required
          minLength={20}
          maxLength={1200}
          placeholder="Nothing spoil because…"
          className="border-border bg-background mt-3 min-h-28 w-full rounded-2xl border p-4 text-sm leading-6"
        />
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Completing Quest…" : "Complete Quest and Earn 50 XP"}
        </Button>
        {pending ? (
          <p role="status" className="text-muted mt-3 text-sm">
            PipuPath is recording your reflection and verified progress…
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
