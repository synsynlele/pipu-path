"use client";
import { useState, useTransition } from "react";
import { tailorReviewedBuild } from "../application/actions";

export function TailorReviewedButton({ id }: { id: string }) {
  const [working, setWorking] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const busy = working || pending;
  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        disabled={busy}
        className="build-primary flex min-h-11 w-full items-center justify-center gap-2"
        onClick={() => {
          if (busy) return;
          setMessage("");
          setWorking(true);
          const form = new FormData();
          form.set("id", id);
          startTransition(async () => {
            try {
              const response = await tailorReviewedBuild(
                { ok: false, message: "" },
                form,
              );
              setMessage(response.message);
            } catch {
              setMessage(
                "The connection was interrupted. Your original Quest is unchanged.",
              );
            } finally {
              setWorking(false);
            }
          });
        }}
      >
        {busy ? (
          <>
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-full border-[3px] border-white border-t-transparent motion-reduce:animate-none"
            />
            AI is tailoring your Quest…
          </>
        ) : (
          "Make this Quest fit my exact goal with AI →"
        )}
      </button>
      <p className="text-xs leading-5 text-[#536883]">
        AI is attempted only when you choose this. If AI cannot create a safe
        goal-specific Quest, your current starter stays unchanged. An AI request
        counts toward your usage limit.
      </p>
      {message ? (
        <p role="alert" className="text-sm text-[#ad293e]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
