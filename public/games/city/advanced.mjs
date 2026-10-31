// Chapters 5–12: varied simulations. Existing version-1 city histories migrate
// without losing completed missions, awards or the player's current position.
import {
  ADVANCED_CHAPTERS,
  missionAt,
  newPlan,
  validPlanShape,
  testChallenge,
} from "./advanced-challenges.mjs";
import {
  sanitizeAdvanced as validateOld,
  testAdvanced as oldTest,
} from "./advanced-legacy.mjs";
import { resilienceReport } from "./resilience.mjs";
export { ADVANCED_CHAPTERS };
const sites = [
  "water",
  "industry",
  "market",
  "health",
  "workshop",
  "business",
  "transport",
  "housing",
  "school",
  "council",
  "environment",
];
const isNum = (v) => Number.isInteger(v) && v >= 0 && v <= 10;
function migrate(value) {
  const safe = validateOld(value);
  if (!safe) return null;
  // Old records were already tested against the original simulation.
  // Preserve them as historical completions. Future missions use the new games.
  return {
    version: 2,
    seed: safe.seed,
    records: safe.records.map((record) => ({ legacyPlan: [...record.plan] })),
    cursor: {
      phase: safe.cursor.phase === "result" ? "result" : "diagnose",
      plan: [],
    },
  };
}
export function sanitizeAdvanced(value) {
  if (value?.version === 1) return migrate(value);
  if (
    !value ||
    value.version !== 2 ||
    !Array.isArray(value.records) ||
    value.records.length > 16
  )
    return null;
  const seed = isNum(value.seed) ? value.seed : 0,
    records = [];
  for (let i = 0; i < value.records.length; i++) {
    const r = value.records[i],
      m = missionAt(i);
    if (!r || !m) return null;
    if (Array.isArray(r.legacyPlan)) {
      // Older records must form a prefix, and must pass the old actual evaluator.
      if (records.some((x) => Array.isArray(x.plan))) return null;
      const history = records.map((x) => ({ plan: [...x.legacyPlan] }));
      const old = {
        version: 1,
        seed,
        records: [...history, { plan: r.legacyPlan }],
        cursor: { phase: "diagnose", plan: [] },
      };
      if (!validateOld(old)) return null;
      records.push({ legacyPlan: [...r.legacyPlan] });
    } else {
      if (!validPlanShape(m, r.plan) || !testChallenge(m, r.plan).ok)
        return null;
      const test = testChallenge(m, r.plan);
      records.push({ plan: [...r.plan], score: test.score });
    }
  }
  const phase = ["diagnose", "configure", "result"].includes(
    value.cursor?.phase,
  )
    ? value.cursor.phase
    : "diagnose";
  const next = missionAt(records.length);
  const plan =
    phase !== "configure"
      ? []
      : next && validPlanShape(next, value.cursor?.plan)
        ? [...value.cursor.plan]
        : newPlan(next);
  return { version: 2, seed, records, cursor: { phase, plan } };
}
export function newAdvanced(resilience) {
  return {
    version: 2,
    seed: Math.min(10, resilience?.seed?.capacity?.water ?? 0),
    records: [],
    cursor: { phase: "diagnose", plan: [] },
  };
}
export function advancedMission(value) {
  return missionAt(value?.records?.length ?? 0);
}
export function canStartAdvanced(resilience) {
  return resilienceReport(resilience)?.completed === true;
}
export function advancedRules(value) {
  const m = advancedMission(value);
  if (!m) return null;
  return { ...m.board, kind: m.kind, guide: m.guide };
}
export function testAdvanced(value, plan) {
  // Direct calls on historical v1 are accepted for migration-only regression.
  if (value?.version === 1) return oldTest(value, plan);
  return testChallenge(advancedMission(value), plan);
}
export function deployAdvanced(value, plan) {
  if (value?.version === 1) {
    // A caller holding a pre-upgrade instance is migrated first, so a newly
    // deployed mission always uses the authored interactive challenge engine.
    return null;
  }
  const safe = sanitizeAdvanced(value),
    m = advancedMission(safe);
  if (!safe || !m || !validPlanShape(m, plan)) return null;
  const test = testChallenge(m, plan);
  if (!test.ok) return null;
  return {
    ...safe,
    records: [...safe.records, { plan: [...plan], score: test.score }],
    cursor: { phase: "result", plan: [] },
  };
}
export function advancedUpgrades(value) {
  const result = Object.fromEntries(sites.map((id) => [id, 0]));
  for (let i = 0; i < (value?.records?.length ?? 0); i++) {
    const m = missionAt(i);
    if (!m) break;
    result[m.district] = (result[m.district] ?? 0) + 1;
    if (["cascade", "showcase", "dispatch", "backup"].includes(m.kind)) {
      for (const id of ["health", "water", "transport"])
        result[id] = Math.max(1, result[id] ?? 0);
    }
  }
  return result;
}
export function advancedCityActivity(economy, resilience, value) {
  if (!value?.records?.length) return null;
  const mission = missionAt(value.records.length - 1);
  if (!mission) return null;
  const latest = { ...(economy?.last ?? {}) };
  // The simulated outcomes remain recorded in the tested challenge and upgrades;
  // don't invent unrelated water shipments or service deliveries for planning,
  // leadership or recycling activities.
  return {
    ...economy,
    upgrades: advancedUpgrades(value),
    last: { ...latest, advancedDistrict: mission.district },
  };
}
export function advancedPerformance(value, chapter) {
  const safe = sanitizeAdvanced(value);
  if (!safe || chapter < 5 || chapter > 12) return null;
  const start = (chapter - 5) * 2;
  if (safe.records.length < start + 2) return null;
  const scores = safe.records.slice(start, start + 2).map((r) => r.score ?? 60);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
