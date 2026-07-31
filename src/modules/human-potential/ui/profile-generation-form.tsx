"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateProfileAction,
  type ProfileGenerationFormState,
} from "../application/profile-actions";

const initialState: ProfileGenerationFormState = { status: "idle" };

export function ProfileGenerationForm() {
  const [state, action, pending] = useActionState(
    generateProfileAction,
    initialState,
  );
  return (
    <form action={action} aria-busy={pending}>
      <Button type="submit" disabled={pending}>
        {pending
          ? "PipuPath is analysing your Discovery responses…"
          : "Generate my profile"}
      </Button>
      {pending ? (
        <p className="text-muted mt-4 text-sm leading-6" role="status">
          PipuPath is analysing your Discovery responses…
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="mt-4 text-sm leading-6 text-red-300" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
