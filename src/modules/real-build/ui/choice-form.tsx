"use client";
import { useState, useTransition } from "react";
import { buildTopics } from "../domain/build";
import { startRealBuild } from "../application/actions";
export function BuildChoiceForm({
  initialTopic = "",
}: {
  initialTopic?: string;
}) {
  const [topic, setTopic] = useState(initialTopic),
    [focus, setFocus] = useState(""),
    [minutes, setMinutes] = useState("30"),
    [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <form
      method="post"
      className="build-card mt-6 space-y-5"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setMessage("");
        startTransition(async () => {
          try {
            const result = await startRealBuild(
              { ok: false, message: "" },
              form,
            );
            setMessage(result.message);
          } catch {
            setMessage(
              "The connection was interrupted. Your saved work is safe. Try again.",
            );
          }
        });
      }}
    >
      <label>
        What would you like to improve?
        <select
          name="topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-2"
        >
          <option value="">Choose a topic</option>
          {buildTopics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
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
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="mt-2"
          placeholder="For example: I want to reduce food waste in our school."
        />
        <span className="mt-2 block text-xs font-normal leading-5 text-[#536883]">
          Describe a real problem or change you care about. Leave out names, phone numbers,
          addresses and other private details.
        </span>
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">
          How much time do you have?
        </legend>
        <div className="mt-3 flex gap-3">
          {[15, 30, 60].map((v) => (
            <label
              key={v}
              className="flex flex-1 items-center gap-2 rounded-xl border border-[#c6d8f2] bg-[#f0f6ff] p-3"
            >
              <input
                type="radio"
                name="minutes"
                value={v}
                checked={minutes === String(v)}
                onChange={(e) => setMinutes(e.target.value)}
              />
              {v} min
            </label>
          ))}
        </div>
      </fieldset>
      <p className="rounded-xl border border-[#c4d7f5] bg-[#eef5ff] p-3 text-xs leading-5 text-[#264e89]">
        <strong>Quests grow with you:</strong> Level 1 starts with a simple
        test. Later levels ask you to compare ideas, measure results and solve
        connected problems. Each new topic starts gently.
      </p>
      <button className="build-primary w-full" disabled={pending}>
        {pending ? "Preparing your challenge…" : "Get my Quest →"}
      </button>
      {pending ? (
        <p role="status" className="text-sm text-[#52647c]">
          AI is preparing and saving a practical challenge. This can take up to
          35 seconds.
        </p>
      ) : null}
      {message ? (
        <p role="alert" className="text-sm text-[#b42338]">
          {message}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-[#52647c]">
        AI writes reusable challenges from your topic, time and an anonymous
        difficulty level. Your name, answers, photos and reflections are not
        sent to it.
      </p>
    </form>
  );
}
