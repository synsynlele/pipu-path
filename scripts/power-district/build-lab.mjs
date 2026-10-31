import assert from "node:assert/strict";
import {
  LAB_MISSIONS,
  emptyLabBoard,
  placeLabPiece,
  rotateLabPiece,
  evaluateLab,
  sanitizeLab,
} from "../../public/games/city/build-lab.mjs";
// Author independent routes as coordinates, then derive the connector needed at each tile.
function route(board, mission, cells) {
  for (let i = 1; i < cells.length - 1; i++) {
    const cell = cells[i];
    const direction = (other) =>
      other === cell - 5
        ? 0
        : other === cell + 1
          ? 1
          : other === cell + 5
            ? 2
            : 3;
    const needed = new Set([direction(cells[i - 1]), direction(cells[i + 1])]);
    if (board[cell]) {
      const old = board[cell],
        base =
          old.kind === "straight"
            ? [0, 2]
            : old.kind === "bend"
              ? [0, 1]
              : [0, 1, 3];
      base.map((d) => (d + old.turn) % 4).forEach((d) => needed.add(d));
    }
    let piece;
    for (const [kind, base] of Object.entries({
      straight: [0, 2],
      bend: [0, 1],
      junction: [0, 1, 3],
    })) {
      for (let turn = 0; turn < 4; turn++) {
        const ends = base.map((d) => (d + turn) % 4);
        if (ends.length === needed.size && ends.every((d) => needed.has(d)))
          piece = { kind, turn };
      }
    }
    assert(piece, `Representable route at ${cell}`);
    board = placeLabPiece(mission, board, cell, piece);
  }
  return board;
}
const first = LAB_MISSIONS[0];
let upper = route(emptyLabBoard(), first, [10, 5, 6, 7, 8, 9, 14]);
assert(evaluateLab(first, upper).success, "A working upper route is accepted");
const lower = route(emptyLabBoard(), first, [10, 15, 16, 17, 18, 19, 14]);
assert(
  evaluateLab(first, lower).success,
  "A different valid design is accepted",
);
const startTurn = placeLabPiece(first, emptyLabBoard(), 5, {
  kind: "bend",
  turn: 0,
});
const spin1 = rotateLabPiece(first, startTurn, 5);
assert.deepEqual(spin1[5], { kind: "bend", turn: 1 });
assert.deepEqual(rotateLabPiece(first, spin1, 5)[5], {
  kind: "bend",
  turn: 2,
});
assert.deepEqual(
  rotateLabPiece(
    first,
    rotateLabPiece(first, rotateLabPiece(first, spin1, 5), 5),
    5,
  )[5],
  { kind: "bend", turn: 0 },
  "Four taps complete one rotation and wrap to the starting orientation",
);
assert.deepEqual(rotateLabPiece(first, startTurn, 10), startTurn);
assert.deepEqual(rotateLabPiece(first, startTurn, 12), startTurn);
assert.deepEqual(rotateLabPiece(first, startTurn, 0), startTurn);
assert.equal(
  evaluateLab(first, startTurn).cost,
  evaluateLab(first, spin1).cost,
);
assert.equal(
  startTurn[5].turn,
  0,
  "A tap must not mutate the previous saved board",
);
const wrong = placeLabPiece(first, upper, 7, { kind: "straight", turn: 0 });
assert(
  !evaluateLab(first, wrong).success,
  "Touching cells with misaligned openings cannot carry supply",
);
assert(!evaluateLab(first, emptyLabBoard()).success);
assert.deepEqual(
  placeLabPiece(first, upper, 12, { kind: "junction", turn: 0 }),
  upper,
  "Protected tree cannot be removed or built over",
);
assert.deepEqual(
  placeLabPiece(first, upper, 10, null),
  upper,
  "Supply cannot be removed",
);
assert.deepEqual(
  placeLabPiece(first, upper, 14, null),
  upper,
  "Target cannot be replaced",
);
const second = LAB_MISSIONS[1];
let shared = route(emptyLabBoard(), second, [10, 11, 6, 1, 2, 3, 4]);
assert.equal(evaluateLab(second, shared).served, 1);
assert(
  !evaluateLab(second, shared).success,
  "Serving only one place fails the shared-services task",
);
shared = route(shared, second, [10, 11, 16, 21, 22, 23, 24]);
assert(evaluateLab(second, shared).success);
assert.equal(
  evaluateLab(second, shared).cost,
  10,
  "A junction consumes two pieces",
);
const over = placeLabPiece(second, shared, 0, { kind: "bend", turn: 0 });
assert(
  !evaluateLab(second, over).success,
  "Reaching every place does not override the budget",
);
const third = LAB_MISSIONS[2];
let resilient = route(emptyLabBoard(), third, [10, 5, 6, 7, 8, 9, 14]);
assert.equal(evaluateLab(third, resilient).served, 1);
assert.notEqual(evaluateLab(third, resilient).vulnerable, null);
assert(
  !evaluateLab(third, resilient).success,
  "A single route fails the resilience requirement",
);
resilient = route(resilient, third, [10, 15, 16, 17, 18, 19, 14]);
assert(
  evaluateLab(third, resilient).success,
  "Two independent routes survive every single-link failure",
);

const clinic = LAB_MISSIONS.find((m) => m.id === "clinic-power");
const clinicBoard = route(
  emptyLabBoard(),
  clinic,
  [2, 1, 0, 5, 10, 15, 20, 21, 22],
);
assert.equal(evaluateLab(clinic, clinicBoard).cost, 7);
assert(evaluateLab(clinic, clinicBoard).success);
assert(!evaluateLab(clinic, emptyLabBoard()).success);
assert.deepEqual(
  placeLabPiece(clinic, clinicBoard, 12, { kind: "bend", turn: 1 }),
  clinicBoard,
);

const sharedRecovery = LAB_MISSIONS.find((m) => m.id === "shared-recovery");
let recoveryBoard = route(
  emptyLabBoard(),
  sharedRecovery,
  [12, 11, 10, 5, 0, 1, 2, 3, 4],
);
assert.equal(evaluateLab(sharedRecovery, recoveryBoard).served, 1);
recoveryBoard = route(recoveryBoard, sharedRecovery, [12, 11, 10, 15, 20]);
assert.equal(evaluateLab(sharedRecovery, recoveryBoard).cost, 9);
assert(evaluateLab(sharedRecovery, recoveryBoard).success);
assert.equal(
  evaluateLab(
    sharedRecovery,
    placeLabPiece(sharedRecovery, recoveryBoard, 15, null),
  ).success,
  false,
);
const safe = sanitizeLab({
  active: third.id,
  boards: { [third.id]: resilient },
  reflection: "private text",
  xp: 999,
});
assert.deepEqual(safe.boards[third.id], resilient);
assert(!("reflection" in safe) && !("xp" in safe));
assert.equal(sanitizeLab(null).active, first.id);
assert.deepEqual(sanitizeLab(null).tested, []);
assert.equal(sanitizeLab(null).faults["workshop-link"], null);
assert.deepEqual(sanitizeLab(null).attempts["workshop-link"], {
  tests: 0,
  successes: 0,
  hints: 0,
});
assert.deepEqual(
  sanitizeLab({ tested: ["workshop-link", "fake", "workshop-link"] }).tested,
  ["workshop-link"],
);
assert(
  sanitizeLab({
    boards: { [first.id]: [{ kind: "__proto__", turn: 0 }] },
  }).boards[first.id].every((p) => p === null),
);
console.log(
  "PASS: hands-on routes, rotation, multiple solutions, budgets, two-service supply, single-link resilience and private allowlisted saves.",
);

const { savePractice, loadPractice } =
  await import("../../public/games/city/practice-save.mjs");
const { initialPlan } = await import("../../public/games/city/model.mjs");
let stored = null;
const storage = {
  getItem: () => stored,
  setItem: (_, value) => {
    stored = value;
  },
};
const city = {
  day: 1,
  cash: 18,
  config: initialPlan(),
  owned: initialPlan(),
  seen: [],
  history: [],
  decisions: {},
  reflection: "Never save personal text",
  lab: safe,
};
assert(savePractice(city, storage));
assert.deepEqual(loadPractice(storage).lab.boards[third.id], resilient);
assert.equal(loadPractice(storage).lab.boards[clinic.id].length, 25);
assert.equal(loadPractice(storage).lab.boards[sharedRecovery.id].length, 25);
assert.deepEqual(loadPractice(storage).decisions, {});
assert(!stored.includes("Never save personal text"));
assert(
  savePractice({ ...city, lab: { active: "unknown", boards: "bad" } }, storage),
);
assert.equal(loadPractice(storage).lab.active, first.id);
console.log(
  "PASS: optional city-save round trip retains prototypes, preserves decisions and discards unrelated text.",
);
