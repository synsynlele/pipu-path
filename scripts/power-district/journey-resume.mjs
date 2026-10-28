import assert from "node:assert/strict";
import { CITY_CASES, saveDecision } from "../../public/games/city/cases.mjs";
import { firstUnanswered, recoverJourney, JOURNEY_STAGES } from "../../public/games/city/journey-flow.mjs";
assert.equal(JOURNEY_STAGES.length, 5);
let choices = {};
const start = firstUnanswered(choices);
assert.equal(start.id, CITY_CASES[0].id);
assert.deepEqual(
  recoverJourney({ status: "paused", stage: "travelling", caseId: start.id, decisions: choices }),
  { caseId: start.id, stage: "travelling", choiceId: null },
);
assert.deepEqual(
  recoverJourney({ status: "paused", stage: "question", caseId: start.id, decisions: choices }),
  { caseId: start.id, stage: "question", choiceId: null },
);
choices = saveDecision(choices, start.id, CITY_CASES[0].options[1].id);
for (const stage of ["building", "outcome"]) {
  const result = recoverJourney({
    caseId: start.id, stage, choiceId: CITY_CASES[0].options[1].id,
    decisions: choices, status: "paused",
  });
  assert.equal(result.stage, stage, "do not skip an interrupted animation or consequence");
  assert.equal(result.choiceId, CITY_CASES[0].options[1].id);
}
const next = CITY_CASES[1];
assert.equal(
  recoverJourney({ stage: "outcome", caseId: start.id, choiceId: "missing", decisions: choices }).caseId,
  next.id,
);
assert.equal(recoverJourney({ stage: "travelling", caseId: "invalid", decisions: choices }).caseId, next.id);
assert.equal(firstUnanswered(choices)?.id, next.id);
for (const c of CITY_CASES.slice(1)) choices = saveDecision(choices, c.id, c.options[0].id);
assert.equal(firstUnanswered(choices), null);
assert.equal(recoverJourney({ decisions: choices, stage: "invalid" }).stage, "complete");
console.log("PASS: interrupted travel, question, animation, outcome and invalid save resume safely.");
