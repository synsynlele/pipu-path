"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { completeIdentityAction } from "../application/checkpoint-actions";
import { initialFormState } from "../application/form-state";

const bands = [
  ["under_13", "Under 13"],
  ["13_15", "13–15"],
  ["16_17", "16–17"],
  ["18_24", "18–24"],
  ["25_plus", "25 or older"],
] as const;

export function CheckpointForm() {
  const [state, action, pending] = useActionState(
    completeIdentityAction,
    initialFormState,
  );
  return (
    <>
      <form action={action} className="space-y-5" aria-busy={pending}>
        <label className="block">
          <span className="text-sm font-medium">Preferred name</span>
          <input
            required
            name="preferred_name"
            maxLength={80}
            autoComplete="nickname"
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-panel-raised px-3 shadow-sm transition-colors focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Username</span>
          <input
            required
            name="username"
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z][A-Za-z0-9_]{2,29}"
            autoComplete="username"
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-panel-raised px-3 shadow-sm transition-colors focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Age band</span>
          <select
            required
            name="age_band"
            defaultValue=""
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-panel-raised px-3 shadow-sm transition-colors focus:border-primary"
          >
            <option value="" disabled>
              Select an age band
            </option>
            {bands.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="space-y-3">
          <legend className="font-medium">Required agreements</legend>
          <Consent name="accept_terms">
            I accept the <Link href="/terms">Terms</Link>.
          </Consent>
          <Consent name="accept_privacy">
            I accept the <Link href="/privacy">Privacy Notice</Link>.
          </Consent>
          <Consent name="accept_ai">
            I consent to the documented use of AI processing in later stages.
          </Consent>
        </fieldset>
        {state.message ? (
          <p role="alert" className="text-error">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full gap-2">
          {pending ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Saving your identity…
            </>
          ) : (
            "Complete identity checkpoint"
          )}
        </Button>
      </form>

      {pending ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-background/85 px-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex max-w-md items-center gap-4 rounded-2xl border border-border bg-panel px-6 py-5 shadow-2xl">
            <span
              aria-hidden="true"
              className="size-7 animate-spin rounded-full border-2 border-primary-soft border-t-primary"
            />
            <p className="font-semibold">
              Saving your identity and preparing Discovery…
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Consent({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input required type="checkbox" name={name} className="mt-1 size-5" />
      <span>{children}</span>
    </label>
  );
}
