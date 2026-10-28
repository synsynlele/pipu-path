"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** The game runs in its own document: no GPU bundle in the app shell or Hub. */
export function PowerDistrictFrame({
  questHref,
  questLabel,
}: {
  questHref: string;
  questLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const expandButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!expanded) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
        expandButton.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener("keydown", escape);
    };
  }, [expanded]);
  function close() {
    setExpanded(false);
    expandButton.current?.focus();
  }
  return (
    <section
      aria-label="The Unbuilt City 3D city"
      className={
        expanded
          ? "unbuilt-city-frame fixed inset-0 z-[1000] flex flex-col bg-[#f4f6fd] text-[#142a52]"
          : "unbuilt-city-frame overflow-hidden rounded-2xl border border-[#d6deed] bg-[#f4f6fd] text-[#142a52]"
      }
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#d6deed] px-4 py-2">
        <p className="text-xs font-bold">
          The Unbuilt City <span className="font-normal">· connected city</span>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex min-h-11 items-center text-xs font-bold underline"
            href={questHref}
          >
            {questLabel}
          </Link>
          {expanded ? (
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              className="min-h-11 rounded-xl border border-[#bccbe4] px-3 text-xs font-bold"
            >
              Close focus view
            </button>
          ) : (
            <button
              ref={expandButton}
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded(true)}
              className="min-h-11 rounded-xl bg-[#243b78] px-3 text-xs font-bold text-white"
            >
              Expand game ↗
            </button>
          )}
        </div>
      </div>
      <iframe
        title="The Unbuilt City: Power, Food and Learning"
        src="/games/city/index.html?embedded=1"
        className={
          expanded
            ? "min-h-0 w-full flex-1 border-0"
            : "h-[min(860px,85svh)] min-h-[620px] w-full border-0"
        }
        allow="fullscreen"
        referrerPolicy="no-referrer"
      />
    </section>
  );
}
