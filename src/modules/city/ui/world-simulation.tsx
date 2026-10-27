"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  WIDTH,
  HEIGHT,
  districts,
  emptyBlueprint,
  evaluateBlueprint,
  getSimulationWorld,
  neighbours,
  parseSimulation,
  placeModule,
  moveModule,
  reserved,
  simulationKey,
  tileCost,
  waterTile,
  type Blueprint,
  type SimulationSave,
  type Tile,
  type WorldSpec,
} from "../domain/world-simulation";
import "./world-simulation.css";
import "./adventure-theme.css";

const glyphs = {
  road: "↔",
  solar: "☀",
  primary: "▥",
  support: "◈",
  nature: "♧",
};
export function MissionExperience({
  worldId,
  userId,
  questHref,
  children,
}: {
  worldId: string;
  userId: string;
  questHref: string;
  children: ReactNode;
}) {
  const [story, setStory] = useState(false);
  const world = getSimulationWorld(worldId);
  if (!world) return children;
  return (
    <>
      <div hidden={story}>
        <WorldSimulation
          key={worldId}
          active={!story}
          world={world}
          userId={userId}
          questHref={questHref}
          onStory={() => setStory(true)}
        />
      </div>
      {story && (
        <>
          <div className="adventure-dark p-3 text-center">
            <button
              className="min-h-11 rounded-full border border-[#edca84] px-5"
              onClick={() => setStory(false)}
            >
              Return to build simulation
            </button>
            <p className="mt-2 text-xs">
              Earlier story saves remain in this mode. Your current build stays
              open.
            </p>
          </div>
          {children}
        </>
      )}
    </>
  );
}

const fresh = (world: WorldSpec): SimulationSave => ({
  version: 1,
  worldId: world.id,
  board: emptyBlueprint(),
  proofs: [],
  baseline: null,
  updatedAt: Date.now(),
});
function stampSave(next: SimulationSave): SimulationSave {
  return { ...next, updatedAt: Date.now() };
}
function moduleName(world: WorldSpec, tile: Tile) {
  return tile === "primary"
    ? world.primary
    : tile === "support"
      ? world.support
      : tile === "nature"
        ? world.nature
        : tile === "solar"
          ? "Solar array"
          : tile === "road"
            ? "Service corridor"
            : "Clear ground";
}
export function WorldSimulation({
  active = true,
  world,
  userId,
  questHref,
  onStory,
}: {
  active?: boolean;
  world: WorldSpec;
  userId: string;
  questHref: string;
  onStory: () => void;
}) {
  const [game, setGame] = useState(() => fresh(world));
  const [tool, setTool] = useState<Tile>("road");
  const [running, setRunning] = useState(false);
  const [tested, setTested] = useState(false);
  const [keep, setKeep] = useState(false);
  const keepRef = useRef(false);
  const [notice, setNotice] = useState(
    "Connect your service corridors to HQ. Facilities need a corridor beside them.",
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(false);
  const [drag, setDrag] = useState<{
    tile: Tile;
    source: number | null;
    x: number;
    y: number;
  } | null>(null);
  const [selection, setSelection] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const board = useRef<SVGSVGElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const camera = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const moved = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const done = game.proofs.length === world.levels.length;
  const level = Math.min(game.proofs.length, world.levels.length - 1);
  const stressed = Boolean(game.baseline) || done;
  const report = evaluateBlueprint(world, game.board, level, stressed);
  function update(next: SimulationSave) {
    const value = stampSave(next);
    setGame(value);
    if (keepRef.current)
      try {
        localStorage.setItem(
          simulationKey(userId, world.id),
          JSON.stringify(value),
        );
      } catch {
        setKeep(false);
        keepRef.current = false;
        setNotice("Device storage is unavailable. Keep playing in this tab.");
      }
  }
  function put(index: number, tile = tool) {
    if (running) return;
    setSelection(index);
    const next = placeModule(world, game.board, index, tile);
    if (next === game.board) {
      setNotice(
        reserved(index)
          ? "HQ and residential zones must stay clear."
          : "Cannot place here: check budget or river terrain.",
      );
      return;
    }
    update({ ...game, board: next });
    setTested(false);
    setNotice(
      `${moduleName(world, tile)} ${tile ? "placed" : "removed"} at ${String.fromCharCode(65 + (index % WIDTH))}${Math.floor(index / WIDTH) + 1}.`,
    );
  }
  function simulate() {
    if (running) return;
    setRunning(true);
    setTested(false);
    setNotice(
      "Simulation running: checking access, capacity, power and environmental requirements…",
    );
    timer.current = setTimeout(() => {
      setRunning(false);
      setTested(true);
      if (!report.success) {
        setNotice(
          "The system has weaknesses. Inspect the report, redesign, then test again.",
        );
        return;
      }
      if (done) {
        setNotice(
          "Redesign passed. Your completed missions remain recorded in the device save if enabled.",
        );
        return;
      }
      if (!game.baseline) {
        update({ ...game, baseline: [...game.board] });
        setNotice(
          `Normal operation passed. Conditions changed: ${world.forecast} Repair the same system, then run the stress test.`,
        );
      } else {
        update({
          ...game,
          proofs: [
            ...game.proofs,
            { before: game.baseline, after: [...game.board] },
          ],
          baseline: null,
        });
        setNotice(
          "Stress test passed. This practice mission is complete. Continue to expand the same project.",
        );
      }
    }, 1800);
  }
  function pause() {
    if (timer.current) clearTimeout(timer.current);
    setRunning(false);
    setNotice("Simulation paused. No completion was recorded.");
  }
  function toggleSave() {
    try {
      if (keep) {
        setKeep(false);
        keepRef.current = false;
        localStorage.removeItem(simulationKey(userId, world.id));
        setNotice("Device save removed; current project stays open.");
      } else {
        localStorage.setItem(
          simulationKey(userId, world.id),
          JSON.stringify(game),
        );
        setKeep(true);
        keepRef.current = true;
        setNotice(
          "Project saved on this browser. Cloud saving is not included.",
        );
      }
    } catch {
      setNotice(
        "Device saving is unavailable. Your current project remains playable.",
      );
    }
  }
  function resume() {
    try {
      const saved = parseSimulation(
        localStorage.getItem(simulationKey(userId, world.id)),
        world,
      );
      if (!saved) {
        setNotice(
          "No compatible build simulation saved here. Earlier story saves remain in Story practice.",
        );
        return;
      }
      setGame(saved);
      setKeep(true);
      keepRef.current = true;
      setTested(false);
      setNotice("Saved build project restored.");
    } catch {
      setNotice("This browser cannot read device saves.");
    }
  }
  function startDrag(
    event: PointerEvent<Element>,
    tile: Tile,
    source: number | null = null,
  ) {
    if (running || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = { x: event.clientX, y: event.clientY };
    moved.current = false;
    setTool(tile);
    setDrag({ tile, source, x: event.clientX, y: event.clientY });
  }
  function moveDrag(event: PointerEvent<Element>) {
    if (!drag) return;
    if (
      Math.hypot(
        event.clientX - origin.current.x,
        event.clientY - origin.current.y,
      ) > 5
    )
      moved.current = true;
    setDrag({ ...drag, x: event.clientX, y: event.clientY });
  }
  function endDrag(event: PointerEvent<Element>) {
    if (drag && moved.current && board.current) {
      const rect = board.current.getBoundingClientRect();
      const x = Math.floor(((event.clientX - rect.left) / rect.width) * WIDTH),
        y = Math.floor(((event.clientY - rect.top) / rect.height) * HEIGHT);
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        const target = y * WIDTH + x;
        if (drag.source !== null) {
          const next = moveModule(world, game.board, drag.source, target);
          if (next !== game.board) {
            update({ ...game, board: next });
            setTested(false);
            setNotice(
              "Module moved. Re-test the system after changing its layout.",
            );
          } else
            setNotice("That move is blocked by terrain or a reserved zone.");
        } else put(target, drag.tile);
      } else setNotice("Drop inside the world. Your project is unchanged.");
    }
    setDrag(null);
  }
  const canStartNext =
    tested &&
    game.proofs.length > 0 &&
    !game.baseline &&
    !done &&
    report.success;
  return (
    <main
      id={active ? "main-content" : undefined}
      className="adventure-dark world-simulation min-w-0 overflow-x-clip pb-16"
    >
      <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/build/adventures"
            className="inline-flex min-h-11 items-center text-sm"
          >
            ← Adventure path
          </Link>
          <span className="text-xs text-[#f0cf8b]">
            Build simulation · fictional systems · no verified XP
          </span>
          <button
            onClick={onStory}
            disabled={running}
            className="min-h-11 rounded-full border border-white/30 px-4 text-xs"
          >
            Story practice / earlier saves
          </button>
        </header>
        <div>
          <p className="text-xs tracking-widest text-[#efcc8d] uppercase">
            {world.title} · Mission {level + 1}/{world.levels.length}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-4xl">
            {world.project}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#cbdde6]">
            {world.brief}
          </p>
        </div>
        <ol
          aria-label="Build mission progression"
          className="flex flex-wrap gap-2"
        >
          {world.levels.map((label, i) => (
            <li
              key={label}
              className={`rounded-xl border px-3 py-2 text-xs ${i < game.proofs.length ? "border-emerald-300 bg-emerald-950" : i === level ? "border-[#edca84] bg-[#443b29]" : "border-white/20"}`}
            >
              {i < game.proofs.length ? "✓" : i + 1} {label}
            </li>
          ))}
        </ol>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section
            aria-label="Interactive project world"
            className="simulation-scene min-w-0 overflow-hidden rounded-3xl border border-white/25"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#102c3b] px-3 py-2 text-xs">
              <strong>
                {stressed ? "STRESS TEST" : "NORMAL OPERATION"} ·{" "}
                {world.levels[level]}
              </strong>
              <span>
                {report.cost}/{world.budget} construction credits
              </span>
              <div className="flex gap-1">
                <button
                  aria-label="Zoom out"
                  onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}
                >
                  −
                </button>
                <button
                  aria-label="Zoom in"
                  onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                >
                  +
                </button>
                <button aria-pressed={pan} onClick={() => setPan(!pan)}>
                  {pan ? "Place modules" : "Move camera"}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                disabled={running}
                onClick={simulate}
                className="adventure-action min-h-12 flex-1 rounded-full px-4 text-sm font-bold"
              >
                {done
                  ? "Test redesign"
                  : game.baseline
                    ? "Run stress test"
                    : "Run normal operation"}
              </button>
              {running && (
                <button
                  onClick={pause}
                  className="min-h-12 rounded-full border px-4 text-sm"
                >
                  Pause
                </button>
              )}
            </div>
            <p
              role="status"
              className="rounded-2xl border border-white/20 bg-[#163440] p-3 text-sm leading-6"
            >
              {notice}
            </p>
            <div
              ref={viewport}
              className={`simulation-viewport ${pan ? "camera-pan" : ""}`}
              onPointerDown={(event) => {
                if (!pan) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                camera.current = {
                  x: event.clientX,
                  y: event.clientY,
                  left: event.currentTarget.scrollLeft,
                  top: event.currentTarget.scrollTop,
                };
              }}
              onPointerMove={(event) => {
                if (!camera.current) return;
                event.currentTarget.scrollLeft =
                  camera.current.left + camera.current.x - event.clientX;
                event.currentTarget.scrollTop =
                  camera.current.top + camera.current.y - event.clientY;
              }}
              onPointerUp={() => {
                camera.current = null;
              }}
              onPointerCancel={() => {
                camera.current = null;
              }}
            >
              <svg
                ref={board}
                role="group"
                aria-label="Construction world. Columns A to L, rows 1 to 8. Arrow keys move focus; Enter places the selected tool."
                viewBox="0 0 864 576"
                style={{
                  width: 864 * zoom,
                  height: 576 * zoom,
                  maxWidth: "none",
                }}
                className={`simulation-board ${running ? "simulation-running" : ""} ${stressed ? `weather-${world.event}` : ""}`}
              >
                <defs>
                  <linearGradient id="ground" x2="1" y2="1">
                    <stop stopColor="#2f635d" />
                    <stop offset="1" stopColor="#153542" />
                  </linearGradient>
                  <pattern
                    id="rain"
                    width="25"
                    height="25"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="m5 0-5 12m20 5-5 12"
                      stroke="#c3e8f7"
                      strokeOpacity=".5"
                    />
                  </pattern>
                  <filter id="building-shadow">
                    <feDropShadow
                      dx="6"
                      dy="9"
                      stdDeviation="4"
                      floodOpacity=".45"
                    />
                  </filter>
                </defs>
                <rect width="864" height="576" fill="url(#ground)" />
                {game.board.map((tile, i) => {
                  const x = (i % WIDTH) * 72,
                    y = Math.floor(i / WIDTH) * 72;
                  const house = districts.find((d) => d.y * WIDTH + d.x === i);
                  const wet = waterTile(world, i);
                  const offline = report.offline.includes(i);
                  return (
                    <g
                      key={i}
                      role="button"
                      tabIndex={0}
                      data-cell={i}
                      aria-label={`${String.fromCharCode(65 + (i % WIDTH))}${Math.floor(i / WIDTH) + 1}: ${i === 0 ? "HQ" : house ? house.name : moduleName(world, tile)}`}
                      onPointerDown={(event) => {
                        if (tile && !pan) startDrag(event, tile, i);
                      }}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={() => setDrag(null)}
                      onLostPointerCapture={() => setDrag(null)}
                      onClick={() => {
                        if (moved.current) {
                          moved.current = false;
                          return;
                        }
                        if (!pan) put(i);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          put(i);
                        }
                        const shifts: Record<string, number> = {
                          ArrowLeft: -1,
                          ArrowRight: 1,
                          ArrowUp: -WIDTH,
                          ArrowDown: WIDTH,
                        };
                        if (shifts[event.key]) {
                          event.preventDefault();
                          const next = i + shifts[event.key];
                          if (next >= 0 && next < WIDTH * HEIGHT)
                            board.current
                              ?.querySelector<SVGGElement>(
                                `[data-cell="${next}"]`,
                              )
                              ?.focus();
                        }
                      }}
                      className="construction-cell"
                    >
                      <rect
                        x={x + 1}
                        y={y + 1}
                        width="70"
                        height="70"
                        rx="5"
                        fill={
                          wet
                            ? "#236d82"
                            : tile === "road"
                              ? report.connected.includes(i)
                                ? "#8a9389"
                                : "#47565c"
                              : i === selection
                                ? "#426e64"
                                : "transparent"
                        }
                        stroke={offline ? "#ff8b7f" : "#83b3a52b"}
                        strokeWidth={offline ? 3 : 1}
                      />
                      {tile === "road" && (
                        <path
                          d={`M${x + 36} ${y + 6}v60M${x + 6} ${y + 36}h60`}
                          stroke="#e6dcb1"
                          strokeWidth="2"
                          strokeDasharray="6 5"
                          opacity=".6"
                        />
                      )}
                      {i === 0 ? (
                        <>
                          <ModuleArt
                            x={x}
                            y={y}
                            tile="primary"
                            color="#dcb976"
                          />
                          <text
                            x={x + 36}
                            y={y + 66}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                          >
                            HQ
                          </text>
                        </>
                      ) : house ? (
                        <>
                          <ModuleArt
                            x={x}
                            y={y}
                            tile="primary"
                            color="#a7bcc6"
                          />
                          <text
                            x={x + 36}
                            y={y + 67}
                            textAnchor="middle"
                            fill="white"
                            fontSize="9"
                          >
                            {house.name}
                          </text>
                        </>
                      ) : tile && tile !== "road" ? (
                        <ModuleArt
                          x={x}
                          y={y}
                          tile={tile}
                          color={world.tint}
                          kind={world.id}
                        />
                      ) : null}
                      {offline && (
                        <text
                          x={x + 58}
                          y={y + 15}
                          fill="#ffd0c7"
                          fontSize="18"
                        >
                          !
                        </text>
                      )}
                      <text
                        x={x + 4}
                        y={y + 12}
                        fill="#d6e8de"
                        opacity=".65"
                        fontSize="8"
                      >
                        {String.fromCharCode(65 + (i % WIDTH))}
                        {Math.floor(i / WIDTH) + 1}
                      </text>
                    </g>
                  );
                })}
                {stressed && world.event === "flood" && (
                  <rect
                    pointerEvents="none"
                    x="0"
                    y="288"
                    width="864"
                    height="72"
                    fill="#2cabc1"
                    opacity=".28"
                  />
                )}
                {stressed && world.event === "flood" && (
                  <rect
                    pointerEvents="none"
                    width="864"
                    height="576"
                    fill="url(#rain)"
                    className="simulation-rain"
                  />
                )}
                {(running || tested) &&
                  report.active
                    .slice(0, 12)
                    .map((i, n) => (
                      <Traffic
                        key={`${i}-${game.proofs.length}`}
                        board={game.board}
                        target={i}
                        connected={report.connected}
                        number={n}
                        color={world.tint}
                      />
                    ))}
                {districts.map((d, i) => (
                  <circle
                    key={d.name}
                    cx={d.x * 72 + 55}
                    cy={d.y * 72 + 53}
                    r="4"
                    fill={report.reach === 3 ? "#b6f5b5" : "#efc97f"}
                    className="simulation-person"
                    style={{ animationDelay: `${i * 0.7}s` }}
                    pointerEvents="none"
                  />
                ))}
              </svg>
            </div>
            <div className="bg-[#102c3b] p-3">
              <p className="mb-2 text-xs text-[#d0e1e5]">
                Drag a module into the world, or choose one and tap a square.
                Swipe to explore; use Move camera to drag the view with a mouse.
              </p>
              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                aria-label="Construction tools"
              >
                {(
                  [
                    "road",
                    "solar",
                    "primary",
                    "support",
                    "nature",
                    null,
                  ] as Tile[]
                ).map((tile) => (
                  <button
                    key={tile ?? "erase"}
                    disabled={running}
                    aria-pressed={tool === tile}
                    onPointerDown={(e) => startDrag(e, tile)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={() => setDrag(null)}
                    onLostPointerCapture={() => setDrag(null)}
                    onClick={() => {
                      moved.current = false;
                      setTool(tile);
                      setPan(false);
                    }}
                    className={`construction-tool touch-none rounded-xl border p-2 ${tool === tile ? "border-[#f2cf83] bg-[#3c4e4b]" : "border-white/25 bg-[#0b2331]"}`}
                  >
                    <span aria-hidden="true" className="block text-2xl">
                      {tile ? glyphs[tile] : "⌫"}
                    </span>
                    <span className="block text-[10px] leading-4">
                      {moduleName(world, tile)}
                    </span>
                    <span className="text-[10px] text-[#f2cf83]">
                      {tile ? tileCost[tile] : "Refund"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside className="space-y-3">
            <section className="rounded-2xl border border-[#e9c77e]/35 bg-[#12303e] p-4">
              <h2 className="font-bold">Your engineering brief</h2>
              <ul className="mt-3 space-y-2 text-xs leading-5">
                <li>
                  Deliver at least{" "}
                  <strong>
                    {report.goal} {world.unit}
                  </strong>
                  .
                </li>
                <li>
                  Put a working facility within 3 squares of every residential
                  zone.
                </li>
                <li>
                  Keep energy supply above demand and add {3 + level}{" "}
                  {world.nature.toLowerCase()} squares.
                </li>
                {world.id === "makers-market-v1" && (
                  <li>Process every workshop&apos;s waste.</li>
                )}
                <li>
                  All facilities need a service corridor beside them, connected
                  back to HQ at A1.
                </li>
              </ul>
              <details className="mt-3 text-xs leading-5">
                <summary className="min-h-11 cursor-pointer font-bold text-[#f1ce8e]">
                  Forecast & system rules
                </summary>
                <p>{world.forecast}</p>
                <p className="mt-2">
                  Each {world.primary.toLowerCase()} supplies {world.capacity}{" "}
                  {world.unit} and uses {world.energy} energy. Solar supplies 6
                  energy in normal conditions. Nature squares are passive.
                  Construction credits are refunded when you clear a module.
                </p>
                <p className="mt-2">
                  These are simplified fictional rules, not engineering, health
                  or business advice.
                </p>
              </details>
            </section>
            <section
              aria-label="Live system dashboard"
              className="grid grid-cols-2 gap-2"
            >
              {[
                [world.output, `${report.output}/${report.goal}`],
                ["Zones reached", `${report.reach}/3`],
                ["Energy", `${report.energy}/${report.demand} needed`],
                ["Ecology", `${report.ecology}/${3 + level}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/20 bg-[#102c3b] p-3"
                >
                  <span className="block text-[10px] text-[#c2d8df]">
                    {label}
                  </span>
                  <strong className="text-lg text-[#f1cf8a]">{value}</strong>
                </div>
              ))}
            </section>
            {tested && report.problems.length > 0 && (
              <section
                aria-label="System diagnostic report"
                id="simulation-diagnostics"
                className="rounded-2xl border border-[#f0a798] bg-[#3b2b2e] p-4"
              >
                <h2 className="font-bold">What needs work</h2>
                <ul className="mt-2 space-y-2 text-xs leading-5">
                  {report.problems.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </section>
            )}
            {canStartNext && (
              <p className="text-xs text-[#b4e8c7]">
                The next mission is active. Expand this project to meet the
                higher demand, then test both conditions again.
              </p>
            )}
            {done && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-950 p-4">
                <h2 className="font-bold">Project stress-tested</h2>
                <p className="mt-2 text-sm">
                  Keep experimenting, or take one useful idea into your real
                  Quest.
                </p>
                <Link
                  href={questHref}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-bold"
                >
                  Open my real Quest →
                </Link>
              </div>
            )}
          </aside>
        </div>
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/20 p-3 text-xs">
          <label className="inline-flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={keep} onChange={toggleSave} />
            Keep this build on this device
          </label>
          <button
            className="min-h-11 rounded-full border px-4"
            onClick={resume}
            disabled={running}
          >
            Resume build save
          </button>
          <p className="text-[#bfd4de]">
            Optional browser-only save. New simulations start fresh; earlier
            story saves are preserved in Story practice.
          </p>
        </section>
        <Link
          href={questHref}
          className="inline-flex min-h-11 items-center text-sm"
        >
          Continue my real-world Quest →
        </Link>
      </div>
      {drag && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#f2cf83] bg-[#17384a] p-4 text-3xl text-white shadow-xl"
          style={{ left: drag.x, top: drag.y }}
        >
          {drag.tile ? glyphs[drag.tile] : "⌫"}
        </span>
      )}
    </main>
  );
}
function ModuleArt({
  x,
  y,
  tile,
  color,
  kind,
}: {
  x: number;
  y: number;
  tile: Exclude<Tile, "road" | null>;
  color: string;
  kind?: string;
}) {
  if (tile === "primary" && kind === "neighbourhood-garden-v1")
    return (
      <g pointerEvents="none">
        <ellipse cx={x + 36} cy={y + 54} rx="29" ry="12" fill="#133d32" />
        <path d={`M${x + 8} ${y + 22}h52v37H${x + 8}Z`} fill="#886544" />
        {[0, 1, 2].map((n) => (
          <g key={n}>
            <path
              d={`M${x + 15 + n * 17} ${y + 30}v23`}
              stroke="#c2a27c"
              strokeWidth="9"
            />
            <path
              d={`M${x + 15 + n * 17} ${y + 30}l-5-8m5 8 5-8m-5 19-5-8m5 8 5-8`}
              stroke="#a6d77d"
              strokeWidth="4"
            />
          </g>
        ))}
      </g>
    );
  if (tile === "primary" && kind === "river-renewal-v1")
    return (
      <g pointerEvents="none">
        <path d={`M${x + 7} ${y + 54}h58`} stroke="#80d6e1" strokeWidth="7" />
        {[20, 48].map((a) => (
          <g key={a}>
            <rect
              x={x + a - 11}
              y={y + 23}
              width="22"
              height="31"
              fill="#a2beb6"
            />
            <ellipse cx={x + a} cy={y + 23} rx="11" ry="6" fill="#e1e8cf" />
            <ellipse cx={x + a} cy={y + 23} rx="7" ry="3" fill="#4eabd0" />
          </g>
        ))}
      </g>
    );
  if (tile === "nature")
    return (
      <g pointerEvents="none">
        <ellipse
          cx={x + 37}
          cy={y + 56}
          rx="22"
          ry="9"
          fill="#082b2d"
          opacity=".6"
        />
        <path d={`M${x + 35} ${y + 37}v23`} stroke="#9f7750" strokeWidth="5" />
        <circle cx={x + 35} cy={y + 29} r="20" fill="#78a874" />
        <circle cx={x + 27} cy={y + 23} r="13" fill="#9dcb8b" />
      </g>
    );
  if (tile === "solar")
    return (
      <g pointerEvents="none" filter="url(#building-shadow)">
        <path
          d={`M${x + 17} ${y + 38}v20m35-20v20`}
          stroke="#8ba8ad"
          strokeWidth="4"
        />
        <path
          d={`M${x + 13} ${y + 20}h44l-4 25H9Z`}
          fill="#426f9f"
          stroke="#b3d6dd"
          strokeWidth="2"
        />
        <path
          d={`M${x + 26} ${y + 20}l-4 25m18-25-4 25m-25-12h44`}
          stroke="#9fc7de"
        />
      </g>
    );
  return (
    <g pointerEvents="none" filter="url(#building-shadow)">
      <path d={`M${x + 14} ${y + 25}l29-10 18 14-29 11Z`} fill={color} />
      <path
        d={`M${x + 14} ${y + 25}l18 15v22L${x + 14} ${y + 48}Z`}
        fill="#43626a"
      />
      <path
        d={`M${x + 32} ${y + 40}l29-11v23L${x + 32} ${y + 62}Z`}
        fill={tile === "support" ? "#6c928b" : "#abb8aa"}
      />
      <path
        d={`M${x + 39} ${y + 44}v9m10-13v9`}
        stroke="#ffdda1"
        strokeWidth="5"
      />
      {tile === "primary" && kind === "makers-market-v1" && (
        <>
          <path
            d={`M${x + 16} ${y + 13}v15m8-20v13`}
            stroke="#7a9c9e"
            strokeWidth="7"
          />
          <circle
            cx={x + 46}
            cy={y + 40}
            r="7"
            fill="#324951"
            stroke="#f4ce88"
            strokeWidth="3"
          />
        </>
      )}
      {tile === "primary" && kind === "learning-district-v1" && (
        <>
          <path d={`M${x + 13} ${y + 12}l30-8 18 12-29 10Z`} fill="#eee6bc" />
          <path d={`M${x + 32} ${y + 25}v15l29-11V16Z`} fill="#81999c" />
        </>
      )}
      {tile === "primary" && kind === "food-rescue-v1" && (
        <>
          <path
            d={`M${x + 37} ${y + 39}v18m9-21v18m9-21v18`}
            stroke="#5e99b5"
            strokeWidth="4"
          />
          <rect x={x + 5} y={y + 48} width="14" height="12" fill="#dab982" />
        </>
      )}
      {tile === "support" && (
        <text
          x={x + 34}
          y={y + 29}
          textAnchor="middle"
          fontSize="15"
          fill="#163a45"
        >
          ◈
        </text>
      )}
    </g>
  );
}
function Traffic({
  board,
  target,
  connected,
  number,
  color,
}: {
  board: Blueprint;
  target: number;
  connected: number[];
  number: number;
  color: string;
}) {
  const allowed = new Set(connected);
  const end = neighbours(target).find(
    (i) => board[i] === "road" && allowed.has(i),
  );
  if (end === undefined) return null;
  const queue = [0],
    parents = new Map<number, number>([[0, -1]]);
  while (queue.length) {
    const i = queue.shift()!;
    if (i === end) break;
    for (const n of neighbours(i))
      if (board[n] === "road" && allowed.has(n) && !parents.has(n)) {
        parents.set(n, i);
        queue.push(n);
      }
  }
  if (!parents.has(end)) return null;
  const path: number[] = [];
  for (let i = end; i >= 0; i = parents.get(i) ?? -1) path.unshift(i);
  return (
    <circle
      r="4"
      fill={color}
      className="simulation-traffic"
      pointerEvents="none"
    >
      <animateMotion
        dur={`${4 + (number % 4)}s`}
        begin={`${number * 0.3}s`}
        repeatCount="indefinite"
        path={path
          .map(
            (i, n) =>
              `${n ? "L" : "M"}${(i % WIDTH) * 72 + 36},${Math.floor(i / WIDTH) * 72 + 36}`,
          )
          .join(" ")}
      />
    </circle>
  );
}
