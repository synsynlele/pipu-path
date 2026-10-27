"use client";

import { useRef, useState, type PointerEvent } from "react";

type Piece = "post" | "counter" | "roof";
const names: Record<Piece, string> = {
  post: "Support",
  counter: "Counter",
  roof: "Roof",
};
/** Pointer capture keeps the same interaction working with touch, pen and mouse. */
export function StallWorkbench({
  build,
  onChange,
}: {
  build: (Piece | null)[];
  onChange: (next: (Piece | null)[]) => void;
}) {
  const board = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Piece>("post");
  const [drag, setDrag] = useState<{
    piece: Piece;
    source: number | null;
    x: number;
    y: number;
  } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const moved = useRef(false);
  function begin(
    event: PointerEvent<HTMLButtonElement>,
    piece: Piece,
    source: number | null,
  ) {
    if (event.button !== 0 || event.currentTarget.disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    moved.current = false;
    setSelected(piece);
    setDrag({ piece, source, x: event.clientX, y: event.clientY });
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4)
      moved.current = true;
    setDrag({ ...drag, x: event.clientX, y: event.clientY });
  }
  function release(event: PointerEvent<HTMLButtonElement>) {
    if (drag && moved.current && board.current) {
      const rect = board.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      if (x >= 0 && x < 1 && y >= 0 && y < 1) {
        const target = Math.floor(y * 3) * 3 + Math.floor(x * 3);
        const next = [...build];
        if (drag.source !== null) next[drag.source] = next[target];
        next[target] = drag.piece;
        onChange(next);
        setAnnouncement(
          `${names[drag.piece]} placed in row ${Math.floor(target / 3) + 1}, column ${(target % 3) + 1}.`,
        );
      } else
        setAnnouncement(
          "Drop inside the workbench. Your pieces are unchanged.",
        );
    }
    setDrag(null);
  }
  const handlers = {
    onPointerMove: move,
    onPointerUp: release,
    onPointerCancel: () => setDrag(null),
    onLostPointerCapture: () => setDrag(null),
  };
  return (
    <div className="stall-workbench">
      <p className="mb-3 text-sm text-[#f1ce8e]">
        Drag materials onto the frame. Move a placed piece to rearrange it.
      </p>
      <div
        ref={board}
        className="stall-frame grid grid-cols-3 gap-2"
        aria-label="Stall assembly board"
      >
        {build.map((cell, index) => (
          <button
            key={index}
            type="button"
            {...handlers}
            onPointerDown={(event) => cell && begin(event, cell, index)}
            onClick={() => {
              if (moved.current) {
                moved.current = false;
                return;
              }
              const next = [...build];
              next[index] = cell === selected ? null : selected;
              onChange(next);
            }}
            aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: ${cell ?? "empty"}`}
            className={`stall-cell relative grid min-h-24 touch-none place-items-center rounded-xl border border-white/25 ${cell ? "bg-[#3d514a]" : "bg-[#071c29]/65"}`}
          >
            <span className="absolute top-1 left-2 text-[10px] text-[#b6cbd6]">
              {index + 1}
            </span>
            {cell && (
              <span
                aria-hidden="true"
                className={`stall-piece stall-${cell}`}
              />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2" aria-label="Choose a building piece">
        {(Object.keys(names) as Piece[]).map((id) => (
          <button
            key={id}
            type="button"
            {...handlers}
            onPointerDown={(event) => begin(event, id, null)}
            onClick={() => setSelected(id)}
            aria-pressed={selected === id}
            className={`flex min-h-24 min-w-0 flex-1 touch-none flex-col items-center justify-center gap-2 rounded-xl border p-2 text-xs ${selected === id ? "border-[#f1ce8e] bg-[#40505a]" : "border-white/25 bg-[#0b1e2d]"}`}
          >
            <span aria-hidden="true" className={`stall-piece stall-${id}`} />
            {names[id]}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#c6d6e2]">
        Keyboard or tap: choose a material, then a square. Repeat to remove it.
        Dragging between occupied squares swaps the pieces.
      </p>
      <p role="status" className="mt-2 text-xs text-[#f1ce8e]">
        {announcement}
      </p>
      {drag && (
        <span
          aria-hidden="true"
          className="stall-drag pointer-events-none fixed z-50"
          style={{ left: drag.x, top: drag.y }}
        >
          <span className={`stall-piece stall-${drag.piece}`} />
        </span>
      )}
    </div>
  );
}
