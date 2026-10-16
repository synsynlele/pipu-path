"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { recordParentLearningAttestationAction } from "../application/guardian-actions";

export function ParentApprovalForm() {
  const [state, action, pending] = useActionState(
    recordParentLearningAttestationAction,
    { message: "" },
  );
  return (
    <form action={action} className="space-y-5" aria-busy={pending}>
      <p className="text-muted text-sm leading-6">
        Parent or legal guardian: please read and complete this yourself. You do
        not need a separate PipuPath account.
      </p>
      <label className="block">
        <span className="text-sm font-medium">
          Your name (parent or guardian)
        </span>
        <input
          name="parent_name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="off"
          className="border-border bg-panel-raised mt-2 min-h-12 w-full rounded-xl border px-3"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">I am their</span>
        <select
          name="relationship"
          required
          defaultValue=""
          className="border-border bg-panel-raised mt-2 min-h-12 w-full rounded-xl border px-3"
        >
          <option value="" disabled>
            Choose one
          </option>
          <option value="parent">Parent</option>
          <option value="legal_guardian">Legal guardian</option>
        </select>
      </label>
      <p className="text-muted text-sm leading-6">
        This lets them do missions, projects and reflections. Networking and
        external AI are not included in this approval.
      </p>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          name="declaration"
          required
          className="mt-1 size-5 shrink-0"
        />
        <span>
          I am 18 or older and I am this young person’s parent or legal
          guardian. I agree to the{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Notice
          </Link>
          . I approve their private learning on PipuPath and the use of their
          information for these activities.
        </span>
      </label>
      <p className="text-muted text-xs leading-5">
        We save your name, declaration and approval date on this account. This
        records your declaration; it does not independently verify your
        identity. You can withdraw this approval in the account’s privacy
        settings.
      </p>
      {state.message ? (
        <p role="alert" className="text-error text-sm">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving approval…" : "Approve private learning"}
      </Button>
    </form>
  );
}
