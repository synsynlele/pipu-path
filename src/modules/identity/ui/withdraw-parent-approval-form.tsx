"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { withdrawParentLearningAttestationAction } from "../application/guardian-actions";

export function WithdrawParentApprovalForm() {
  const [state, action, pending] = useActionState(
    withdrawParentLearningAttestationAction,
    { message: "" },
  );
  return (
    <form action={action} className="space-y-3" aria-busy={pending}>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          name="withdraw"
          required
          className="mt-1 size-5 shrink-0"
        />
        <span>
          I understand that private learning will pause until a parent approves
          again.
        </span>
      </label>
      {state.message ? <p role="alert">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Withdrawing…" : "Withdraw parent approval"}
      </Button>
    </form>
  );
}
