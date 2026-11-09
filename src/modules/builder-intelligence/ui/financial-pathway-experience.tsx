"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  isStageAllowedForAge,
  simulateCityFinancialDecision,
} from "../domain/builder-pathway";
import { financialIntelligencePathway } from "../domain/financial-pathway";
import {
  startFinancialQuestAction,
  type FinancialStartState,
} from "../application/financial-actions";

type Props = {
  ageBand: string;
  recordedCodes: string[];
  current: { id: string; title: string } | null;
};

function formatNaira(value: number) {
  return (
    "₦" +
    new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)
  );
}

const initial: FinancialStartState = { status: "idle" };
export function FinancialPathwayExperience({
  ageBand,
  recordedCodes,
  current,
}: Props) {
  const stages = financialIntelligencePathway.stages;
  const completed = new Set(recordedCodes);
  const firstAvailable =
    stages.find(
      (stage) =>
        isStageAllowedForAge(stage, ageBand) &&
        !completed.has(stage.code) &&
        stage.prerequisites.every((code) => completed.has(code)),
    ) ?? stages[0];
  const [selectedCode, setSelectedCode] = useState(firstAvailable.code);
  const [decision, setDecision] = useState<string | null>(null);
  const [formState, formAction, pending] = useActionState(
    startFinancialQuestAction,
    initial,
  );
  const selected =
    stages.find((stage) => stage.code === selectedCode) ?? stages[0];
  const ageAllowed = isStageAllowedForAge(selected, ageBand);
  const unlocked =
    ageAllowed && selected.prerequisites.every((code) => completed.has(code));
  const result = decision
    ? simulateCityFinancialDecision(selected, decision)
    : null;
  const activeTitle = current
    ? stages.find((stage) => stage.quest.challenge.title === current.title)
        ?.title
    : null;

  return (
    <div className="journey-body space-y-5">
      <div className="build-card mt-5">
        <p className="text-xs font-bold tracking-widest text-[#5b3dd4] uppercase">
          ONE LEARNING-AND-ACTION ROUTE
        </p>
        <h2 className="mt-2 text-xl font-extrabold">
          Build financial judgement
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#465d7a]">
          Try decisions in a fictional city, then take a safe no-spend action in
          real life. City practice never earns XP or proves your financial
          ability. Recorded attempts are your private account, not independently
          verified results.
        </p>
        <p className="mt-3 text-xs font-semibold text-[#5b3dd4]">
          {recordedCodes.length} of{" "}
          {
            stages.filter((stage) => isStageAllowedForAge(stage, ageBand))
              .length
          }{" "}
          age-appropriate stages have a recorded real-world attempt.
        </p>
      </div>

      <section aria-label="Choose your financial topic" className="build-card">
        <h2 className="text-lg font-bold">Your pathway</h2>
        <p className="mt-1 text-sm text-[#465d7a]">
          Each stage builds on the previous one. You can revisit earlier
          practice without losing work.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {stages.map((stage) => {
            const allowed = isStageAllowedForAge(stage, ageBand);
            const open =
              allowed &&
              stage.prerequisites.every((code) => completed.has(code));
            const attempted = completed.has(stage.code);
            return (
              <button
                key={stage.code}
                type="button"
                disabled={!open}
                aria-pressed={selectedCode === stage.code}
                onClick={() => {
                  setSelectedCode(stage.code);
                  setDecision(null);
                }}
                className={
                  "min-h-14 rounded-xl border px-3 py-3 text-left text-sm " +
                  (selectedCode === stage.code
                    ? "border-[#5b3dd4] bg-[#f4f0ff] text-[#242241]"
                    : "border-[#c6d8f2] bg-white text-[#242241]")
                }
              >
                <span className="block font-bold">
                  {stage.order}. {stage.title}
                </span>
                <span className="mt-1 block text-xs font-medium text-[#46617d]">
                  {attempted
                    ? "Real-world attempt recorded"
                    : !allowed
                      ? "For an older age group"
                      : open
                        ? "Ready to practise"
                        : "Previous stage required"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="build-card"
        aria-label="Fictional city financial simulation"
      >
        <p className="text-xs font-bold tracking-widest text-[#5b3dd4] uppercase">
          CITY PRACTICE · {selected.city.district.toUpperCase()} DISTRICT
        </p>
        <h2 className="mt-2 text-xl font-bold">{selected.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#465d7a]">
          {selected.city.scenario}
        </p>
        <p className="mt-4 rounded-xl bg-[#f3f6ff] p-3 text-sm font-bold text-[#242241]">
          Fictional city resources: {formatNaira(selected.city.availableNaira)}
        </p>
        {unlocked ? (
          <>
            <fieldset className="mt-4 space-y-2">
              <legend className="font-bold">
                What will your city team do?
              </legend>
              {selected.city.choices.map((choice) => (
                <button
                  type="button"
                  key={choice.id}
                  aria-pressed={decision === choice.id}
                  onClick={() => setDecision(choice.id)}
                  className={
                    "block w-full rounded-xl border p-3 text-left text-sm " +
                    (decision === choice.id
                      ? "border-[#5b3dd4] bg-[#f4f0ff] text-[#242241]"
                      : "border-[#b9c9df] bg-white text-[#242241]")
                  }
                >
                  {choice.label}
                </button>
              ))}
            </fieldset>
            {result ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 rounded-xl border border-[#c6d8f2] bg-[#f3f6ff] p-4 text-sm text-[#242241]"
              >
                <p className="font-bold">
                  {result.shortfall > 0
                    ? `Unfunded by ${formatNaira(result.shortfall)}`
                    : `${formatNaira(result.remaining)} remains`}
                </p>
                <p className="mt-2 leading-6">{result.consequence}</p>
                <p className="mt-2 leading-6">{result.tradeOff}</p>
                <p className="mt-3 text-xs font-semibold">
                  This was a simulated decision, not a real-world achievement.
                  You can try the alternative decision.
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-[#465d7a]">
            {ageAllowed
              ? "Record the earlier practical attempt to unlock this topic."
              : "This scenario is reserved for an older age group."}
          </p>
        )}
        <Link
          href="/build/play"
          className="mt-4 inline-block py-2 text-sm font-bold"
        >
          Visit The Unbuilt City game →
        </Link>
      </section>

      <section className="build-card" aria-label="Practical financial Quest">
        <p className="text-xs font-bold tracking-widest text-[#5b3dd4] uppercase">
          REAL-WORLD ACTION · NO PURCHASE NECESSARY
        </p>
        <h2 className="mt-2 text-lg font-bold">
          {selected.quest.challenge.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#465d7a]">
          {selected.quest.challenge.outcome}
        </p>
        <p className="mt-3 text-sm">
          <strong>Use what you already have.</strong> Estimated starting time:{" "}
          {selected.quest.minutes} minutes. No bank account, purchase or payment
          needed.
        </p>
        <details className="mt-4 rounded-xl border border-[#d6e4f5] p-3">
          <summary className="cursor-pointer py-1 font-bold">
            See safe action steps and evidence guidance
          </summary>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6">
            {selected.quest.challenge.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 text-sm font-bold">Evidence to record</p>
          <p className="mt-1 text-sm">{selected.quest.challenge.evidence}</p>
          <p className="mt-3 text-sm font-bold">Safety</p>
          <p className="mt-1 text-sm">{selected.quest.challenge.safety}</p>
        </details>
        {current ? (
          <div className="mt-5">
            <p className="text-sm text-[#465d7a]">
              {activeTitle
                ? `Finish or set aside your current “${activeTitle}” Quest before another.`
                : "You already have an active Quest. Your work is preserved."}
            </p>
            <Link
              className="build-primary mt-3 w-full"
              href={`/real-quests/${current.id}`}
            >
              Continue my saved Quest →
            </Link>
          </div>
        ) : unlocked ? (
          <form action={formAction} className="mt-5">
            <input type="hidden" name="stage" value={selected.code} />
            <button
              type="submit"
              disabled={pending}
              className="build-primary w-full"
            >
              {pending
                ? "Opening prepared Quest…"
                : completed.has(selected.code)
                  ? "Repeat this real-world stage →"
                  : "Start this real-world Quest →"}
            </button>
            {formState.status === "error" ? (
              <p role="alert" className="mt-3 text-sm font-bold text-[#982b33]">
                {formState.message}
              </p>
            ) : null}
          </form>
        ) : null}
        <p className="mt-3 text-xs leading-5 text-[#465d7a]">
          Your evidence and reflections stay private. PipuPath does not use
          fictional choices to certify skills, and will not ask you to spend
          money.
        </p>
      </section>
      <section className="build-card">
        <h2 className="font-bold">
          Turn repeated action into a meaningful project
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#465d7a]">
          {"Saved Quest attempts stay private. "}
          {"Formal Projects and Portfolio have separate proof requirements. "}
          {"Nothing is transferred or published automatically."}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-block py-3 text-sm font-bold"
          >
            My Projects →
          </Link>
          <Link
            href="/you"
            className="inline-block py-3 text-sm font-bold"
          >
            My saved Quest attempts →
          </Link>
        </div>
      </section>
    </div>
  );
}
