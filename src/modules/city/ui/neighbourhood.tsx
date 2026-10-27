"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { MovementPad } from "./movement-pad";
import { StallWorkbench } from "./stall-workbench";
import { LessonPath } from "./lesson-path";
import { CityIcon } from "./city-art";
import {
  spots,
  routeNodes,
  freshNeighbourhood,
  encounterReady,
  finishEncounter,
  evaluateSign,
  evaluateStall,
  appendRoute,
  evaluateRoute,
  parseNeighbourhood,
  type Spot,
  type NeighbourhoodSave,
  type Encounter,
} from "../domain/neighbourhood";
import "./adventure-theme.css";
import "./neighbourhood.css";

const coats = { gold: "#f0c579", indigo: "#b5a4ef", teal: "#8be0cb" };

export function Neighbourhood({
  userId,
  questHref,
  questTitle,
}: {
  userId: string;
  questHref: string;
  questTitle: string | null;
}) {
  const [state, setState] = useState(freshNeighbourhood);
  const [active, setActive] = useState<Spot>("workshop");
  const [keep, setKeep] = useState(false);
  const [notice, setNotice] = useState("");
  const [feedback, setFeedback] = useState("");
  const [signTested, setSignTested] = useState(false);
  const [running, setRunning] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const storageKey = `pipupath.neighbourhood.v1:${userId}`;
  const allDone = state.completed.length === 3;
  function update(next: NeighbourhoodSave) {
    setState(next);
    if (keep)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        setNotice(
          "Your browser could not save this adventure. You can keep playing in this tab.",
        );
      }
  }
  function visit(id: Spot) {
    const target = spots.find((s) => s.id === id)!;
    update({
      ...state,
      position: {
        x: Math.min(88, target.x + 17),
        y: Math.min(90, target.y + 14),
      },
    });
    setActive(id);
    setFeedback("");
    setSignTested(false);
    setRunning(false);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-5, 0],
      ArrowRight: [5, 0],
      ArrowUp: [0, -5],
      ArrowDown: [0, 5],
    };
    if (!delta[event.key]) return;
    event.preventDefault();
    const [x, y] = delta[event.key];
    update({
      ...state,
      position: {
        x: Math.max(6, Math.min(94, state.position.x + x)),
        y: Math.max(12, Math.min(90, state.position.y + y)),
      },
    });
  }
  function saveToggle(checked: boolean) {
    setKeep(checked);
    try {
      if (checked) {
        localStorage.setItem(storageKey, JSON.stringify(state));
        setNotice("Adventure saved on this device.");
      } else {
        localStorage.removeItem(storageKey);
        setNotice("Device save removed. Your current game stays open.");
      }
    } catch {
      setKeep(false);
      setNotice("Device saving is unavailable. You can still play.");
    }
  }
  function resume() {
    try {
      const saved = parseNeighbourhood(localStorage.getItem(storageKey));
      if (!saved) {
        setNotice(
          "No compatible adventure saved here. Your current game is unchanged.",
        );
        return;
      }
      setState(saved);
      setKeep(true);
      setActive("workshop");
      setFeedback("");
      setNotice(
        "Your saved neighbourhood is back. Real-world Quest progress is separate.",
      );
    } catch {
      setNotice(
        "This browser could not open the device save. Your current game is unchanged.",
      );
    }
  }
  function complete(id: Encounter) {
    update(finishEncounter(state, id));
    setFeedback(
      id === "ada"
        ? "Ada: That arrow leads right to the market! Timi can use your invitation at his stall."
        : id === "timi"
          ? `Timi: The ${state.motif} stall is ready. Mama Jo has the supplies we need.`
          : "Mama Jo: Supplies made it through the side lane. Your neighbourhood is ready for opening night.",
    );
  }
  const locked = active !== "workshop" && !encounterReady(state, active);
  const finished = active !== "workshop" && state.completed.includes(active);
  return (
    <main
      id="main-content"
      className="adventure-dark neighbourhood min-w-0 overflow-x-clip pb-16"
    >
      <div className="mx-auto max-w-6xl space-y-5 px-3 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/build/adventures"
            className="inline-flex min-h-11 items-center text-sm"
          >
            ← All adventures
          </Link>
          <span className="rounded-full border border-white/25 px-3 py-2 text-xs text-[#f1ce8e]">
            Your neighbourhood · Practice story
          </span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-widest text-[#f1ce8e] uppercase">
              Small beginnings. Your next possibility.
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Make a place. Make your mark.
            </h1>
          </div>
          <p className="text-sm text-[#c5d6e6]">
            {state.completed.length} / 3 encounters resolved
          </p>
        </div>
        <LessonPath
          title="Your neighbourhood missions"
          nodes={[
            {
              id: "ada",
              title: "Find the way",
              state: state.completed.includes("ada") ? "done" : "current",
            },
            {
              id: "timi",
              title: "Build the stall",
              state: state.completed.includes("timi")
                ? "done"
                : state.completed.includes("ada")
                  ? "current"
                  : "locked",
            },
            {
              id: "mama",
              title: "Deliver supplies",
              state: state.completed.includes("mama")
                ? "done"
                : state.completed.includes("timi")
                  ? "current"
                  : "locked",
            },
          ]}
          onSelect={(id) => visit(id as Encounter)}
        />
        <div className="grid items-start gap-5 lg:grid-cols-[1.15fr_1fr]">
          <section
            aria-label="Your neighbourhood map"
            className="overflow-hidden rounded-3xl border border-white/20 bg-[#102b3b]"
          >
            <div
              role="group"
              aria-label="Neighbourhood movement area. Tap the ground to move, or focus here and use arrow keys."
              tabIndex={0}
              onKeyDown={keyboard}
              onClick={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("button")
                )
                  return;
                const rect = event.currentTarget.getBoundingClientRect();
                update({
                  ...state,
                  position: {
                    x: Math.max(
                      6,
                      Math.min(
                        94,
                        ((event.clientX - rect.left) / rect.width) * 100,
                      ),
                    ),
                    y: Math.max(
                      12,
                      Math.min(
                        90,
                        ((event.clientY - rect.top) / rect.height) * 100,
                      ),
                    ),
                  },
                });
              }}
              className="neighbourhood-map relative isolate touch-manipulation overflow-hidden"
            >
              <Image
                src="/city/neighbourhood-dusk.webp"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="neighbourhood-backdrop pointer-events-none object-cover"
                preload
              />
              <div className="pointer-events-none absolute inset-0 bg-[#071a29]/30" />
              <div
                aria-hidden="true"
                className="scene-atmosphere pointer-events-none absolute inset-0"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 size-full"
              >
                <path
                  d="M22 77 27 30 71 34 72 76 22 77"
                  fill="none"
                  stroke="#f6d693"
                  strokeWidth=".5"
                  strokeDasharray="1.5 2"
                  opacity=".65"
                />
              </svg>
              {spots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => visit(spot.id)}
                  aria-label={`Visit ${spot.name}: ${spot.title}${spot.id !== "workshop" && state.completed.includes(spot.id) ? ", resolved" : ""}`}
                  className={`neighbourhood-place absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-2 py-2 text-xs ${active === spot.id ? "border-[#f1ce8e] bg-[#203a46]" : "border-white/50 bg-[#0a1d2e]/95"}`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  {spot.id !== "workshop" && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2"
                    >
                      <Player
                        coat={
                          spot.id === "ada"
                            ? "#b5a4ef"
                            : spot.id === "timi"
                              ? "#8be0cb"
                              : "#f0c579"
                        }
                      />
                    </span>
                  )}
                  <span className="block font-bold">{spot.name}</span>
                  <span className="mt-1 flex items-center justify-center gap-1 text-[10px] text-[#f1ce8e]">
                    <CityIcon
                      name={
                        spot.id === "workshop"
                          ? "supplies"
                          : spot.id === "ada"
                            ? "signs"
                            : spot.id === "timi"
                              ? "art"
                              : "people"
                      }
                      className="size-3.5"
                    />
                    {spot.id !== "workshop" && state.completed.includes(spot.id)
                      ? "Ready for opening"
                      : spot.title}
                  </span>
                </button>
              ))}
              {state.completed.includes("ada") && (
                <span
                  aria-hidden="true"
                  className="absolute top-[48%] left-[36%] rounded bg-[#f1ce8e] px-2 text-lg font-bold text-[#152538]"
                >
                  →
                </span>
              )}
              {state.completed.includes("timi") && (
                <span
                  aria-hidden="true"
                  className="absolute top-[51%] right-[13%] rounded-xl bg-[#0a1d2e] p-2 text-[#f1ce8e]"
                >
                  <CityIcon
                    name={
                      state.motif === "music"
                        ? "music"
                        : state.motif === "art"
                          ? "art"
                          : "food"
                    }
                    className="size-8"
                  />
                </span>
              )}
              {allDone && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-5 top-[12%] flex justify-center gap-1"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <span
                      key={i}
                      className="size-2 rounded-full bg-[#f1ce8e] shadow-[0_0_12px_#f1ce8e]"
                    />
                  ))}
                </div>
              )}
              <div
                aria-hidden="true"
                className="neighbourhood-avatar pointer-events-none absolute -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${state.position.x}%`,
                  top: `${state.position.y}%`,
                }}
              >
                <span
                  key={`${state.position.x}-${state.position.y}`}
                  className="walking-character block"
                >
                  <Player coat={coats[state.avatar]} />
                </span>
                <span className="block rounded-full bg-[#0a1d2e] px-2 text-center text-[10px] text-white">
                  You
                </span>
              </div>
            </div>
            <MovementPad
              onMove={(x, y) =>
                update({
                  ...state,
                  position: {
                    x: Math.max(6, Math.min(94, state.position.x + x)),
                    y: Math.max(12, Math.min(90, state.position.y + y)),
                  },
                })
              }
            />
            <p className="px-4 pb-3 text-xs leading-5 text-[#d0deeb]">
              Tap the ground to move. Tap a neighbour to talk. Keyboard: focus
              the map and use arrow keys.
            </p>
          </section>
          <section className="rounded-3xl border border-white/20 bg-[#102b3b] p-4 sm:p-5">
            <h2
              ref={heading}
              tabIndex={-1}
              className="text-2xl font-bold outline-none"
            >
              {active === "workshop"
                ? "Your workshop"
                : active === "ada"
                  ? "Ada · The invitation"
                  : active === "timi"
                    ? "Timi · Build the stall"
                    : "Mama Jo · Bring it together"}
            </h2>
            {locked ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm leading-6">
                  {active === "timi"
                    ? "Timi: First, help Ada show neighbours the way. Then we can make a stall worth finding."
                    : "Mama Jo: Timi needs a working stall before I can bring the supplies."}
                </p>
                <Button
                  className="adventure-action rounded-full"
                  onClick={() => visit(active === "timi" ? "ada" : "timi")}
                >
                  Meet {active === "timi" ? "Ada" : "Timi"} →
                </Button>
              </div>
            ) : finished && !feedback ? (
              <div className="mt-4 space-y-4">
                <p className="rounded-2xl bg-[#123e36] p-4 text-sm leading-6">
                  {active === "ada"
                    ? `Ada: Your ${state.motif} invitation is still showing everyone the way. Timi is waiting.`
                    : active === "timi"
                      ? `Timi: Your ${state.motif} stall is standing. Let's ask Mama Jo about supplies.`
                      : "Mama Jo: I remember your route. Everyone is ready for the opening."}
                </p>
                <Button
                  className="adventure-action rounded-full"
                  onClick={() =>
                    visit(
                      active === "ada"
                        ? "timi"
                        : active === "timi"
                          ? "mama"
                          : "workshop",
                    )
                  }
                >
                  Continue the story →
                </Button>
              </div>
            ) : (
              <fieldset disabled={finished} className="min-w-0">
                {active === "workshop" && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm leading-6 text-[#d0deeb]">
                      {allDone
                        ? "The signs are up. Your stall is standing. The supplies arrived. Look what your decisions made possible."
                        : "An overlooked square. Three neighbours with a plan. Start with Ada, then see where your choices take you."}
                    </p>
                    <fieldset>
                      <legend className="mb-2 text-xs font-semibold">
                        Choose your jacket
                      </legend>
                      <div className="flex gap-2">
                        {(["gold", "indigo", "teal"] as const).map((color) => (
                          <label
                            key={color}
                            className="flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-3 text-xs capitalize"
                          >
                            <input
                              type="radio"
                              name="avatar"
                              checked={state.avatar === color}
                              onChange={() =>
                                update({ ...state, avatar: color })
                              }
                            />
                            <span
                              aria-hidden="true"
                              className="size-3 rounded-full"
                              style={{ background: coats[color] }}
                            />
                            {color}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <Button
                      className="adventure-action rounded-full"
                      onClick={() => visit(allDone ? "mama" : "ada")}
                    >
                      {allDone ? "Visit the neighbourhood →" : "Meet Ada →"}
                    </Button>
                  </div>
                )}
                {active === "ada" && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm leading-6">
                      “The invitation is ready, but the sign is pointing
                      nowhere. Show people where the market is.”
                    </p>
                    <div
                      className="relative h-40 overflow-hidden rounded-2xl border border-white/20 bg-[#173c46]"
                      aria-label="Invitation scene: people start on the left, sign at the centre, market gate on the right"
                    >
                      <span className="absolute top-3 left-3 text-xs">
                        Neighbours
                      </span>
                      <span className="absolute top-3 right-3 text-xs text-[#f1ce8e]">
                        Market gate
                      </span>
                      <div className="absolute inset-x-5 top-20 border-t-4 border-dashed border-[#e0d9b3]" />
                      <span className="absolute top-14 left-1/2 -translate-x-1/2 rounded-xl bg-[#f1ce8e] px-4 py-1 text-4xl text-[#152538]">
                        {state.sign === "left"
                          ? "←"
                          : state.sign === "right"
                            ? "→"
                            : "↑"}
                      </span>
                      <div
                        aria-hidden="true"
                        className={`invitation-runner absolute top-[68px] ${signTested ? (evaluateSign(state.sign) ? "invitation-right" : "invitation-wrong") : ""}`}
                      >
                        <Player coat="#8be0cb" />
                      </div>
                      <span className="absolute right-5 bottom-3 text-xs">
                        {state.motif} night
                      </span>
                    </div>
                    <fieldset>
                      <legend className="mb-2 text-xs">
                        Give the invitation your style
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {(["music", "art", "food"] as const).map((motif) => (
                          <label
                            key={motif}
                            className="flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-3 text-sm capitalize"
                          >
                            <input
                              type="radio"
                              name="motif"
                              checked={state.motif === motif}
                              onChange={() => update({ ...state, motif })}
                            />
                            <CityIcon name={motif} className="size-4" />
                            {motif}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div
                      className="grid grid-cols-3 gap-2"
                      aria-label="Point the sign"
                    >
                      {(["left", "up", "right"] as const).map((direction) => (
                        <button
                          key={direction}
                          aria-label={`Point ${direction}`}
                          aria-pressed={state.sign === direction}
                          onClick={() => {
                            update({ ...state, sign: direction });
                            setSignTested(false);
                            setFeedback("");
                          }}
                          className={`min-h-12 rounded-xl border text-2xl ${state.sign === direction ? "border-[#f1ce8e] bg-[#40505a]" : "border-white/25 bg-[#0b1e2d]"}`}
                        >
                          {direction === "left"
                            ? "←"
                            : direction === "right"
                              ? "→"
                              : "↑"}
                        </button>
                      ))}
                    </div>
                    <Button
                      className="adventure-action rounded-full"
                      onClick={() => {
                        setSignTested(true);
                        if (evaluateSign(state.sign)) complete("ada");
                        else
                          setFeedback(
                            "Ada: The market gate is to the right. Watch where your sign sends people, then turn it and try again.",
                          );
                      }}
                    >
                      Test the invitation →
                    </Button>
                  </div>
                )}
                {active === "timi" && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm leading-6">
                      “Ada&apos;s {state.motif} invitation worked. Let&apos;s
                      make a stall: a roof across the top, a support on each
                      side, and a counter at the bottom.”
                    </p>
                    <StallWorkbench
                      build={state.build}
                      onChange={(build) => {
                        update({ ...state, build });
                        setFeedback("");
                      }}
                    />
                    <Button
                      className="adventure-action rounded-full"
                      onClick={() => {
                        if (evaluateStall(state.build)) complete("timi");
                        else
                          setFeedback(
                            "Timi: Check the three roof squares at the top, two supports in the middle sides, and the counter at bottom centre.",
                          );
                      }}
                    >
                      Test the stall →
                    </Button>
                  </div>
                )}
                {active === "mama" && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm leading-6">
                      “Your {state.motif} stall is ready. Collect supplies, then
                      reach the market. The direct bridge is closed. Plan a
                      connected route in no more than eight moves.”
                    </p>
                    <div
                      className={`route-board relative h-64 rounded-2xl border border-white/20 bg-[#123442] ${running ? "route-running" : ""}`}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className="absolute inset-0 size-full"
                      >
                        <path
                          d="M12 75V23H45V75H12M45 75H85V23"
                          stroke="#819da7"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M45 23H85"
                          stroke="#f19191"
                          strokeDasharray="3 2"
                          fill="none"
                          strokeWidth="2"
                        />
                        <polyline
                          points={state.route
                            .map((id) => {
                              const n = routeNodes.find((n) => n.id === id)!;
                              return `${n.x},${n.y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#f1ce8e"
                          strokeWidth="2"
                        />
                      </svg>
                      {running && (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="delivery-traveller pointer-events-none absolute inset-0 size-full"
                        >
                          <g>
                            <animateMotion
                              dur={`${Math.max(2, state.route.length * 0.65)}s`}
                              fill="freeze"
                              path={state.route
                                .map((id, i) => {
                                  const n = routeNodes.find(
                                    (node) => node.id === id,
                                  )!;
                                  return `${i === 0 ? "M" : "L"}${n.x},${n.y}`;
                                })
                                .join(" ")}
                            />
                            <rect
                              x="-4"
                              y="-3"
                              width="8"
                              height="5"
                              rx="1"
                              fill="#f1ce8e"
                            />
                            <circle cx="-2" cy="3" r="1.5" fill="#fff" />
                            <circle cx="2" cy="3" r="1.5" fill="#fff" />
                          </g>
                        </svg>
                      )}
                      <span className="absolute top-1 left-[54%] text-[10px] text-[#ffc2c2]">
                        Bridge closed
                      </span>
                      {routeNodes.map((node) => (
                        <button
                          key={node.id}
                          onClick={() => {
                            const next = appendRoute(state.route, node.id);
                            if (next === state.route) {
                              setFeedback(
                                "Mama Jo: Choose a place connected by an open path. You can undo your last move.",
                              );
                              return;
                            }
                            update({ ...state, route: next });
                            setFeedback("");
                            setRunning(false);
                          }}
                          className={`absolute z-10 min-h-11 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2 text-[10px] ${state.route[state.route.length - 1] === node.id ? "border-[#f1ce8e] bg-[#40505a]" : "border-white/25 bg-[#0b1e2d]"}`}
                          style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        >
                          {node.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[#c6d6e2]">
                      {state.route.length - 1} / 8 moves ·{" "}
                      {state.route.includes("stores")
                        ? "Supplies collected"
                        : "Visit Supplies first"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        disabled={state.route.length === 1}
                        onClick={() => {
                          update({ ...state, route: state.route.slice(0, -1) });
                          setFeedback("");
                        }}
                      >
                        Undo move
                      </Button>
                      <Button
                        className="adventure-action rounded-full"
                        onClick={() => {
                          setRunning(true);
                          if (evaluateRoute(state.route)) complete("mama");
                          else
                            setFeedback(
                              "Mama Jo: Start at the workshop, collect supplies, then reach the market using open paths in eight moves or fewer.",
                            );
                        }}
                      >
                        Send the supplies →
                      </Button>
                    </div>
                  </div>
                )}
              </fieldset>
            )}
            {feedback && (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-[#e5c789]/40 bg-[#263c3e] p-4 text-sm leading-6"
              >
                {feedback}
              </p>
            )}
            {feedback && finished && (
              <Button
                onClick={() =>
                  visit(
                    active === "ada"
                      ? "timi"
                      : active === "timi"
                        ? "mama"
                        : "workshop",
                  )
                }
                className="adventure-action mt-3 rounded-full"
              >
                Next neighbour →
              </Button>
            )}
          </section>
        </div>
        <section className="grid gap-4 rounded-3xl border border-white/20 bg-[#102b3b] p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <h2 className="text-lg font-bold">Your story so far</h2>
            <ol className="mt-3 space-y-2 text-sm text-[#d0deeb]">
              <li>
                {state.completed.includes("ada")
                  ? `✓ Ada remembers your ${state.motif} invitation.`
                  : "○ Meet Ada and show the way."}
              </li>
              <li>
                {state.completed.includes("timi")
                  ? "✓ Your stall is part of the square."
                  : "○ Help Timi build the stall."}
              </li>
              <li>
                {state.completed.includes("mama")
                  ? "✓ Mama Jo delivered the supplies."
                  : "○ Find a route that works."}
              </li>
            </ol>
          </div>
          <div>
            <h2 className="text-lg font-bold">Take one idea into your life</h2>
            <p className="mt-2 text-sm leading-6 text-[#d0deeb]">
              {questTitle ??
                "Try a useful idea with someone you know, then bring back honest proof through your Quest."}
            </p>
            <ButtonLink
              href={questHref}
              className="adventure-action mt-3 rounded-full"
            >
              Open my real-world Quest →
            </ButtonLink>
            <p className="mt-2 text-xs text-[#c1d2df]">
              Game encounters never complete a real Quest or award verified XP.
            </p>
          </div>
        </section>
        <section className="rounded-2xl border border-white/20 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={keep}
                onChange={(e) => saveToggle(e.target.checked)}
              />
              Keep this adventure on this device
            </label>
            <Button variant="secondary" onClick={resume}>
              Resume device save
            </Button>
          </div>
          <p className="text-xs leading-5 text-[#c1d2df]">
            Saves this fictional character, choices and map on this browser
            only. No real-life notes are stored. Clearing browser data removes
            it. Cloud saves are not included.
          </p>
          {notice && (
            <p role="status" className="mt-2 text-sm text-[#f1ce8e]">
              {notice}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
function Player({ coat }: { coat: string }) {
  return (
    <svg width="28" height="48" viewBox="0 0 28 48" aria-hidden="true">
      <ellipse cx="14" cy="44" rx="12" ry="3" fill="#061421" opacity=".6" />
      <path d="M9 30 8 43m11-13 1 13" stroke="#252d51" strokeWidth="6" />
      <path d="M7 17h14l2 15H5Z" fill={coat} />
      <circle cx="14" cy="10" r="7" fill="#b78058" />
      <path d="M7 8q0-10 14-2v3L15 5Z" fill="#2b2331" />
    </svg>
  );
}
