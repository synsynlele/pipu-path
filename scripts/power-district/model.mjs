import assert from "node:assert/strict";
import {
  simulate,
  spent,
  viable,
} from "../../public/games/power-district/model.mjs";
const baseline = {
  storage: true,
  solar: false,
  schedule: true,
  maintenance: true,
};
assert.equal(spent(baseline), 8);
assert(viable(baseline));
assert.deepEqual(
  simulate(baseline).map((r) => r.charge),
  [1, 2, 2, 0],
);
assert.equal(
  simulate(baseline, true).reduce((n, r) => n + r.unmet, 0),
  3,
);
assert(
  !viable({ storage: false, solar: true, schedule: false, maintenance: false }),
);
for (const policy of ["protect", "rotate"]) {
  const rows = simulate(baseline, true, policy);
  assert.equal(
    rows.reduce((n, r) => n + r.served, 0),
    7,
  );
  assert(rows.every((r) => r.unmet === 0));
}
for (let bits = 0; bits < 16; bits++) {
  const c = Object.fromEntries(
    ["storage", "solar", "schedule", "maintenance"].map((k, i) => [
      k,
      !!(bits & (1 << i)),
    ]),
  );
  for (const storm of [false, true]) {
    let previous = 0;
    for (const r of simulate(c, storm)) {
      assert(r.charge >= 0 && r.charge <= 4);
      assert(r.served <= r.needed);
      assert.equal(r.served + r.unmet, r.needed);
      const charged = Math.max(0, r.charge - previous),
        discharged = Math.max(0, previous - r.charge);
      assert(charged <= 2 && discharged <= 2);
      assert(r.served + charged <= r.generated + discharged);
      if (!c.storage) assert.equal(r.charge, 0);
      previous = r.charge;
    }
  }
}
console.log(
  "PASS: 16 configurations, storage bounds, energy conservation, budget, baseline and both service policies.",
);
