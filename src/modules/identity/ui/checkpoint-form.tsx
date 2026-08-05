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
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium">Preferred name</span>
        <input
          required
          name="preferred_name"
          maxLength={80}
          autoComplete="nickname"
          className="border-border focus:border-primary mt-2 min-h-12 w-full rounded-xl border bg-white px-3 shadow-sm transition-colors"
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
          className="border-border focus:border-primary mt-2 min-h-12 w-full rounded-xl border bg-white px-3 shadow-sm transition-colors"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Age band</span>
        <select
          required
          name="age_band"
          defaultValue=""
          className="border-border focus:border-primary mt-2 min-h-12 w-full rounded-xl border bg-white px-3 shadow-sm transition-colors"
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
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Complete identity checkpoint"}
      </Button>
    </form>
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
