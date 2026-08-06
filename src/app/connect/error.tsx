"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function ConnectError({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="Builder Connect could not load"
      description="Your private Journey and network data remain safe. Retry the page when ready."
      onRetry={reset}
    />
  );
}
