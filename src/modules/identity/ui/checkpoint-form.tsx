"use client";

import { useActionState, useState, useEffect, useRef } from "react";
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
  const [ageBand, setAgeBand] = useState("");
  const ageSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    // Reapply the controlled selection after a server-action form reset.
    if (ageSelect.current) ageSelect.current.value = ageBand;
  }, [state, pending, ageBand]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [editedUsername, setEditedUsername] = useState(false);
  const minorSelected = ["under_13", "13_15", "16_17"].includes(ageBand);
  const adultSelected = ["18_24", "25_plus"].includes(ageBand);
  return (
    <>
      <form action={action} className="space-y-5" aria-busy={pending}>
        <label className="block">
          <span className="text-sm font-medium">What should we call you?</span>
          <input
            required
            name="preferred_name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!editedUsername)
                setUsername(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "")
                    .replace(/^[^a-z]+/, "")
                    .slice(0, 24),
                );
            }}
            maxLength={80}
            autoComplete="nickname"
            className="border-border bg-panel-raised focus:border-primary mt-2 min-h-12 w-full rounded-xl border px-3 shadow-sm transition-colors"
          />
        </label>
        <label className="block">
          <span id="username-label" className="text-sm font-medium">
            Username
          </span>
          <input
            required
            name="username"
            value={username}
            onChange={(event) => {
              setEditedUsername(true);
              setUsername(event.target.value);
            }}
            aria-labelledby="username-label"
            aria-describedby="username-help"
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z][A-Za-z0-9_]{2,29}"
            autoComplete="username"
            className="border-border bg-panel-raised focus:border-primary mt-2 min-h-12 w-full rounded-xl border px-3 shadow-sm transition-colors"
          />
          <span
            id="username-help"
            className="text-muted mt-2 block text-xs leading-5"
          >
            Your account name: 3–30 letters, numbers or underscores, starting
            with a letter. You can edit this suggestion.
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Your age group</span>
          <select
            required
            name="age_band"
            ref={ageSelect}
            value={ageBand}
            onChange={(event) => setAgeBand(event.target.value)}
            className="border-border bg-panel-raised focus:border-primary mt-2 min-h-12 w-full rounded-xl border px-3 shadow-sm transition-colors"
          >
            <option value="" disabled>
              Choose your age group
            </option>
            {bands.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="space-y-3">
          <legend className="font-medium">Your privacy choices</legend>
          <Consent name="accept_terms">
            I accept the <Link href="/terms">Terms</Link>.
          </Consent>
          <Consent name="accept_privacy">
            I accept the <Link href="/privacy">Privacy Notice</Link>.
          </Consent>
          {adultSelected ? (
            <Consent name="accept_ai">
              I agree to AI processing of my answers to help create my profile
              and challenges, as explained in the Privacy Notice.
            </Consent>
          ) : null}
          {minorSelected ? (
            <div className="border-border bg-panel-raised rounded-xl border p-4 text-sm leading-6">
              <p className="font-semibold">
                A parent or legal guardian must approve this account.
              </p>
              <p className="text-muted mt-1">
                Under-18 accounts do not use external AI providers at launch.
                After this step, hand this device to your parent or legal
                guardian so they can approve private learning. They do not need
                their own account.
              </p>
            </div>
          ) : null}
        </fieldset>
        {state.message ? (
          <p role="alert" className="text-error">
            {state.message} Check your privacy choices again before retrying.
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full gap-2">
          {pending ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Saving your setup…
            </>
          ) : (
            "Save and continue →"
          )}
        </Button>
      </form>
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
