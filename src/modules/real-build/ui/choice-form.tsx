"use client";
import { useRef, useState, useTransition } from "react";
import { buildTopics, choiceSchema } from "../domain/build";
import {
  questKinds,
  questSettings,
  questResources,
  questObstacles,
  type QuestKind,
} from "../domain/discovery";
import { startRealBuild } from "../application/actions";

const titles = [
  "What do you want to change?",
  "What is happening now?",
  "What can you start with?",
  "Ready for your Builder Quest?",
];
const selectClass = "mt-2 bg-white text-[#242241]";
export function BuildChoiceForm({
  initialTopic = "",
  initialFocus = "",
}: {
  initialTopic?: string;
  initialFocus?: string;
}) {
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const [topic, setTopic] = useState(initialTopic);
  const [focus, setFocus] = useState(initialFocus);
  const [kind, setKind] = useState<QuestKind>("make");
  const [setting, setSetting] = useState("personal");
  const [obstacle, setObstacle] = useState("unsure");
  const [resources, setResources] = useState("none");
  const [minutes, setMinutes] = useState("30");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const submitting = useRef(false);
  const [pending, startTransition] = useTransition();
  const busy = working || pending;
  function navigate(next: number) {
    setMessage("");
    setStep(next);
    heading.current?.focus();
  }
  const choice = {
    topic,
    focus,
    minutes,
    discovery: { kind, setting, obstacle, resources },
  };
  return (
    <form
      method="post"
      className="build-card mt-6 space-y-5"
      aria-busy={busy}
      onSubmit={(event) => {
        event.preventDefault();
        if (submitting.current) return;
        if (step === 0) {
          const result = choiceSchema.safeParse(choice);
          if (!result.success) {
            setMessage(
              result.error.issues[0]?.message ?? "Check your goal and topic.",
            );
            return;
          }
        }
        if (step < 3) {
          navigate(step + 1);
          return;
        }
        const parsed = choiceSchema.safeParse(choice);
        if (!parsed.success) {
          setMessage("Check your answers before creating your Quest.");
          return;
        }
        const form = new FormData();
        for (const [key, value] of Object.entries({
          topic,
          focus,
          minutes,
          kind,
          setting,
          obstacle,
          resources,
        }))
          form.set(key, value);
        submitting.current = true;
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
              "The connection was interrupted. Your answers are still here. Try again.",
            );
          } finally {
            submitting.current = false;
            setWorking(false);
          }
        });
      }}
    >
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#5b3dd4]">
        <span>QUEST DISCOVERY</span>
        <span>Step {step + 1} of 4</span>
      </div>
      <div className="flex gap-2" aria-hidden="true">
        {titles.map((title, index) => (
          <span
            key={title}
            className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-[#5b3dd4]" : "bg-[#dce7f6]"}`}
          />
        ))}
      </div>
      <h2
        ref={heading}
        tabIndex={-1}
        className="text-xl font-extrabold outline-none"
      >
        {titles[step]}
      </h2>
      {step === 0 ? (
        <>
          <label>
            What exactly would you like to improve?
            <textarea
              name="focus"
              required
              minLength={12}
              maxLength={160}
              rows={3}
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              className="mt-2"
              placeholder="For example: I want to spend less time scrolling on social media."
            />
          </label>
          <p className="text-xs leading-5 text-[#77788e]">
            Describe the change, without names, contact details or private
            information.
          </p>
          <label>
            Choose the closest topic
            <select
              name="topic"
              required
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className={selectClass}
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
            What kind of change is this?
            <select
              name="kind"
              value={kind}
              onChange={(event) => {
                setKind(event.target.value as QuestKind);
                setObstacle("unsure");
              }}
              className={selectClass}
            >
              {Object.entries(questKinds).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <label>
            Where will you try this?
            <select
              name="setting"
              value={setting}
              onChange={(event) => setSetting(event.target.value)}
              className={selectClass}
            >
              {Object.entries(questSettings).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <label>
            {kind === "habit"
              ? "What makes this habit difficult to change?"
              : kind === "community"
                ? "What is getting in the way for people?"
                : "Where are you with your build?"}
            <select
              name="obstacle"
              value={obstacle}
              onChange={(event) => setObstacle(event.target.value)}
              className={selectClass}
            >
              {Object.entries(questObstacles[kind]).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm leading-6 text-[#77788e]">
            Start with one small change you can actually try. Your Quest will
            include a baseline and a real test.
          </p>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <label>
            What is already available to you?
            <select
              name="resources"
              value={resources}
              onChange={(event) => setResources(event.target.value)}
              className={selectClass}
            >
              {Object.entries(questResources).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-semibold">
              Time for your first session
            </legend>
            <div className="mt-3 flex gap-2">
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
          <p className="text-xs leading-5 text-[#77788e]">
            Use what you have. No spending required. Testing a routine may
            continue over several days.
          </p>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <section
            aria-label="Your Quest brief"
            className="rounded-2xl border border-[#e2daf7] bg-[#f5f1ff] p-4 text-sm leading-6"
          >
            <p className="font-bold">{focus}</p>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="font-bold">Direction</dt>
                <dd>
                  {questKinds[kind]} ·{" "}
                  {buildTopics.find((item) => item.id === topic)?.title}
                </dd>
              </div>
              <div>
                <dt className="font-bold">Starting point</dt>
                <dd>
                  {questSettings[setting as keyof typeof questSettings]} ·{" "}
                  {(questObstacles[kind] as Record<string, string>)[obstacle]}
                </dd>
              </div>
              <div>
                <dt className="font-bold">Resources and time</dt>
                <dd>
                  {questResources[resources as keyof typeof questResources]} ·{" "}
                  {minutes} min to start
                </dd>
              </div>
            </dl>
          </section>
          <p className="text-sm leading-6 text-[#77788e]">
            Your guide: Understand → Prepare → Build → Test → Improve. Save what
            actually happened, then use that lesson for your next attempt.
          </p>
          <p className="text-xs leading-5 text-[#77788e]">
            <strong>
              Your improvement goal and selected answers are sent to AI.
            </strong>{" "}
            Your account identity, saved evidence, photos and reflections are
            not sent. A matching, validated AI Quest may be reused. Generated
            steps can reflect your answers; keep private details out of your
            goal.
          </p>
        </>
      ) : null}
      <div className="flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            disabled={busy}
            className="border border-[#b8cde6] bg-white text-[#5b3dd4]"
            onClick={() => navigate(step - 1)}
          >
            Back
          </button>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="build-primary flex flex-1 items-center justify-center gap-3"
        >
          {busy ? (
            <>
              <span
                aria-hidden="true"
                className="size-5 animate-spin rounded-full border-[3px] border-white border-t-transparent motion-reduce:animate-none"
              />
              Creating your Quest…
            </>
          ) : step === 3 ? (
            "Create my Quest →"
          ) : step === 2 ? (
            "Review my answers →"
          ) : (
            "Continue →"
          )}
        </button>
      </div>
      {busy ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[#bcd2f4] bg-[#edf5ff] p-4 text-sm leading-6 text-[#244d86]"
        >
          <p className="font-bold">Preparing your personalised Quest…</p>
          <p className="mt-1">
            Checking for a matching AI guide, or generating and checking five
            practical stages. Keep this page open.
          </p>
        </div>
      ) : null}
      {!busy && message ? (
        <p role="alert" className="text-sm text-[#b42338]">
          {message}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-[#77788e]">
        Discovery questions use no AI calls. If generation cannot finish, your
        answers stay here so you can retry.
      </p>
    </form>
  );
}
