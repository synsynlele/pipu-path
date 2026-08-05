"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  createBuilderProjectAction,
  type ProjectFormState,
} from "../application/project-actions";
import type { EligibleProjectSource } from "../infrastructure/project-dal";

const initialState: ProjectFormState = { status: "idle" };
const inputClass =
  "border-border bg-background mt-2 min-h-11 w-full rounded-xl border px-3 text-sm";
const textareaClass =
  "border-border bg-background mt-2 min-h-28 w-full rounded-2xl border p-4 text-sm leading-6";

export function ProjectCreateForm({
  sources,
  today,
  maximumDate,
}: {
  sources: EligibleProjectSource[];
  today: string;
  maximumDate: string;
}) {
  const [state, action, pending] = useActionState(
    createBuilderProjectAction,
    initialState,
  );

  return (
    <form action={action} aria-busy={pending} className="grid gap-8">
      <section className="border-border rounded-2xl border p-5 sm:p-6">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Proof foundation
        </p>
        <label
          htmlFor="sourceQuestId"
          className="mt-4 block text-sm font-semibold"
        >
          Completed Quest proof
        </label>
        <select
          id="sourceQuestId"
          name="sourceQuestId"
          required
          className={inputClass}
          defaultValue={sources[0]?.id}
        >
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.title}
            </option>
          ))}
        </select>
        <p className="text-muted mt-3 text-sm leading-6">
          PipuPath will preserve the link to this completed Quest, its private
          evidence and what you learned.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="text-sm font-semibold">
            Project title
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={3}
            maxLength={100}
            className={inputClass}
            placeholder="A clear name for the useful thing you will build"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="problemStatement" className="text-sm font-semibold">
            What problem will this Project address?
          </label>
          <textarea
            id="problemStatement"
            name="problemStatement"
            required
            minLength={20}
            maxLength={800}
            className={textareaClass}
            placeholder="Describe the real situation, not a broad global problem."
          />
        </div>
        <div>
          <label htmlFor="peopleServed" className="text-sm font-semibold">
            Who should benefit?
          </label>
          <textarea
            id="peopleServed"
            name="peopleServed"
            required
            minLength={10}
            maxLength={400}
            className={textareaClass}
            placeholder="Name a specific, reachable group of people."
          />
        </div>
        <div>
          <label htmlFor="desiredOutcome" className="text-sm font-semibold">
            What practical outcome should exist?
          </label>
          <textarea
            id="desiredOutcome"
            name="desiredOutcome"
            required
            minLength={20}
            maxLength={800}
            className={textareaClass}
            placeholder="Describe what will be different when the Project works."
          />
        </div>
        <div>
          <label
            htmlFor="smallestUsefulVersion"
            className="text-sm font-semibold"
          >
            What is the smallest useful version?
          </label>
          <textarea
            id="smallestUsefulVersion"
            name="smallestUsefulVersion"
            required
            minLength={20}
            maxLength={800}
            className={textareaClass}
            placeholder="Choose something you can genuinely build and test."
          />
        </div>
        <div>
          <label htmlFor="successSignal" className="text-sm font-semibold">
            What will prove it worked?
          </label>
          <textarea
            id="successSignal"
            name="successSignal"
            required
            minLength={10}
            maxLength={500}
            className={textareaClass}
            placeholder="Use one observable result, response or behaviour."
          />
        </div>
        <div>
          <label htmlFor="targetDate" className="text-sm font-semibold">
            Target date
          </label>
          <input
            id="targetDate"
            name="targetDate"
            type="date"
            required
            min={today}
            max={maximumDate}
            defaultValue={today}
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <div className="max-w-2xl">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Three-step execution path
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Make each milestone observable.
          </h2>
          <p className="text-muted mt-2 leading-7">
            A milestone is complete only when you can point to honest proof, not
            when time has passed or the work merely feels finished.
          </p>
        </div>
        <div className="mt-6 grid gap-5">
          {[1, 2, 3].map((number) => (
            <fieldset
              key={number}
              className="border-border bg-background/30 rounded-2xl border p-5 sm:p-6"
            >
              <legend className="text-gold px-2 text-xs font-semibold tracking-wide uppercase">
                Milestone {number}
              </legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`milestone${number}Title`}
                    className="text-sm font-semibold"
                  >
                    Milestone {number} title
                  </label>
                  <input
                    id={`milestone${number}Title`}
                    name={`milestone${number}Title`}
                    required
                    minLength={3}
                    maxLength={100}
                    defaultValue={
                      number === 1
                        ? "Understand and define"
                        : number === 2
                          ? "Build the smallest useful version"
                          : "Test, learn and improve"
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`milestone${number}Outcome`}
                    className="text-sm font-semibold"
                  >
                    Intended outcome
                  </label>
                  <textarea
                    id={`milestone${number}Outcome`}
                    name={`milestone${number}Outcome`}
                    required
                    minLength={10}
                    maxLength={500}
                    className={textareaClass}
                    placeholder="What useful result should this step create?"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`milestone${number}Signal`}
                    className="text-sm font-semibold"
                  >
                    Honest completion signal
                  </label>
                  <textarea
                    id={`milestone${number}Signal`}
                    name={`milestone${number}Signal`}
                    required
                    minLength={10}
                    maxLength={400}
                    className={textareaClass}
                    placeholder="What evidence will show this step is complete?"
                  />
                </div>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating private Project…" : "Create My Builder Project"}
        </Button>
        {pending ? (
          <p role="status" className="text-muted mt-3 text-sm">
            Connecting your Quest proof to a focused execution path…
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="text-error mt-3 text-sm">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
