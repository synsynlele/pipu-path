"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
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
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="text-gold font-mono text-sm">
          Something interrupted the path
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          We could not load this page.
        </h1>
        <p className="text-muted mt-3">Try the request once more.</p>
        <Button onClick={reset} className="mt-7">
          Try again
        </Button>
      </div>
    </main>
  );
}
