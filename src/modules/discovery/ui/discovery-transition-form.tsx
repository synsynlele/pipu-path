"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  initialDiscoveryFormState,
  type DiscoveryFormState,
} from "../application/discovery-form-state";

type TransitionAction = (
  previous: DiscoveryFormState,
  formData: FormData,
) => Promise<DiscoveryFormState>;

export function DiscoveryTransitionForm({
  action,
  sessionId,
  version,
  label,
  pendingLabel,
}: {
  action: TransitionAction;
  sessionId: string;
  version: number;
  label: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialDiscoveryFormState,
  );
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success" && state.destination)
      router.replace(state.destination);
  }, [router, state.destination, state.status]);
  return (
    <form action={formAction}>
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="expected_version" value={version} />
      {state.message ? (
        <p role="alert" className="mb-4 text-[var(--color-danger)]">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? pendingLabel : label}
      </Button>
    </form>
  );
}
