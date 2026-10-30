"use client";

import { useState, useSyncExternalStore } from "react";
import { stageActions } from "../domain/stage-actions";
import type { BuildChallenge } from "../domain/build";

const stageLabels = [
  {
    name: "Understand",
    title: "Understand the problem",
    hint: "Identify who needs the solution and what happens before it exists.",
  },
  {
    name: "Prepare",
    title: "Prepare your first move",
    hint: "Get the materials and setup ready for the solution you will build.",
  },
  {
    name: "Build",
    title: "Put your solution into action",
    hint: "Follow the construction steps to make a working tool, service or process.",
  },
  {
    name: "Test",
    title: "Test it in real life",
    hint: "Put the built solution into use and check whether it helps its intended user.",
  },
  {
    name: "Improve",
    title: "Improve and capture the result",
    hint: "Improve the solution from the test and record what actually happened.",
  },
] as const;

function readStage(key: string): number {
  try {
    const stored = Number(window.localStorage.getItem(key) ?? "0");
    return Number.isInteger(stored) && stored >= 0 && stored < 5 ? stored : 0;
  } catch {
    return 0;
  }
}

export function BuildStageGuide({
  id,
  challenge,
  status,
}: {
  id: string;
  challenge: BuildChallenge;
  status: "active" | "recorded" | "archived";
}) {
  const key = `pipupath:build-stage:${id}`;
  const storedStage = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("pipupath:stage-changed", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("pipupath:stage-changed", callback);
      };
    },
    () => readStage(key),
    () => 0,
  );
  const [unpersistedStage, setUnpersistedStage] = useState<number | null>(null);
  const selected = unpersistedStage ?? storedStage;
  const [tried, setTried] = useState<number[]>([]);

  const current = stageLabels[selected];

  function goTo(index: number) {
    if (index < 0 || index >= stageLabels.length) return;
    try {
      window.localStorage.setItem(key, String(index));
      setUnpersistedStage(null);
      window.dispatchEvent(new Event("pipupath:stage-changed"));
    } catch {
      // Navigation remains available even if storage is disabled.
      setUnpersistedStage(index);
    }
  }
  function markTried() {
    setTried((items) =>
      items.includes(selected) ? items : [...items, selected],
    );
    goTo(Math.min(selected + 1, stageLabels.length - 1));
  }

  return (
    <section
      className="build-card mt-6 space-y-4"
      aria-labelledby="staged-quest-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#5b3dd4] uppercase">
            Step-by-step Builder Guide
          </p>
          <h2 id="staged-quest-heading" className="mt-2 text-xl font-extrabold">
            Build it in five stages
          </h2>
        </div>
        <span className="rounded-full bg-[#f4f0ff] px-3 py-2 text-xs font-bold text-[#5b3dd4]">
          Stage {selected + 1} of 5
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[#e9e4fb]"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-[#7958df] transition-[width]"
          style={{ width: `${((selected + 1) / 5) * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Choose a Quest stage">
        {stageLabels.map((stage, i) => (
          <button
            type="button"
            key={stage.name}
            aria-current={i === selected ? "step" : undefined}
            onClick={() => goTo(i)}
            className={
              "build-stage-tab min-h-11 rounded-xl border px-3 py-2 text-xs font-bold " +
              (i === selected
                ? "border-[#5b3dd4] bg-[#5b3dd4] text-white"
                : "border-[#c9d8ed] bg-white text-[#4f3c93]")
            }
          >
            {i + 1}. {stage.name}
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        className="rounded-2xl border border-[#bfd5f2] bg-[#f5f1ff] p-4"
      >
        <p className="text-xs font-bold text-[#5b3dd4]">STAGE {selected + 1}</p>
        <h3 className="mt-2 text-lg font-extrabold">{current.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#77788e]">{current.hint}</p>
        <div
          data-testid="active-stage-instruction"
          className="mt-4 text-base leading-7 font-semibold text-[#153660]"
        >
          {stageActions(challenge.steps[selected]).length > 1 ? (
            <ol className="list-decimal space-y-3 pl-5">
              {stageActions(challenge.steps[selected]).map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ol>
          ) : (
            <p>{challenge.steps[selected]}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={selected === 0}
          onClick={() => goTo(selected - 1)}
          className="build-guide-secondary min-h-11 rounded-xl border border-[#b4c8e4] bg-white px-4 text-sm font-bold text-[#5b3dd4] disabled:opacity-50"
        >
          Previous
        </button>
        {selected < 4 ? (
          <button
            type="button"
            onClick={() => goTo(selected + 1)}
            className="build-primary min-h-11 flex-1 rounded-xl bg-[#5b3dd4] px-4 text-sm font-bold text-white"
          >
            Next stage →
          </button>
        ) : (
          <a
            href="#evidence-heading"
            className="build-primary flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#5b3dd4] px-4 text-sm font-bold text-white"
          >
            {status === "active"
              ? "Record my real-world result →"
              : "Review my result →"}
          </a>
        )}
        {status === "active" && selected < 4 ? (
          <button
            type="button"
            onClick={markTried}
            className="build-guide-secondary min-h-11 w-full rounded-xl border border-[#bed5ea] bg-[#e9f3f4] px-4 text-sm font-semibold text-[#185a61]"
          >
            {tried.includes(selected)
              ? "I tried this • Continue →"
              : "I tried this stage ✓"}
          </button>
        ) : null}
      </div>
      <details>
        <summary className="cursor-pointer py-2 text-sm font-bold text-[#5b3dd4]">
          See all five stages
        </summary>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6">
          {challenge.steps.map((step, index) => (
            <li key={index}>
              <strong>{stageLabels[index]?.name}: </strong>
              {step}
            </li>
          ))}
        </ol>
      </details>
      <p className="text-xs leading-5 text-[#65758d]">
        This on-device guide remembers which stage you were viewing. Navigating
        stages does not verify completed work or award XP. Save actual evidence
        and your reflection separately.
      </p>
    </section>
  );
}
