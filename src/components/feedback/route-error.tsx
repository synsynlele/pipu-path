"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";

export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("route_render_failed", { digest: error.digest });
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-12 text-center">
      <div className="max-w-xl">
        <span
          className="bg-error/10 text-error mx-auto grid size-12 place-items-center rounded-2xl text-xl font-bold"
          aria-hidden="true"
        >
          !
        </span>
        <p className="text-error mt-5 text-xs font-semibold tracking-[0.16em] uppercase">
          Safe interruption
        </p>
        <h1 className="text-navy mt-3 text-4xl font-semibold tracking-tight">
          We could not load this part of your path.
        </h1>
        <p className="text-muted mt-4 leading-7">
          Your saved progress has not been changed. Try again, or return Home
          and continue from the current stage.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/app" variant="secondary">
            Return Home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
