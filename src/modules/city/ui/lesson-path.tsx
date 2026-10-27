"use client";

import type { ReactNode } from "react";

export type LessonNode = {
  id: string;
  title: string;
  hint?: string;
  state: "done" | "current" | "locked";
};

export function LessonPath({
  title = "Your practice path",
  nodes,
  onSelect,
}: {
  title?: string;
  nodes: readonly LessonNode[];
  onSelect?: (id: string) => void;
}) {
  const completed = nodes.filter((node) => node.state === "done").length;
  const progress = Math.round((completed / Math.max(nodes.length, 1)) * 100);
  return (
    <section aria-label={title} className="lesson-path min-w-0 rounded-3xl border border-[#e4c27d]/30 bg-[#142b3b] px-3 py-4 text-white sm:p-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.64rem] font-extrabold uppercase tracking-[.2em] text-[#eac981]">A little progress, every mission</p>
          <h2 className="mt-1 text-base font-extrabold sm:text-lg">{title}</h2>
        </div>
        <span className="rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-bold tabular-nums text-[#f1d697]">{completed} / {nodes.length} completed</span>
      </div>
      <div role="progressbar" aria-label="Practice missions completed" aria-valuemin={0} aria-valuemax={nodes.length} aria-valuenow={completed} className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-[#9bdfab] transition-[width] motion-reduce:transition-none" style={{width: `${progress}%`}} />
      </div>
      <ol className="mt-4 grid min-w-0 gap-1.5" style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}>
        {nodes.map((node, index) => {
          const done = node.state === "done";
          const current = node.state === "current";
          const available = node.state !== "locked" && Boolean(onSelect);
          const position = index % 3 === 1 ? "translate-y-1" : "translate-y-0";
          const content: ReactNode = (
            <>
              <span className={`lesson-path-node relative grid size-11 place-items-center rounded-full border-2 text-base font-extrabold shadow-lg transition-transform sm:size-14 ${done ? "border-[#7cd1a7] bg-[#246f56] text-white" : current ? "border-[#f3d48d] bg-[#efc76f] text-[#102b3b] shadow-[#eebd6b]/25" : "border-white/25 bg-[#2a3c4d] text-[#a3b3c6]"}`}>
                {done ? "✓" : node.state === "locked" ? "•" : index + 1}
                {current && <span aria-hidden="true" className="absolute -inset-1 rounded-full border-2 border-[#f2d694]/50" />}
              </span>
              <span className={`mt-2 block max-w-full text-center text-[0.66rem] leading-[.9rem] font-semibold break-words sm:text-xs sm:leading-4 ${current ? "text-[#f9e6b8]" : "text-[#cad8e7]"}`}>{node.title}</span>
              <span className="mt-1 block text-center text-[0.56rem] leading-3 text-[#b0c3d2] sm:text-[0.64rem]">
                {done ? "Complete" : current ? "Play now" : "Up next"}
              </span>
            </>
          );
          return (
            <li key={node.id} className="relative min-w-0">
              {index < nodes.length - 1 && <span className="pointer-events-none absolute top-[1.35rem] right-[-20%] left-[52%] h-[2px] bg-[#b4a6a1]/35 sm:top-[1.7rem]" aria-hidden="true" />}
              {available ? (
                <button
                  type="button"
                  aria-label={`${node.title}: ${done ? "completed" : "play now"}`}
                  aria-current={current ? "step" : undefined}
                  onClick={() => onSelect?.(node.id)}
                  className={`relative flex w-full min-w-0 flex-col items-center rounded-2xl px-0.5 pb-2 pt-1 focus-visible:outline-2 focus-visible:outline-[#f7d899] ${position}`}
                >
                  {content}
                </button>
              ) : (
                <div aria-current={current ? "step" : undefined} aria-label={`${node.title}: ${node.state}`} className={`relative flex w-full min-w-0 flex-col items-center px-0.5 pb-2 pt-1 ${position}`}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-[0.68rem] text-[#a6c0cf]">Practice missions are separate from verified PipuPath XP.</p>
    </section>
  );
}
