"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  completeQuestAction,
  type QuestFormState,
} from "../application/quest-actions";

const initialState: QuestFormState = { status: "idle" };
const fields = [
  ["whatIDid", "What did you try?", "I tried…"],
  ["whatHappened", "What happened?", "The result was…"],
  ["whatILearned", "What did you learn?", "I discovered…"],
  ["whatIWillChange", "What is your next move?", "Next time, I will…"],
  [
    "nortnspoilReflection",
    "What helps you keep going?",
    "Nothing spoil because…",
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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [name, label, placeholder] = fields[step];
  const ready = (answers[name] ?? "").trim().length >= 20;
  const final = step === fields.length - 1;

  function next() {
    if (!ready) {
      setError("Add a short, specific answer (at least 20 characters).");
      return;
    }
    setError("");
    setStep(step + 1);
  }

  return (
    <form
      action={action}
      aria-busy={pending}
      className="mt-6 grid gap-5"
      onSubmit={(event) => {
        if (!final) {
          event.preventDefault();
          next();
        } else if (
          fields.some(([key]) => (answers[key] ?? "").trim().length < 20)
        ) {
          event.preventDefault();
          setError("Answer each reflection before completing the Quest.");
        }
      }}
    >
      <input type="hidden" name="questId" value={questId} />
      {fields
        .filter(([key]) => key !== name)
        .map(([key]) => (
          <input
            key={key}
            type="hidden"
            name={key}
            value={answers[key] ?? ""}
          />
        ))}
      <p className="text-primary text-sm font-semibold" role="status">
        Reflection {step + 1} of {fields.length}
      </p>
      <div>
        {final ? (
          <p className="text-gold mb-2 text-xs font-semibold">
            Nortnspoil reflection
          </p>
        ) : null}
        <label htmlFor={name} className="text-navy text-xl font-semibold">
          {label}
        </label>
        <p className="text-muted mt-2 text-sm">
          A couple of honest sentences is enough.
        </p>
        <textarea
          key={name}
          id={name}
          name={name}
          required
          minLength={20}
          maxLength={1200}
          value={answers[name] ?? ""}
          placeholder={placeholder}
          rows={3}
          onChange={(event) => {
            setAnswers({ ...answers, [name]: event.target.value });
            setError("");
          }}
          className="border-border bg-background mt-3 min-h-28 w-full rounded-2xl border p-4 text-base leading-6"
        />
        {prompts[step] && !final ? (
          <details className="text-muted mt-2 text-sm">
            <summary className="cursor-pointer">Need a hint?</summary>
            <p className="mt-2">{prompts[step]}</p>
          </details>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {step > 0 ? (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setStep(step - 1);
              setError("");
            }}
          >
            Back
          </Button>
        ) : null}
        {final ? (
          <Button type="submit" disabled={pending || !ready}>
            {pending ? "Saving your progress…" : "Complete Quest →"}
          </Button>
        ) : (
          <Button type="button" disabled={pending} onClick={next}>
            Next →
          </Button>
        )}
      </div>
      <p className="text-muted text-xs">
        These answers are saved when you complete the Quest. Keep this page open
        until then.
      </p>
      {state.status === "error" ? (
        <p role="alert" className="text-error text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
