"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import type { DiscoveryAnswer, DiscoveryQuestion } from "../domain/discovery";

export function DiscoveryQuestionForm({
  sessionId,
  version,
  question,
  answer,
  previousHref,
  returnTo = "flow",
}: {
  sessionId: string;
  version: number;
  question: DiscoveryQuestion;
  answer?: DiscoveryAnswer;
  previousHref?: string;
  returnTo?: "flow" | "review";
}) {
  const descriptionId = `${question.stableKey}-description`;
  const errorId = `${question.stableKey}-error`;
  const minimumSelections = question.minSelections ?? 1;
  const maximumSelections = question.maxSelections ?? question.options.length;
  const [selectedCount, setSelectedCount] = useState(
    answer?.selectedOptions?.length ?? 0,
  );
  const [submitting, setSubmitting] = useState(false);
  const multiSelectReady =
    question.responseType !== "multi_select" ||
    (selectedCount >= minimumSelections && selectedCount <= maximumSelections);

  function handleSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (question.responseType !== "multi_select") return;
    const form = event.currentTarget.form;
    const selected = form
      ? form.querySelectorAll<HTMLInputElement>(
          'input[name="selected_options"]:checked',
        ).length
      : 0;
    if (selected > maximumSelections) {
      event.currentTarget.checked = false;
      setSelectedCount(maximumSelections);
      return;
    }
    setSelectedCount(selected);
  }

  return (
    <>
      <form
        action="/api/discovery/save"
        method="post"
        className="space-y-6"
        aria-busy={submitting}
        onSubmit={() => setSubmitting(true)}
      >
        <input type="hidden" name="session_id" value={sessionId} />
        <input type="hidden" name="expected_version" value={version} />
        <input type="hidden" name="question_key" value={question.stableKey} />
        <input type="hidden" name="return_to" value={returnTo} />
        <fieldset className="space-y-5" aria-describedby={descriptionId}>
          <legend className="text-2xl leading-tight font-semibold sm:text-3xl">
            {question.prompt}
          </legend>
          <p id={descriptionId} className="text-muted leading-7">
            {question.supportingText}
            {!question.required ? " You may skip this question." : ""}
          </p>

          {question.responseType === "reflection" ? (
            <div>
              <label htmlFor={question.stableKey} className="sr-only">
                Your answer
              </label>
              <textarea
                id={question.stableKey}
                name="text_response"
                required={question.required}
                maxLength={question.maxTextLength ?? 1200}
                defaultValue={answer?.text ?? ""}
                rows={7}
                className="border-border bg-panel-raised min-h-40 w-full resize-y rounded-xl border p-4 leading-7"
              />
              <p className="text-muted mt-2 text-sm">
                Up to {question.maxTextLength ?? 1200} characters.
              </p>
            </div>
          ) : null}

          {question.responseType === "single_select" ||
          question.responseType === "multi_select" ? (
            <div className="grid gap-3">
              {question.options.map((option) => {
                const selected = answer?.selectedOptions?.includes(option);
                return (
                  <label
                    key={option}
                    className="border-border bg-panel-raised has-checked:border-primary/60 has-checked:bg-primary-soft/70 hover:border-primary/40 flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
                  >
                    <input
                      name="selected_options"
                      type={
                        question.responseType === "single_select"
                          ? "radio"
                          : "checkbox"
                      }
                      value={option}
                      defaultChecked={selected}
                      onChange={handleSelectionChange}
                      required={
                        question.required &&
                        question.responseType === "single_select"
                      }
                      className="mt-1 size-4 accent-[var(--color-gold-400)]"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
              {question.responseType === "multi_select" ? (
                <p className="text-muted text-sm" role="status">
                  {selectedCount} selected. Choose{" "}
                  {minimumSelections === maximumSelections
                    ? minimumSelections
                    : `${minimumSelections}–${maximumSelections}`}
                  .
                </p>
              ) : null}
            </div>
          ) : null}

          {question.responseType === "scale" ? (
            <div className="grid grid-cols-5 gap-2">
              {Array.from(
                {
                  length:
                    (question.maxScale ?? 5) - (question.minScale ?? 1) + 1,
                },
                (_, index) => (question.minScale ?? 1) + index,
              ).map((value) => (
                <label
                  key={value}
                  className="border-border bg-panel-raised has-checked:border-primary/60 has-checked:bg-primary-soft/70 flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-xl border"
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="numeric_response"
                    value={value}
                    required
                    defaultChecked={answer?.numeric === value}
                  />
                  <span className="text-lg font-semibold">{value}</span>
                </label>
              ))}
            </div>
          ) : null}
        </fieldset>

        <p id={errorId} role="status" className="text-muted text-sm">
          Your answer is saved only after the server confirms it.
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <div>
            {previousHref ? (
              <ButtonLink href={previousHref} variant="secondary">
                Previous
              </ButtonLink>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {!question.required ? (
              <Button
                type="submit"
                name="intent"
                value="skip"
                variant="secondary"
                disabled={submitting}
              >
                Skip for now
              </Button>
            ) : null}
            <Button
              type="submit"
              name="intent"
              value="save"
              className="gap-2"
              disabled={submitting || !multiSelectReady}
            >
              {submitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                  />
                  Saving your answer…
                </>
              ) : returnTo === "review" ? (
                "Save edit"
              ) : (
                "Save and continue"
              )}
            </Button>
          </div>
        </div>
      </form>

      {submitting ? (
        <div
          className="bg-background/85 fixed inset-0 z-[100] grid place-items-center px-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="border-border bg-panel flex max-w-md items-center gap-4 rounded-2xl border px-6 py-5 shadow-2xl">
            <span
              aria-hidden="true"
              className="border-primary-soft border-t-primary size-7 animate-spin rounded-full border-2"
            />
            <p className="font-semibold">
              Saving your answer and opening the next step…
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
