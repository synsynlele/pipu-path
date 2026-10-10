"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Reading navigation only. Progress is awarded by the server after evidence/reflection. */
export function QuestActionGuide({ steps }: { steps: string[] }) {
  const [index, setIndex] = useState(0);
  if (!steps.length) return null;
  return (
    <div className="mt-4">
      <p className="text-primary text-xs font-semibold" role="status">
        Action {index + 1} of {steps.length}
      </p>
      <p className="text-navy mt-3 text-lg leading-7" aria-live="polite">
        {steps[index]}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Previous action
        </Button>
        <Button
          disabled={index === steps.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Next action
        </Button>
      </div>
      <details className="mt-4">
        <summary className="text-muted cursor-pointer text-sm">
          See all actions
        </summary>
        <ol className="text-muted mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          {steps.map((step, position) => (
            <li key={position}>{step}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
