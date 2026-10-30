"use client";

import { useEffect, useState } from "react";
import type { BuildChallenge } from "../domain/build";

const stageLabels = [
  {
    name: "Understand",
    title: "Understand the problem",
    hint: "Look at what really happens now. Identify one small, observable starting point.",
  },
  {
    name: "Prepare",
    title: "Prepare your first move",
    hint: "Choose a safe action using what is already available. No paperwork needed.",
  },
  {
    name: "Build",
    title: "Put your solution into action",
    hint: "Make the improvement real. Change a routine, create something useful, or help someone.",
  },
  {
    name: "Test",
    title: "Test it in real life",
    hint: "Try the action in a genuine situation and notice what changed.",
  },
  {
    name: "Improve",
    title: "Improve and capture the result",
    hint: "Adjust what you tried and record what happened honestly, even if it did not work.",
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
  const [selected, setSelected] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  useEffect(() => {
    setSelected(readStage(key));
  }, [key]);
  const current = stageLabels[selected];

  function goTo(index: number) {
    if (index < 0 || index >= stageLabels.length) return;
    setSelected(index);
    try {
      window.localStorage.setItem(key, String(index));
    } catch {
      // The guide still works when a browser blocks local storage.
    }
  }
  function markTried() {
    setTried((items) => (items.includes(selected) ? items : [...items, selected]));
    goTo(Math.min(selected + 1, stageLabels.length - 1));
  }

  return (
    <section className="build-card mt-6 space-y-4" aria-labelledby="staged-quest-heading">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#2059bd] uppercase">
            Step-by-step Builder Guide
          </p>
          <h2 id="staged-quest-heading" className="mt-2 text-xl font-extrabold">
            Build it in five stages
          </h2>
        </div>
        <span className="rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-bold text-[#2059bd]">
          Stage {selected + 1} of 5
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#dbe9fa]" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#2865bd] transition-[width]"
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
              "min-h-11 rounded-xl border px-3 py-2 text-xs font-bold " +
              (i === selected
                ? "border-[#235caa] bg-[#245bb0] text-white"
                : "border-[#c9d8ed] bg-white text-[#244a7e]")
            }
          >
            {i + 1}. {stage.name}
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        className="rounded-2xl border border-[#bfd5f2] bg-[#f2f7ff] p-4"
      >
        <p className="text-xs font-bold text-[#2059bd]">STAGE {selected + 1}</p>
        <h3 className="mt-2 text-lg font-extrabold">{current.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#536883]">{current.hint}</p>
        <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-7 text-[#153660]">
          {challenge.steps[selected]}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={selected === 0}
          onClick={() => goTo(selected - 1)}
          className="min-h-11 rounded-xl border border-[#b4c8e4] bg-white px-4 text-sm font-bold text-[#2059bd] disabled:opacity-50"
        >
          Previous
        </button>
        {selected < 4 ? (
          <button
            type="button"
            onClick={() => goTo(selected + 1)}
            className="min-h-11 flex-1 rounded-xl bg-[#2059bd] px-4 text-sm font-bold text-white"
          >
            Next stage →
          </button>
        ) : (
          <a
            href="#evidence-heading"
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#2059bd] px-4 text-sm font-bold text-white"
          >
            {status === "active" ? "Record my real-world result →" : "Review my result →"}
          </a>
        )}
        {status === "active" && selected < 4 ? (
          <button
            type="button"
            onClick={markTried}
            className="min-h-11 w-full rounded-xl border border-[#bed5ea] bg-[#e9f3f4] px-4 text-sm font-semibold text-[#185a61]"
          >
            {tried.includes(selected) ? "I tried this • Continue →" : "I tried this stage ✓"}
          </button>
        ) : null}
      </div>
      <details>
        <summary className="cursor-pointer py-2 text-sm font-bold text-[#2059bd]">
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
