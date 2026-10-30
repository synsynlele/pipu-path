"use client";
import { useRef, useState, useTransition } from "react";
import { buildTopics } from "../domain/build";
import { startRealBuild } from "../application/actions";

export function BuildChoiceForm({
  initialTopic = "",
  initialFocus = "",
}: {
  initialTopic?: string;
  initialFocus?: string;
}) {
  const [topic, setTopic] = useState(initialTopic);
  const [focus, setFocus] = useState(initialFocus);
  const [minutes, setMinutes] = useState("30");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const submitting = useRef(false);
  const [pending, startTransition] = useTransition();
  const busy = working || pending;

  return (
    <form
      method="post"
      className="build-card mt-6 space-y-5"
      aria-busy={busy}
      onSubmit={(event) => {
        event.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        const form = new FormData(event.currentTarget);
        setMessage("");
        setWorking(true);
        startTransition(async () => {
          try {
            const result = await startRealBuild(
              { ok: false, message: "" },
              form,
            );
            setMessage(result.message);
          } catch {
            setMessage(
              "The connection was interrupted. Your chosen goal is still here. Try again.",
            );
          } finally {
            submitting.current = false;
            setWorking(false);
          }
        });
      }}
    >
      <label>
        What would you like to improve?
        <select
          name="topic"
          required
          disabled={busy}
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="mt-2"
        >
          <option value="">Choose a topic</option>
          {buildTopics.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        What exactly would you like to improve?
        <textarea
          name="focus"
          required
          minLength={12}
          maxLength={160}
          rows={3}
          disabled={busy}
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
          className="mt-2"
          placeholder="For example: I want to reduce food waste in our school."
        />
        <span className="mt-2 block text-xs leading-5 font-normal text-[#536883]">
          Describe a real problem or change you care about. Leave out names,
          phone numbers, addresses and other private details.
        </span>
      </label>
      <fieldset disabled={busy}>
        <legend className="text-sm font-semibold">
          How much time do you have?
        </legend>
        <div className="mt-3 flex gap-3">
          {[15, 30, 60].map((value) => (
            <label
              key={value}
              className="flex flex-1 items-center gap-2 rounded-xl border border-[#c6d8f2] bg-[#f0f6ff] p-3"
            >
              <input
                type="radio"
                name="minutes"
                value={value}
                checked={minutes === String(value)}
                onChange={(event) => setMinutes(event.target.value)}
              />
              {value} min
            </label>
          ))}
        </div>
      </fieldset>
      <p className="rounded-xl border border-[#c4d7f5] bg-[#eef5ff] p-3 text-xs leading-5 text-[#264e89]">
        <strong>Quests grow with you:</strong> Start with a real improvement.
        Later levels add comparison, testing and systems thinking.
      </p>
      <button
        type="submit"
        className="build-primary flex w-full items-center justify-center gap-3"
        disabled={busy}
      >
        {busy ? (
          <>
            <span
              aria-hidden="true"
              className="inline-block size-5 animate-spin rounded-full border-[3px] border-white border-t-transparent motion-reduce:animate-none"
            />
            Creating your Quest…
          </>
        ) : (
          "Get my Quest →"
        )}
      </button>
      {busy ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[#bcd2f4] bg-[#edf5ff] p-4 text-sm leading-6 text-[#244d86]"
        >
          <p className="font-bold">AI is preparing your real-world Quest.</p>
          <p className="mt-1">
            Checking the steps for a useful, safe activity and saving your Quest.
            If AI cannot finish, a reviewed hands-on starter is available.
          </p>
          <p className="mt-1 text-xs">
            You can keep this page open. Please do not press Get my Quest twice.
          </p>
        </div>
      ) : null}
      {!busy && message ? (
        <p role="alert" className="text-sm text-[#b42338]">
          {message}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-[#52647c]">
        AI uses your topic, improvement goal, available time and anonymous
        difficulty level. If AI is unavailable, PipuPath can offer a clearly
        labelled, pre-reviewed practical starter without another AI call.
      </p>
      <p className="text-xs leading-5 text-[#52647c]">
        <strong>Your improvement goal is sent to AI.</strong> Do not include
        names, contact information or other private details. Your account
        identity, saved evidence, photos and reflections are not sent to AI.
      </p>
    </form>
  );
}
