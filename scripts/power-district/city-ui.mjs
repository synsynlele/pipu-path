import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("public/games/city/index.html", "utf8");
const game = readFileSync("public/games/city/game.mjs", "utf8");
const css = readFileSync("public/games/shared/city-theme.css", "utf8");

for (const id of ["guide-toggle", "build-toggle", "test-status", "city-map"]) {
  assert(html.includes('id="' + id + '"'), "missing city control: " + id);
}
assert(game.includes("function updateGuideVisibility()"));
assert(game.includes("guideExpanded = false;"));
assert(game.includes("dockExpanded = false;"));
assert(game.includes('$("mission").hidden = !visible;'));
assert(game.includes('$("test-status").hidden = !simulating;'));
assert(game.includes("dockExpanded || simulating"));
assert(css.includes("body.city-testing #mission"));
assert(css.includes("body.city-testing #build-dock"));
assert(css.includes("body.city-testing #scene-labels"));
assert(css.includes("body.city-testing #city-tools"));
assert(game.includes("masonryCache"));
assert(game.includes("function building("));
assert(game.includes("function streetLight("));
assert(game.includes("function parkSeat("));
assert(game.includes("player.arms.forEach("));
assert(game.includes("createNavigator(obstacles, {"));
assert(game.includes("minX: -57.5"));
assert(html.includes('id="districts-toggle"'));
assert(html.includes('id="district-directory"'));
assert(game.includes("createOuterDistricts("));
assert(game.includes("showFutureDistrict("));
assert(css.includes("#district-list"));
console.log(
  "PASS: living city scene, on-demand guide and construction, focused simulation and expanded navigation contracts.",
);
