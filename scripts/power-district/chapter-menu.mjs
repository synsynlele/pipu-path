import assert from "node:assert/strict";
import { chapterMenuItems } from "../../public/games/city/chapter-menu.mjs";
const initial = chapterMenuItems();
assert.deepEqual(
  initial.map((i) => i.chapter),
  Array.from({ length: 12 }, (_, i) => i + 1),
);
assert.equal(initial[0].status, "Current");
assert(initial.slice(1).every((i) => !i.unlocked));
const foundations = chapterMenuItems({ firstDone: true, baseChapter: 2 });
assert.equal(foundations[0].status, "Completed");
assert.equal(foundations[1].status, "Current");
assert.equal(foundations[2].status, "Locked");
const enterprise = chapterMenuItems({
  firstDone: true,
  foundationsDone: true,
  day: 6,
});
assert.equal(enterprise[2].status, "Current");
assert.equal(enterprise[3].status, "Locked");
const crisis = chapterMenuItems({
  firstDone: true,
  foundationsDone: true,
  day: 7,
  hasResilience: true,
  crises: 2,
});
assert.equal(crisis[2].status, "Completed");
assert.equal(crisis[3].status, "Current");
assert.equal(crisis[4].status, "Locked");
for (let records = 0; records <= 16; records++) {
  const items = chapterMenuItems({
    firstDone: true,
    foundationsDone: true,
    day: 7,
    hasResilience: true,
    crises: 3,
    hasAdvanced: true,
    records,
  });
  for (let i = 4; i < 12; i++) {
    assert.equal(items[i].unlocked, records >= (i - 4) * 2);
    assert.equal(items[i].completed, records >= (i - 3) * 2);
  }
  assert.equal(items.filter((i) => i.current).length, 1);
  if (records > 0) {
    const result = chapterMenuItems({
      crises: 3,
      hasAdvanced: true,
      records,
      result: true,
    });
    assert.equal(
      result.find((i) => i.current).chapter,
      Math.min(12, 5 + Math.floor((records - 1) / 2)),
    );
  }
}
console.log(
  "PASS: 12 ordered chapters, truthful completion/locks, current result chapter, and no future-level shortcut.",
);
