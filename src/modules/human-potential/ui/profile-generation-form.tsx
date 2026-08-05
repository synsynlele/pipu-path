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
    <>
      <form action={action} aria-busy={pending}>
        <Button type="submit" disabled={pending} className="gap-2">
          {pending ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Analysing your responses…
            </>
          ) : (
            "Generate my profile"
          )}
        </Button>
        {pending ? (
          <p className="text-muted mt-4 text-sm leading-6" role="status">
            PipuPath is analysing your Discovery responses. This can take up to
            a minute.
          </p>
        ) : null}
        {state.status === "error" ? (
          <p className="text-error mt-4 text-sm leading-6" role="alert">
            {state.message}
          </p>
        ) : null}
      </form>

      {pending ? (
        <div
          className="bg-background/85 fixed inset-0 z-[100] grid place-items-center px-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="border-border bg-panel max-w-md rounded-3xl border px-7 py-8 text-center shadow-2xl">
            <span
              aria-hidden="true"
              className="border-primary-soft border-t-primary mx-auto block size-12 animate-spin rounded-full border-4"
            />
            <p className="text-navy mt-5 text-lg font-semibold">
              Building your Human Potential Profile…
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              PipuPath is connecting the evidence in your Discovery answers.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
