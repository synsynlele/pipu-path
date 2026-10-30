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
      <fieldset>
        <legend className="text-sm font-semibold">
          How much time do you have?
        </legend>
        <div className="mt-3 flex gap-3">
          {[15, 30, 60].map((v) => (
            <label
              key={v}
              className="flex flex-1 items-center gap-2 rounded-xl border border-[#cddcf0] bg-[#f4f8fe] p-3"
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
        AI writes reusable challenges from your topic and time choice. Your
        name, private answers, evidence and reflections are not sent to it.
      </p>
    </form>
  );
}
