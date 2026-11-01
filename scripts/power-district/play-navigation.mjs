import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import {
  chapterHelp,
  mountPlayNavigation,
} from "../../public/games/city/play-navigation.mjs";
import { chapterMenuItems } from "../../public/games/city/chapter-menu.mjs";
const dom = new JSDOM(readFileSync("public/games/city/index.html", "utf8"));
const d = dom.window.document,
  menu = d.getElementById("city-menu");
mountPlayNavigation(menu);
const groups = [...menu.querySelectorAll(":scope > div > details")];
assert(groups.length >= 5);
assert(
  groups.every((g) => !g.open),
  "Long chapter list and optional sections start collapsed",
);
assert.equal(
  menu.querySelector("#city-menu-options > button").id,
  "menu-resume",
);
assert(
  !d.querySelector(".top-actions #reset"),
  "Restart must not compete with play/audio controls",
);
assert(menu.contains(d.getElementById("reset")));
const ids = [...d.querySelectorAll("[id]")].map((e) => e.id);
assert.equal(
  new Set(ids).size,
  ids.length,
  "No duplicate action IDs after menu consolidation",
);
for (const group of groups) {
  group.open = true;
  group.dispatchEvent(new dom.window.Event("toggle"));
  assert.equal(groups.filter((g) => g.open).length, 1);
}
menu.open = true;
menu.querySelector("button").focus();
const escape = new dom.window.KeyboardEvent("keydown", {
  key: "Escape",
  bubbles: true,
  cancelable: true,
});
menu.querySelector("button").dispatchEvent(escape);
assert(!menu.open);
assert.equal(d.activeElement, menu.querySelector("summary"));
assert(escape.defaultPrevented);
for (let chapter = 1; chapter <= 12; chapter++) {
  const items = chapterMenuItems({
    firstDone: chapter > 1,
    foundationsDone: chapter > 2,
    day: chapter > 3 ? 7 : 0,
    hasResilience: chapter >= 4,
    crises: chapter > 4 ? 3 : 0,
    hasAdvanced: chapter >= 5,
    records: chapter >= 5 ? (chapter - 5) * 2 : 0,
    baseChapter: chapter,
  });
  const copy = chapterHelp(
    items,
    "question",
    "A useful decision",
    "A working network",
  );
  assert(copy.startsWith(`CHAPTER ${chapter} ·`), copy);
  assert(!copy.includes("STORY COMPLETE"));
}
assert.match(
  chapterHelp(chapterMenuItems(), "build", "", "A working network"),
  /Build and test: A working network/,
);
const complete = chapterMenuItems({
  firstDone: true,
  foundationsDone: true,
  day: 7,
  hasResilience: true,
  crises: 3,
  hasAdvanced: true,
  records: 16,
});
assert.match(chapterHelp(complete), /^STORY COMPLETE/);
const guide = d.querySelector("#help-dialog > .game-guide-steps");
assert.equal(guide.children.length, 3, "Core guide stays a short play loop");
assert(
  d.querySelectorAll("#help-dialog > details").length >= 4,
  "Specific instructions remain available on request",
);
console.log(
  "PASS: one primary story action, collapsed optional sections, exclusive menu groups, keyboard escape/focus, unique controls, and truthful next-step help across all 12 chapters.",
);
dom.window.close();
