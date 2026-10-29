"use client";
import { useEffect, useRef, useState } from "react";
const directions = {
  Up: [0, -2],
  Left: [-2, 0],
  Down: [0, 2],
  Right: [2, 0],
} as const;
export function MovementPad({
  onMove,
}: {
  onMove: (x: number, y: number) => void;
}) {
  const [held, setHeld] = useState<keyof typeof directions | null>(null);
  const move = useRef(onMove);
  useEffect(() => {
    move.current = onMove;
  }, [onMove]);
  useEffect(() => {
    if (!held) return;
    const timer = window.setInterval(
      () => move.current(directions[held][0], directions[held][1]),
      80,
    );
    return () => window.clearInterval(timer);
  }, [held]);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3">
      <span className="text-xs text-[#d0deeb]">
        Hold to walk · tap ground to travel
      </span>
      <div
        role="group"
        aria-label="Walk controls"
        className="grid grid-cols-3 gap-1"
      >
        {(Object.keys(directions) as (keyof typeof directions)[]).map(
          (name) => (
            <button
              key={name}
              type="button"
              aria-label={`Walk ${name.toLowerCase()}`}
              className={`grid size-11 touch-none place-items-center rounded-xl border border-white/40 bg-[#203a46] text-xl text-white ${name === "Up" ? "col-start-2" : name === "Left" ? "col-start-1 row-start-2" : "row-start-2"}`}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                move.current(directions[name][0], directions[name][1]);
                setHeld(name);
              }}
              onPointerUp={() => setHeld(null)}
              onPointerCancel={() => setHeld(null)}
              onLostPointerCapture={() => setHeld(null)}
              onBlur={() => setHeld(null)}
              onClick={(event) => {
                if (event.detail === 0)
                  move.current(directions[name][0], directions[name][1]);
              }}
            >
              {name === "Up"
                ? "↑"
                : name === "Left"
                  ? "←"
                  : name === "Down"
                    ? "↓"
                    : "→"}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
