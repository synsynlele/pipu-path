"use client";
import { useState, useTransition } from "react";
import type { BuildDraft } from "../domain/build";
import { improveRealBuild } from "../application/actions";
export function ImproveBuildForm({
  id,
  draft,
}: {
  id: string;
  draft: BuildDraft;
}) {
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
      <h3 className="font-bold">Keep building this solution</h3>
      <p className="mt-2 text-sm leading-6 text-[#77788e]">
        AI will use this Quest and your saved written result, lesson and next
        change to plan your next five stages. If it did not work, the next step
        can help you fix it. Your earlier work stays saved.
      </p>
      <details className="mt-3 text-sm leading-6">
        <summary className="cursor-pointer font-bold">
          Review the notes AI will use
        </summary>
        <p className="mt-3 whitespace-pre-wrap">
          <strong>What I did: </strong>
          {draft.evidence}
        </p>
        <p className="mt-2">
          <strong>Reported result: </strong>
          {draft.outcome === "worked"
            ? "Worked"
            : draft.outcome === "partly"
              ? "Partly worked"
              : "Did not work yet"}
        </p>
        <p className="mt-2 whitespace-pre-wrap">
          <strong>What I learned: </strong>
          {draft.reflection}
        </p>
        <p className="mt-2 whitespace-pre-wrap">
          <strong>Next change: </strong>
          {draft.nextChange}
        </p>
      </details>
      <label className="mt-4 flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          name="useNotes"
          value="yes"
          required
          className="mt-1 !min-h-5 !w-5 shrink-0"
        />
        <span>
          Use my written notes with AI to plan the continuation. They contain no
          names or private details. Photos and evidence links are excluded.
        </span>
      </label>
      <button className="build-primary mt-4 w-full" disabled={pending}>
        {pending
          ? "Planning my next step…"
          : "Continue this solution with AI →"}
      </button>
      {pending ? (
        <p role="status" className="mt-3 text-sm">
          AI is reading your result and preparing the next five stages. Keep
          this page open.
        </p>
      ) : null}
      {message ? (
        <p role="alert" className="mt-3 text-sm text-[#b42338]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
