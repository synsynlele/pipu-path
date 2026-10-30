// Fictional prototypes: no city fund, decisions, real evidence or XP are changed.
export const LAB_SIZE = 5;
export const LAB_MISSIONS = [
  {
    id: "workshop-link",
    title: "Get the workshop connected",
    brief:
      "Connect the supply to the workshop. Work around the protected tree.",
    source: 10,
    targets: [{ cell: 14, name: "Workshop" }],
    blocked: [12],
    budget: 6,
    resilient: false,
  },
  {
    id: "shared-services",
    title: "One supply. Two places.",
    brief:
      "Reach the school and clinic together. A junction costs two pieces; every other piece costs one.",
    source: 10,
    targets: [
      { cell: 4, name: "School" },
      { cell: 24, name: "Clinic" },
    ],
    blocked: [7, 12, 17],
    budget: 10,
    resilient: false,
  },
  {
    id: "backup-water",
    title: "Keep water flowing",
    brief:
      "Connect the homes, then survive any one broken link. Build a second route so one failure cannot stop the supply.",
    source: 10,
    targets: [{ cell: 14, name: "Homes" }],
    blocked: [12],
    budget: 12,
    resilient: true,
  },
  {
    id: "clinic-power",
    title: "Get reliable power to the clinic",
    brief:
      "The middle connection is blocked. Route power safely to the clinic within seven pieces. This is a fictional puzzle, not electrical work.",
    source: 2,
    targets: [{ cell: 22, name: "Clinic" }],
    blocked: [7, 12, 17],
    budget: 7,
    resilient: false,
  },
  {
    id: "shared-recovery",
    title: "Restore the clinic and market together",
    brief:
      "From the central supply, connect both services around blocked work areas. A junction costs two pieces. Your total budget is nine.",
    source: 12,
    targets: [
      { cell: 4, name: "Clinic" },
      { cell: 20, name: "Market" },
    ],
    blocked: [6, 8, 16, 18],
    budget: 9,
    resilient: false,
  },
];
const ports = { straight: [0, 2], bend: [0, 1], junction: [0, 1, 3] };
const directions = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];
export function labMission(id) {
  return LAB_MISSIONS.find((m) => m.id === id) ?? LAB_MISSIONS[0];
}
export function labPorts(piece) {
  return piece && ports[piece.kind]
    ? ports[piece.kind].map((p) => (p + piece.turn) % 4)
    : [];
}
export function emptyLabBoard() {
  return Array(25).fill(null);
}
export function sanitizeLab(input) {
  const boards = {};
  for (const mission of LAB_MISSIONS) {
    const cells = input?.boards?.[mission.id];
    boards[mission.id] = emptyLabBoard().map((_, index) => {
      const p = Array.isArray(cells) ? cells[index] : null;
      return p &&
        Object.hasOwn(ports, p.kind) &&
        Number.isInteger(p.turn) &&
        p.turn >= 0 &&
        p.turn < 4 &&
        !mission.blocked.includes(index) &&
        mission.source !== index &&
        !mission.targets.some((t) => t.cell === index)
        ? { kind: p.kind, turn: p.turn }
        : null;
    });
  }
  return {
    active: labMission(input?.active).id,
    boards,
    // A working design only constructs a city building after the player
    // explicitly TESTS it; not just after its final tile is placed.
    tested: Array.isArray(input?.tested)
      ? [...new Set(input.tested)].filter(
          (id) =>
            typeof id === "string" && LAB_MISSIONS.some((m) => m.id === id),
        )
      : [],
  };
}
export function placeLabPiece(mission, board, cell, piece) {
  const next = sanitizeLab({ boards: { [mission.id]: board } }).boards[
    mission.id
  ];
  if (
    !Number.isInteger(cell) ||
    cell < 0 ||
    cell > 24 ||
    mission.blocked.includes(cell) ||
    mission.source === cell ||
    mission.targets.some((t) => t.cell === cell)
  )
    return next;
  next[cell] =
    piece && Object.hasOwn(ports, piece.kind)
      ? {
          kind: piece.kind,
          turn: (((Number.isInteger(piece.turn) ? piece.turn : 0) % 4) + 4) % 4,
        }
      : null;
  return next;
}
export function evaluateLab(mission, input) {
  const board = sanitizeLab({ boards: { [mission.id]: input } }).boards[
    mission.id
  ];
  const cost = board.reduce(
    (sum, p) => sum + (p ? (p.kind === "junction" ? 2 : 1) : 0),
    0,
  );
  const fixed = new Set([
    mission.source,
    ...mission.targets.map((t) => t.cell),
  ]);
  function flow(broken = -1) {
    const seen = new Set([mission.source]),
      queue = [mission.source];
    for (let q = 0; q < queue.length; q++) {
      const cell = queue[q],
        row = Math.floor(cell / 5),
        col = cell % 5;
      const openings = fixed.has(cell) ? [0, 1, 2, 3] : labPorts(board[cell]);
      for (const d of openings) {
        const r = row + directions[d][0],
          c = col + directions[d][1];
        if (r < 0 || r > 4 || c < 0 || c > 4) continue;
        const next = r * 5 + c;
        if (next === broken || mission.blocked.includes(next) || seen.has(next))
          continue;
        if (
          !(fixed.has(next) ? [0, 1, 2, 3] : labPorts(board[next])).includes(
            (d + 2) % 4,
          )
        )
          continue;
        seen.add(next);
        queue.push(next);
      }
    }
    return seen;
  }
  const reached = flow();
  const served = mission.targets.filter((t) => reached.has(t.cell));
  let vulnerable = null;
  if (mission.resilient && served.length === mission.targets.length) {
    for (let cell = 0; cell < 25; cell++) {
      if (!board[cell] || !reached.has(cell)) continue;
      const after = flow(cell);
      if (mission.targets.some((t) => !after.has(t.cell))) {
        vulnerable = cell;
        break;
      }
    }
  }
  const success =
    cost <= mission.budget &&
    served.length === mission.targets.length &&
    vulnerable === null;
  const message =
    cost > mission.budget
      ? `You used ${cost} pieces. The limit is ${mission.budget}. Remove or simplify part of your network.`
      : served.length < mission.targets.length
        ? `${served.length} of ${mission.targets.length} places reached. Check that neighbouring openings face each other.`
        : vulnerable !== null
          ? `Supply stops if row ${Math.floor(vulnerable / 5) + 1}, column ${(vulnerable % 5) + 1} breaks. Give it another route.`
          : mission.resilient
            ? "It works! Every single-link failure was tested and the homes still receive water."
            : "It works! Your network reaches every place within the piece budget.";
  return {
    success,
    cost,
    reached: [...reached],
    served: served.length,
    vulnerable,
    message,
  };
}
