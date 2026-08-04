"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  submitQuestEvidenceAction,
  type QuestFormState,
} from "../application/quest-actions";

const initialState: QuestFormState = { status: "idle" };

export function QuestEvidenceForm({
  questId,
  today,
  existingEvidence,
}: {
  questId: string;
  today: string;
  existingEvidence?: {
    evidenceText: string;
    evidenceLink: string | null;
    happenedOn: string;
    hasImage: boolean;
  };
}) {
  const [state, action, pending] = useActionState(
    submitQuestEvidenceAction,
    initialState,
  );

  return (
    <form
      action={action}
      aria-busy={pending}
      encType="multipart/form-data"
      className="mt-6 grid gap-5"
    >
      <input type="hidden" name="questId" value={questId} />
      <div>
        <label htmlFor="evidenceText" className="text-sm font-semibold">
          What proof did you create?
        </label>
        <p className="text-muted mt-1 text-sm">
          Describe what you did, the result and what can honestly be verified.
        </p>
        <textarea
          id="evidenceText"
          name="evidenceText"
          required
          minLength={20}
          maxLength={2000}
          defaultValue={existingEvidence?.evidenceText}
          className="border-border bg-background mt-2 min-h-36 w-full rounded-2xl border p-4 text-sm leading-6"
          placeholder="I created…, tried it with…, and the result was…"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="happenedOn" className="text-sm font-semibold">
            Date of action
          </label>
          <input
            id="happenedOn"
            name="happenedOn"
            type="date"
            required
            max={today}
            defaultValue={existingEvidence?.happenedOn ?? today}
            className="border-border bg-background mt-2 min-h-11 w-full rounded-xl border px-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="evidenceLink" className="text-sm font-semibold">
            Relevant link <span className="text-muted">(optional)</span>
          </label>
          <input
            id="evidenceLink"
            name="evidenceLink"
            type="url"
            maxLength={500}
            defaultValue={existingEvidence?.evidenceLink ?? ""}
            placeholder="https://…"
            className="border-border bg-background mt-2 min-h-11 w-full rounded-xl border px-3 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="evidenceImage" className="text-sm font-semibold">
          Evidence image <span className="text-muted">(optional)</span>
        </label>
        <p className="text-muted mt-1 text-sm">
          JPG, PNG or WebP up to 5 MB. Images remain private.
          {existingEvidence?.hasImage
            ? " Your existing image remains unless a new one is uploaded."
            : ""}
        </p>
        <input
          id="evidenceImage"
          name="evidenceImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="border-border bg-background file:bg-gold mt-2 block w-full rounded-xl border p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:px-3 file:py-2 file:font-semibold file:text-[#100f0c]"
        />
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving private evidence…" : "Submit Evidence"}
        </Button>
        {pending ? (
          <p role="status" className="text-muted mt-3 text-sm">
            Your evidence is being stored privately…
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
