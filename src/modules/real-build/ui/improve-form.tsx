"use client";
import { useState, useTransition } from "react";
import { improveRealBuild } from "../application/actions";
export function ImproveBuildForm({ id }: { id: string }) {
  const [pending, startTransition] = useTransition(),
    [message, setMessage] = useState("");
  return (
    <form
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            const result = await improveRealBuild(
              { ok: false, message: "" },
              form,
            );
            setMessage(result.message);
          } catch {
            setMessage(
              "Your next attempt could not be opened. Your saved work is safe. Try again.",
            );
          }
        });
      }}
      aria-busy={pending}
    >
      <input type="hidden" name="id" value={id} />
      <button className="build-primary w-full" disabled={pending}>
        {pending ? "Opening a fresh attempt…" : "Try my improvement →"}
      </button>
      {message ? (
        <p role="alert" className="mt-3 text-sm text-[#b42338]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
