"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateEconomicPathwaysAction,
  type EconomicPathwayFormState,
} from "../application/economic-pathway-actions";

const initialState: EconomicPathwayFormState = { status: "idle" };

export function EconomicPathwayGenerationForm() {
  const [state, action, pending] = useActionState(
    generateEconomicPathwaysAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending}>
      <Button type="submit" disabled={pending}>
        {pending ? "Exploring possible paths…" : "Explore Possible Paths"}
      </Button>
      {pending ? (
        <p role="status" className="text-muted mt-3 text-sm">
          Connecting your profile evidence to realistic paths you can test…
        </p>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="text-error mt-3 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
