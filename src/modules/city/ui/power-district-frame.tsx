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
      aria-label="Power District 3D practice"
      className={
        expanded
          ? "fixed inset-0 z-[1000] flex flex-col bg-[#f4efe4] text-[#233e35]"
          : "overflow-hidden rounded-2xl border border-[#d1d8c4] bg-[#f4efe4] text-[#233e35]"
      }
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#d1d8c4] px-4 py-2">
        <p className="text-xs font-bold">
          Power District <span className="font-normal">· 3D practice</span>
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
              className="min-h-11 rounded-xl border border-[#a7b697] px-3 text-xs font-bold"
            >
              Close focus view
            </button>
          ) : (
            <button
              ref={expandButton}
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded(true)}
              className="min-h-11 rounded-xl bg-[#355443] px-3 text-xs font-bold text-white"
            >
              Expand game ↗
            </button>
          )}
        </div>
      </div>
      <iframe
        title="Power District: Keep the Workshop Running"
        src="/games/power-district/index.html?embedded=1"
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
