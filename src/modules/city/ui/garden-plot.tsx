"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { GameChoice } from "../domain/game-engine";
import {
  gardenPieces,
  placeGardenPiece,
  type GardenPiece,
  type GardenPlotState,
} from "../domain/garden-layout";
import { GardenSymbol } from "./cinematic-art";
import { gardenChoiceArt } from "./adventure-scenes";
import "./garden-plot.css";

type Drag = { piece: GardenPiece; x: number; y: number } | null;
const pieceNames: Record<GardenPiece, string> = {
  seeds: "Seedlings",
  paths: "Walkway",
  water: "Water",
  signs: "Signs",
  benches: "Seats",
  lights: "Lights",
};

export function GardenPlot({
  choices,
  plot,
  onChange,
}: {
  choices: readonly GameChoice[];
  plot: GardenPlotState;
  onChange: (next: GardenPlotState) => void;
}) {
  const board = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const moved = useRef(false);
  const [tool, setTool] = useState<GardenPiece>("seeds");
  const [drag, setDrag] = useState<Drag>(null);
  const [message, setMessage] = useState(
    "Choose a piece, then tap a square to build.",
  );

  function put(piece: GardenPiece, index: number) {
    onChange(placeGardenPiece(plot, piece, index));
    setMessage(
      `${pieceNames[piece]} ${plot[index] === piece ? "removed from" : "placed in"} square ${index + 1}.`,
    );
  }

  function dragStart(
    event: PointerEvent<HTMLButtonElement>,
    piece: GardenPiece,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    moved.current = false;
    origin.current = { x: event.clientX, y: event.clientY };
    setTool(piece);
    setDrag({ piece, x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function dragMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    if (
      Math.hypot(
        event.clientX - origin.current.x,
        event.clientY - origin.current.y,
      ) > 8
    ) {
      moved.current = true;
    }
    setDrag({ ...drag, x: event.clientX, y: event.clientY });
  }
  function dragEnd(event: PointerEvent<HTMLButtonElement>) {
    if (drag && moved.current && board.current) {
      const rect = board.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      if (x >= 0 && x < 1 && y >= 0 && y < 1) {
        put(drag.piece, Math.floor(y * 4) * 4 + Math.floor(x * 4));
      } else {
        setMessage("Drop inside the garden. No changes were made.");
      }
    }
    setDrag(null);
  }
  const controls = {
    onPointerMove: dragMove,
    onPointerUp: dragEnd,
    onPointerCancel: () => setDrag(null),
    onLostPointerCapture: () => setDrag(null),
  };

  return (
    <div className="garden-builder min-w-0">
      <div className="mb-3 flex min-w-0 flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold tracking-widest text-[#f1cb88] uppercase">
            Build it yourself
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-white">
            Your garden, your design
          </h3>
        </div>
        <p className="text-xs text-[#b6cfd6]">
          {gardenPieces(plot).length} / {choices.length} placed
        </p>
      </div>
      <p className="mb-3 text-xs leading-5 text-[#c7dce5]">
        Drag a material onto the garden—or choose a material and tap an empty square.
        Tap an occupied square to remove it. Try more than one layout.
      </p>
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <section
          aria-label="Garden building materials"
          className="min-w-0 rounded-2xl border border-white/15 bg-[#112e39] p-2.5 sm:p-3"
        >
          <div className="grid grid-cols-3 gap-2">
            {choices.map((choice) => {
              const id = choice.id as GardenPiece;
              const art = gardenChoiceArt[id];
              const active = tool === id;
              const placed = plot.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  {...controls}
                  onPointerDown={(event) => dragStart(event, id)}
                  onClick={() => {
                    if (moved.current) {
                      moved.current = false;
                      return;
                    }
                    setTool(id);
                    setMessage(
                      `${pieceNames[id]} selected. Tap a square to place it.`,
                    );
                  }}
                  aria-pressed={active}
                  aria-label={`Choose ${choice.label}`}
                  className={`garden-material flex min-h-24 min-w-0 touch-none flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border px-1.5 py-2 text-center transition-transform active:scale-95 sm:min-h-28 ${active ? "border-[#f2ce88] bg-[#284d48]" : "border-white/20 bg-[#0a2330] hover:border-white/50"}`}
                >
                  <span
                    className="grid size-9 place-items-center rounded-xl bg-black/25"
                    style={{ color: art.accent }}
                  >
                    <GardenSymbol name={art.symbol} className="size-6" />
                  </span>
                  <strong className="max-w-full text-[0.7rem] leading-4 font-bold text-white sm:text-xs">
                    {choice.label}
                  </strong>
                  <span className="text-[0.62rem] text-[#c3d8df]">
                    {choice.cost} supplies
                  </span>
                  {placed && (
                    <span className="text-[0.6rem] font-semibold text-[#a2e8bc]">
                      ✓ On plot
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <section
          aria-label="Interactive garden plot"
          className="min-w-0 rounded-2xl border border-[#85ad91]/40 bg-[#1c423d] p-2.5 sm:p-3"
        >
          <div className="relative mx-auto max-w-[24rem]">
            <div
              ref={board}
              role="group"
              aria-label="Four by four garden building grid"
              className="garden-land grid aspect-square w-full min-w-0 grid-cols-4 grid-rows-4 gap-1 rounded-xl border-4 border-[#76987e] p-1.5"
            >
              {plot.map((piece, index) => {
                const content = piece ? gardenChoiceArt[piece] : null;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (moved.current) {
                        moved.current = false;
                        return;
                      }
                      // Tapping an occupied tile removes that piece regardless
                      // of the tool last selected. Replacement is deliberate:
                      // remove first, then place the new material.
                      put(piece ?? tool, index);
                    }}
                    aria-label={`Garden square ${index + 1}: ${piece ? pieceNames[piece] : "empty"}`}
                    className={`garden-tile relative grid min-h-0 min-w-0 place-items-center overflow-hidden rounded-lg border border-white/15 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#f4d18b] ${piece ? "garden-filled bg-[#2b725e]" : "bg-[#426e49]/45 hover:bg-[#477e52]/70"}`}
                  >
                    <span
                      className="absolute top-0.5 left-1 text-[0.55rem] text-white/45"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    {piece && content && (
                      <span
                        className="garden-planted flex flex-col items-center gap-0.5"
                        style={{ color: content.accent }}
                      >
                        <GardenSymbol
                          name={content.symbol}
                          className="size-6 sm:size-8"
                        />
                        <span className="max-w-full truncate text-[0.55rem] font-bold text-white sm:text-[0.65rem]">
                          {pieceNames[piece]}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mx-auto mt-2 w-fit rounded-lg border border-[#dcb47a]/50 bg-[#152e2a] px-3 py-1 text-[0.68rem] font-bold text-[#f5d48e]">
              ↑ South gate · Entrance
            </div>
          </div>
        </section>
      </div>
      <p
        aria-live="polite"
        role="status"
        className="mt-2 min-h-5 text-xs text-[#f1d89f]"
      >
        {message}
      </p>
      <p className="mt-1 text-xs leading-5 text-[#b6d0d8]">
        Place signs and paths near the gate. Water belongs beside seedlings;
        seats work best beside a path.
      </p>
      {drag && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-[80] grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border border-[#f0cb7e]/70 bg-[#1e5846]/95 shadow-2xl"
          style={{ left: drag.x, top: drag.y }}
        >
          <GardenSymbol
            name={gardenChoiceArt[drag.piece].symbol}
            className="size-10 text-[#f0ce8a]"
          />
        </span>
      )}
    </div>
  );
}
