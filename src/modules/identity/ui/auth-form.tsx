"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { initialFormState, type FormState } from "../application/form-state";

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;

export function AuthForm({
  action,
  submitLabel,
  password = true,
  next,
}: {
  action: Action;
  submitLabel: string;
  password?: boolean;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="block">
        <span className="text-sm font-medium">Email address</span>
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="border-border focus:border-primary mt-2 min-h-12 w-full rounded-xl border bg-white px-3 shadow-sm transition-colors"
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        {state.fieldErrors?.email ? (
          <span id="email-error" className="text-error text-sm">
            Enter a valid email address.
          </span>
        ) : null}
      </label>
      {password ? (
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            required
            name="password"
            type="password"
            minLength={10}
            autoComplete="current-password"
            className="border-border focus:border-primary mt-2 min-h-12 w-full rounded-xl border bg-white px-3 shadow-sm transition-colors"
          />
          <span className="text-muted mt-1 block text-xs">
            Use at least 10 characters.
          </span>
        </label>
      ) : null}
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={state.status === "error" ? "text-error" : "text-success"}
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : submitLabel}
      </Button>
    </form>
  );
}
