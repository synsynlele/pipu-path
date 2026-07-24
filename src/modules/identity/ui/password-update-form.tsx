"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updatePasswordAction } from "../application/auth-actions";
import { initialFormState } from "../application/form-state";

export function PasswordUpdateForm() {
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    initialFormState,
  );
  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium">New password</span>
        <input
          required
          name="password"
          type="password"
          minLength={10}
          autoComplete="new-password"
          className="border-border bg-panel-raised mt-2 min-h-12 w-full rounded-xl border px-3"
        />
      </label>
      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
