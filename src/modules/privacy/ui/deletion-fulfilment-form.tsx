"use client";
import { useActionState } from "react";
import { fulfilAccountDeletion } from "../application/deletion-actions";
import type { FormState } from "@/modules/identity/application/form-state";

export function DeletionFulfilmentForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(fulfilAccountDeletion, {
    status: "idle",
  } as FormState);
  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="request_id" value={requestId} />
      <p className="leading-7">
        This permanently removes the reviewed account’s active data and files.
        Shared conversations and collaborations may disappear. Failed runs can
        leave the account suspended or partly processed; retry the same request.
      </p>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="review_complete"
          required
          disabled={pending}
          className="mt-1 size-5"
        />
        <span>
          I verified ownership, reviewed shared data and safeguarding, and
          explained the approved retention policy. No unresolved hold remains.
        </span>
      </label>
      <label className="block">
        Confirm request ID
        <input
          name="confirm_request_id"
          required
          disabled={pending}
          autoComplete="off"
          className="mt-2 block min-h-11 w-full rounded-lg border border-white/30 bg-transparent p-3"
        />
      </label>
      <button
        type="submit"
        disabled={pending || state.status === "success"}
        className="min-h-11 rounded-lg border border-white/30 px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Processing deletion…" : "Permanently process deletion"}
      </button>
      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
