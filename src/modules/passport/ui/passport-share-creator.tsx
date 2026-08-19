"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createPassportShareAction,
  type PassportShareActionState,
} from "../application/passport-actions";

const initialState: PassportShareActionState = {
  error: null,
  relativeUrl: null,
};

export function PassportShareCreator({ passportId }: { passportId: string }) {
  const [state, action, pending] = useActionState(
    createPassportShareAction,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!state.relativeUrl) return;
    try {
      const absoluteUrl = new URL(
        state.relativeUrl,
        window.location.origin,
      ).toString();
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border p-5">
      <h3 className="font-semibold">Create a private share</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        PipuPath stores only a hash of the secret in this share. The secret is
        returned only in this response; if you lose it, create a new share.
      </p>

      <form
        action={action}
        className="mt-5 grid min-w-0 gap-4 md:grid-cols-[1fr_auto_auto]"
        onSubmit={() => setCopied(false)}
      >
        <input name="passportId" type="hidden" value={passportId} />
        <label className="min-w-0 space-y-2">
          <span className="block text-sm font-medium">Share label</span>
          <input
            className="bg-background w-full min-w-0 rounded-xl border px-3 py-2.5 text-base sm:text-sm"
            maxLength={80}
            name="label"
            placeholder="Scholarship application"
          />
        </label>
        <label className="min-w-0 space-y-2">
          <span className="block text-sm font-medium">Expires</span>
          <select
            className="bg-background w-full min-w-0 rounded-xl border px-3 py-2.5 text-base sm:text-sm"
            defaultValue="7"
            name="expiresInDays"
          >
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </label>
        <Button
          className="w-full touch-manipulation self-end md:w-auto"
          disabled={pending}
          type="submit"
        >
          {pending ? "Creating…" : "Create share"}
        </Button>
      </form>

      {state.error ? (
        <p className="mt-4 text-sm font-medium">{state.error}</p>
      ) : null}

      {state.relativeUrl ? (
        <div className="mt-5 rounded-xl border p-4">
          <p className="text-sm font-medium">Copy this share now</p>
          <p className="text-muted-foreground mt-1 text-xs">
            The fragment after # is the bearer secret. The field below shows the
            private path; Copy link writes the complete URL including this
            site&apos;s origin.
          </p>
          <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row">
            <input
              className="bg-background min-w-0 flex-1 rounded-lg border px-3 py-2 text-base sm:text-sm"
              readOnly
              value={state.relativeUrl}
            />
            <Button
              variant="secondary"
              className="w-full touch-manipulation sm:w-auto"
              onClick={copyLink}
              type="button"
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
