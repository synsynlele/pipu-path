"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  selectEconomicPathAction,
  type EconomicPathwayFormState,
} from "../application/economic-pathway-actions";

const initialState: EconomicPathwayFormState = { status: "idle" };

export function PathSelectionForm({
  recommendationId,
  pathKey,
  selected,
}: {
  recommendationId: string;
  pathKey: string;
  selected: boolean;
}) {
  const [state, action, pending] = useActionState(
    selectEconomicPathAction,
    initialState,
  );
  const [hasSelection, setHasSelection] = useState(selected);
  const [confirmingChange, setConfirmingChange] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHasSelection(
        Boolean(
          document.querySelector('form[data-economic-path-selected="true"]'),
        ),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (hasSelection && !selected && !confirmingChange) {
      event.preventDefault();
      setConfirmingChange(true);
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="mt-5"
      aria-busy={pending}
      data-economic-path-selected={selected ? "true" : "false"}
    >
      <input type="hidden" name="recommendationId" value={recommendationId} />
      <input type="hidden" name="pathKey" value={pathKey} />

      {confirmingChange && !selected ? (
        <div className="border-border bg-background rounded-2xl border p-4">
          <p className="text-navy text-sm font-semibold">Change your Path?</p>
          <p className="text-muted mt-2 text-sm leading-6">
            Your current unfinished Mission and Quest will close so you can
            start fresh from this Path. Completed work, proof, reflections, XP
            and Projects stay saved.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Changing path…" : "Yes, Change Path"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={() => setConfirmingChange(false)}
            >
              Keep Current Path
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={pending || selected}
          variant={selected ? "secondary" : "primary"}
          className="w-full sm:w-auto"
        >
          {selected
            ? "Selected Path"
            : pending
              ? "Saving path…"
              : hasSelection
                ? "Change to This Path"
                : "Choose This Path"}
        </Button>
      )}

      {state.status === "error" ? (
        <p role="alert" className="text-error mt-3 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
