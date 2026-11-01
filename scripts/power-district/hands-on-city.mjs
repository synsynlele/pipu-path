import assert from "node:assert/strict";
import {
  newSite,
  editSite,
  testRain,
  spent,
  BUDGET,
} from "../../public/games/city/hands-on-model.mjs";
let site = newSite();
assert.equal(testRain(site).safe.length, 0);
assert.equal(editSite(site, 1, "drain").site, site);
assert.equal(editSite(site, 17, "drain").site, site);
assert.equal(editSite(site, 31, "remove").site, site);
// A branched route protects every home, but only if connected storage holds the runoff.
for (const id of [8, 9, 10, 11, 12, 16, 23, 30])
  site = editSite(site, id, "drain").site;
assert.equal(testRain(site).safe.length, 1);
site = editSite(site, 30, "basin").site;
assert.equal(testRain(site).success, true);
assert.equal(testRain(site).capacity, 3);
const before = site;
site = editSite(site, 23, "remove").site;
assert.equal(testRain(site).success, false);
assert.equal(testRain(before).success, true, "immutable history supports undo");
// Disconnected basins cannot add capacity.
site = editSite(newSite(), 34, "basin").site;
assert.equal(testRain(site).capacity, 1);
// Clearing costs materials and only allows a blocked tile to be used afterwards.
site = editSite(newSite(), 17, "clear").site;
assert.equal(spent(site), 1);
assert.equal(editSite(site, 17, "clear").site, site);
site = editSite(site, 17, "drain").site;
assert.equal(site.tiles[17], "drain");
for (let id = 7; id < 35; id++) site = editSite(site, id, "basin").site;
assert.ok(spent(site) <= BUDGET);
assert.equal(editSite(site, -1, "drain").site, site);
assert.equal(editSite(site, 35, "drain").site, site);
console.log(
  "Hands-on city: drainage, capacity, budget, immutable undo, blockage and invalid actions passed.",
);
