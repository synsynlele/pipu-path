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
      className="grid gap-6"
    >
      <input type="hidden" name="questId" value={questId} />

      <div className="border-primary/15 bg-primary-soft/25 rounded-2xl border p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="border-primary/20 bg-primary-soft text-primary grid size-9 shrink-0 place-items-center rounded-xl border text-sm font-bold"
          >
            1
          </span>
          <div className="min-w-0 flex-1">
            <label htmlFor="evidenceText" className="text-navy text-sm font-semibold">
              Tell the proof story
            </label>
            <p id="evidenceTextHelp" className="text-muted mt-1 text-sm leading-5">
              What did you actually do, what happened, and what could another
              person honestly verify?
            </p>
            <textarea
              id="evidenceText"
              name="evidenceText"
              required
              minLength={20}
              maxLength={2000}
              defaultValue={existingEvidence?.evidenceText}
              aria-describedby="evidenceTextHelp"
              className="border-border bg-background focus:border-primary mt-3 min-h-40 w-full resize-y rounded-2xl border p-4 text-sm leading-6 shadow-sm outline-none transition-colors"
              placeholder="I tried…, the result was…, and the evidence I can point to is…"
            />
            <p className="text-muted mt-2 text-xs">
              Keep it factual. Imperfect attempts still count as useful
              developmental evidence.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="border-border bg-background rounded-2xl border p-4">
          <span className="text-navy text-sm font-semibold">Date of action</span>
          <span className="text-muted mt-1 block text-xs">
            When did the real-world action happen?
          </span>
          <input
            id="happenedOn"
            name="happenedOn"
            type="date"
            required
            max={today}
            defaultValue={existingEvidence?.happenedOn ?? today}
            className="border-border bg-background focus:border-primary mt-3 min-h-11 w-full rounded-xl border px-3 text-sm outline-none transition-colors"
          />
        </label>

        <label className="border-border bg-background rounded-2xl border p-4">
          <span className="text-navy text-sm font-semibold">
            Supporting link <span className="text-muted font-normal">(optional)</span>
          </span>
          <span className="text-muted mt-1 block text-xs">
            Add only a link that genuinely supports the action.
          </span>
          <input
            id="evidenceLink"
            name="evidenceLink"
            type="url"
            maxLength={500}
            defaultValue={existingEvidence?.evidenceLink ?? ""}
            placeholder="https://…"
            className="border-border bg-background focus:border-primary mt-3 min-h-11 w-full rounded-xl border px-3 text-sm outline-none transition-colors"
          />
        </label>
      </div>

      <div className="border-border bg-soft/45 rounded-2xl border border-dashed p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <label htmlFor="evidenceImage" className="text-navy text-sm font-semibold">
              Add a private image <span className="text-muted font-normal">(optional)</span>
            </label>
            <p id="evidenceImageHelp" className="text-muted mt-1 text-sm leading-5">
              A photo or screenshot can strengthen the evidence when it adds
              useful context.
            </p>
          </div>
          <span className="border-success/20 bg-success/8 text-success rounded-full border px-3 py-1 text-xs font-semibold">
            Not public
          </span>
        </div>
        <input
          id="evidenceImage"
          name="evidenceImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby="evidenceImageHelp"
          className="border-border bg-background file:bg-gold file:text-navy mt-4 block w-full rounded-xl border p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:px-3 file:py-2 file:font-semibold"
        />
        <p className="text-muted mt-2 text-xs">
          JPG, PNG or WebP · maximum 5 MB.
          {existingEvidence?.hasImage
            ? " Your existing image remains unless you choose a new one."
            : ""}
        </p>
      </div>

      <div className="border-border flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-navy text-sm font-semibold">Your proof stays private.</p>
          <p className="text-muted mt-1 text-xs leading-5">
            Submitting this unlocks reflection. It does not publish the evidence
            to your Profile, Builder Vault or public proof page.
          </p>
        </div>
        <Button type="submit" disabled={pending} className="min-w-40">
          {pending ? "Securing proof…" : "Submit Proof"}
        </Button>
      </div>

      {pending ? (
        <p
          role="status"
          className="border-primary/15 bg-primary-soft text-primary rounded-xl border px-4 py-3 text-sm"
        >
          PipuPath is storing your evidence privately…
        </p>
      ) : null}
      {state.status === "error" ? (
        <p
          role="alert"
          className="border-error/20 bg-error/5 text-error rounded-xl border px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
