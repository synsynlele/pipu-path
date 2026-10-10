"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/modules/identity/application/form-state";
import { requestAccountDeletion } from "../application/deletion-actions";

export function DeletionRequestForm() {
  const [state, action, pending] = useActionState(
    requestAccountDeletion,
    initialFormState,
  );
  return (
    <form action={action} className="mt-6 space-y-5" aria-busy={pending}>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="confirm"
          required
          disabled={pending || state.status === "success"}
          className="mt-1 size-5 shrink-0"
        />
        <span>
          I request deletion of my PipuPath account and associated data. This
          sends a request; it does not delete my account immediately.
        </span>
      </label>
      <Button type="submit" disabled={pending || state.status === "success"}>
        {pending
          ? "Saving request…"
          : state.status === "success"
            ? "Request saved"
            : "Request account deletion"}
      </Button>
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="text-sm leading-6 break-words"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
