"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { evaluateGame, type GameChapter } from "../domain/game-engine";
import { CityIcon } from "./city-art";

export function ChapterChallenge({ chapter }: { chapter: GameChapter }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const scenario = chapter.scenarios[scenarioIndex];
  const result = evaluateGame(chapter, scenario.id, selected);

  function toggle(id: string) {
    setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    setChecked(false);
  }
  function next() {
    setScenarioIndex((index) => index + 1);
    setSelected([]);
    setChecked(false);
  }
  return (
    <main id="main-content" className="min-h-screen bg-[#f7f8fc] pb-16 text-[#25284a]">
      <header className="bg-[#201b59] px-4 py-5 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/build/play" className="text-sm font-semibold text-white">← Adventures</Link>
          <span className="text-xs font-semibold text-[#f4d69b]">PipuPath · Practice world</span>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-5 px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#243f5c] via-[#366d61] to-[#6da579] p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-8 -bottom-12 text-[11rem] opacity-25" aria-hidden="true">🌱</div>
          <p className="text-xs font-bold tracking-widest text-[#e4f6d6] uppercase">Adventure 02 · {scenario.label}</p>
          <h1 className="relative mt-3 text-3xl font-bold sm:text-4xl">{chapter.title}</h1>
          <p className="relative mt-3 max-w-md text-sm leading-6 text-white/90">{chapter.description}</p>
          <div className="relative mt-5 flex items-center gap-3 text-3xl" aria-hidden="true"><span>🌿</span><span>🪴</span><span>🌻</span><span>🧑‍🤝‍🧑</span></div>
        </div>
        <section aria-label="Available resources" className="grid grid-cols-3 gap-2">
          {(["cost", "time", "crew"] as const).map((key) => (
            <div key={key} className="rounded-2xl border border-[#e1ddef] bg-white p-3 text-center">
              <p className="text-xs font-semibold capitalize text-[#626a80]">{key === "cost" ? "Supplies" : key === "time" ? "Hours" : "Helpers"}</p>
              <p className="mt-1 text-xl font-bold">{result.totals[key]} <span className="text-sm font-normal text-[#626a80]">/ {scenario.budget[key]}</span></p>
            </div>
          ))}
        </section>
        <section aria-label="Build your garden">
          <h2 className="text-lg font-bold">What will you build?</h2>
          <p className="mt-1 text-sm text-[#626a80]">Tap to add or remove. Every choice matters.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {chapter.choices.map((choice, index) => {
              const active = selected.includes(choice.id);
              const pictures = ["🌱", "🛤️", "💧", "📣", "🪑", "☀️"];
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => toggle(choice.id)}
                  aria-pressed={active}
                  className={`min-h-36 rounded-3xl border-2 p-4 text-left transition-transform active:scale-95 ${active ? "border-[#4f9c7a] bg-[#e3f6eb]" : "border-[#e3e4ed] bg-white"}`}
                >
                  <span className="flex items-center justify-between"><span className="text-4xl" aria-hidden="true">{pictures[index] ?? "🌿"}</span>{active ? <CityIcon name="proof" className="size-6 text-[#287a58]" /> : null}</span>
                  <span className="mt-3 block text-sm font-bold">{choice.label}</span>
                  <span className="mt-1 block text-xs text-[#626a80]">{choice.cost} supplies · {choice.time}h</span>
                </button>
              );
            })}
          </div>
        </section>
        {checked && (
          <section aria-live="polite" className={`rounded-2xl border p-4 ${result.success ? "border-[#8acfb7] bg-[#e8faf3]" : "border-[#e8c4a1] bg-[#fff5e7]"}`}>
            <h2 className="font-bold">{result.success ? "Your garden plan works! 🎉" : "Not quite. Try another combination."}</h2>
            {result.problems.length > 0 && <ul className="mt-2 list-inside list-disc text-sm">{result.problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>}
          </section>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setChecked(true)} disabled={selected.length === 0}>Test my plan</Button>
          {checked && result.success && scenarioIndex < chapter.scenarios.length - 1 && <Button onClick={next}>Next challenge →</Button>}
          {checked && result.success && scenarioIndex === chapter.scenarios.length - 1 && <Link className="inline-flex min-h-11 items-center rounded-full bg-[#201b59] px-5 text-sm font-bold text-white" href="/quests">Take it into real life →</Link>}
        </div>
        <p className="text-xs text-[#626a80]">This is a practice game. Real PipuPath progress comes from your Quest actions, proof and reflection.</p>
      </div>
    </main>
  );
}
