"use client";

import { useActionState, useEffect, useState } from "react";
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

  return (
    <form
      action={action}
      className="mt-5"
      aria-busy={pending}
      data-economic-path-selected={selected ? "true" : "false"}
    >
      <input type="hidden" name="recommendationId" value={recommendationId} />
      <input type="hidden" name="pathKey" value={pathKey} />
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
      {state.status === "error" ? (
        <p role="alert" className="text-error mt-3 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
