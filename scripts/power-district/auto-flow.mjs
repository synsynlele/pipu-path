import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import {
  choicesForCase,
  nextCaseAfter,
  caseNumber,
  OUTCOME_VIEW_MS,
} from "../../public/games/city/case-flow.mjs";
assert.equal(CITY_CASES.length, 16);
assert(OUTCOME_VIEW_MS >= 6000 && OUTCOME_VIEW_MS <= 12000);
for (const seed of [0, 1, 2, 3, -1]) {
  const firstSlots = [0, 0, 0];
  for (const [i, c] of CITY_CASES.entries()) {
    const opts = choicesForCase(c.id, seed);
    assert.equal(opts.length, 3);
    assert.equal(new Set(opts.map((o) => o.id)).size, 3);
    assert.deepEqual(
      new Set(opts.map((o) => o.id)),
      new Set(c.options.map((o) => o.id)),
    );
    assert.deepEqual(
      choicesForCase(c.id, seed),
      opts,
      "answer order must not change on retry",
    );
    const first = opts.findIndex((o) => o.id === c.options[0].id);
    firstSlots[first]++;
    assert.equal(caseNumber(c.id), i + 1);
    assert.equal(
      nextCaseAfter(c.id)?.id ?? null,
      CITY_CASES[i + 1]?.id ?? null,
    );
  }
  assert(
    firstSlots.every((n) => n >= 5 && n <= 6),
    "best authored choice must be balanced across answer positions",
  );
}
assert.deepEqual(choicesForCase("invalid-case-id"), []);
assert.equal(nextCaseAfter("invalid-case-id"), null);
assert.equal(caseNumber("invalid-case-id"), 0);
console.log(
  "PASS: first authored option balances across all 3 answer positions, retries stay stable and 16 cases advance without cycling forever.",
);
