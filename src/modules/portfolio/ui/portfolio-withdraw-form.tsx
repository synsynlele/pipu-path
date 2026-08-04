"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  withdrawProjectPortfolioAction,
  type PortfolioFormState,
} from "../application/portfolio-actions";

const initialState: PortfolioFormState = { status: "idle" };

export function PortfolioWithdrawForm({
  portfolioId,
  projectId,
}: {
  portfolioId: string;
  projectId: string;
}) {
  const [state, action, pending] = useActionState(
    withdrawProjectPortfolioAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="portfolioId" value={portfolioId} />
      <input type="hidden" name="projectId" value={projectId} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Removing public access…" : "Withdraw Public Proof"}
      </Button>
      {state.status === "error" ? (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
