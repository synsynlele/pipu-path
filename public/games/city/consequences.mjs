// All consequences derive from existing authored choices and saved decisions.
// No invented city harm, XP, personal data or extra persistence schema.
import { CITY_CASES } from "./cases.mjs";
import { infrastructurePlan } from "./construction-plans.mjs";
import { CASE_BUILD_SITES } from "./feedback.mjs";

function consequenceType(plan) {
  const asset = plan.assets.join(" ");
  if (/burn-pit|scrap-pile|spoiled-food|unsafe-food|unused-goods|repair-backlog/.test(asset))
    return "waste";
  if (/flooded-route|sealed-yard/.test(asset)) return "flood";
  if (/unfinished-housing|unfinished-tech/.test(asset)) return "unfinished";
  if (/unsafe-|damaged-|overloaded-|unlit-/.test(asset)) return "hazard";
  if (/gated-|exclusive-|private-clinic|locked-kiosk|copied-stage/.test(asset))
    return "access";
  if (plan.status === "limited") return "limited";
  if (plan.status === "none") return "unmet";
  return "warning";
}

export function consequenceFor(caseId, choiceId) {
  const plan = infrastructurePlan(caseId, choiceId);
  if (!plan || plan.status === "working") return null;
  return {
    caseId,
    choiceId,
    district: plan.district,
    status: plan.status,
    type: consequenceType(plan),
    label: plan.label,
    explanation: plan.explanation,
  };
}

export function consequencesForCity(decisions = {}) {
  return CITY_CASES.flatMap((scenario) => {
    const consequence = consequenceFor(scenario.id, decisions[scenario.id]);
    return consequence ? [consequence] : [];
  });
}

// Bounded low-poly markers: constructed only for selected outcomes. Shapes use
// the game's shared geometry and material caches, never shadows or textures.
// A warning is not a building. It cannot inflate the construction score.
export function createConsequenceScene({ T, scene, box, cyl }) {
  const markers = new Map();
  const dark = 0x465665;
  const red = 0xbe6752;
  const amber = 0xd3a45b;

  function buildShape(parent, problem) {
    const group = new T.Group();
    group.userData.ignoreNavigation = true;
    parent.add(group);
    const color = problem.status === "failed" ? red : amber;
    const B = (w, h, d, c, x, y, z) => {
      const mesh = box(w, h, d, c, x, y, z, group);
      mesh.userData.ignoreNavigation = true;
      return mesh;
    };
    const C = (radius, height, c, x, y, z) => {
      const mesh = cyl(radius, height, c, x, y, z, group, radius, 8);
      mesh.userData.ignoreNavigation = true;
      return mesh;
    };
    // Signal uses a small post and coloured top instead of a floating card.
    C(0.035, 0.65, dark, -0.36, 0.38, -0.27);
    B(0.54, 0.36, 0.065, color, -0.36, 0.77, -0.27);
    B(0.36, 0.055, 0.07, 0xf7e6c2, -0.36, 0.77, -0.21);
    if (problem.type === "waste") {
      // Visible waste or spoilage ONLY when the authored choice causes it.
      B(0.65, 0.11, 0.55, 0x958b70, 0.22, 0.08, 0.19);
      for (const [x, z] of [[-0.04, 0.12], [0.27, 0.27], [0.46, 0.02]])
        C(0.14, 0.16, 0x746b55, x, 0.19, z);
    } else if (problem.type === "flood") {
      B(0.88, 0.025, 0.67, 0x6498ac, 0.14, 0.1, 0.13);
      B(0.33, 0.022, 0.13, 0xb1cfd1, 0.24, 0.13, 0.14);
    } else if (problem.type === "unfinished") {
      for (const x of [-0.06, 0.4]) for (const z of [0.02, 0.42])
        B(0.055, 0.68, 0.055, 0x9a8872, x, 0.42, z);
      B(0.52, 0.055, 0.52, 0xa08c73, 0.17, 0.78, 0.22);
    } else if (problem.type === "hazard") {
      B(0.73, 0.12, 0.12, red, 0.2, 0.17, 0.21);
      B(0.12, 0.45, 0.12, dark, 0.5, 0.4, 0.21);
      B(0.48, 0.11, 0.09, 0xe5bd7a, 0.16, 0.32, 0.21);
    } else if (problem.type === "access") {
      B(0.72, 0.11, 0.08, color, 0.12, 0.5, 0.27);
      for (const x of [-0.2, 0.43])
        B(0.07, 0.47, 0.07, dark, x, 0.29, 0.27);
    } else if (problem.type === "limited") {
      B(0.66, 0.12, 0.53, 0xc8bc9d, 0.15, 0.1, 0.18);
      B(0.4, 0.25, 0.13, amber, 0.2, 0.34, 0.2);
    } else {
      // Unmet need: an empty station, not made-up pollution or a building.
      B(0.62, 0.055, 0.55, 0xb8b4a3, 0.14, 0.08, 0.16);
      for (const x of [-0.1, 0.38])
        B(0.08, 0.27, 0.08, amber, x, 0.25, 0.17);
    }
    return group;
  }

  function sync(decisions, preview = null) {
    const active = new Set();
    for (const scenario of CITY_CASES) {
      const id = scenario.id;
      const chosen = preview?.caseId === id
        ? preview.choiceId
        : decisions[id];
      const problem = consequenceFor(id, chosen);
      const entry = markers.get(id);
      if (!problem) {
        if (entry) {
          entry.current = null;
          entry.root.visible = false;
        }
        continue;
      }
      active.add(id);
      let marker = entry;
      if (!marker) {
        const site = CASE_BUILD_SITES[id];
        if (!site) continue;
        const root = new T.Group();
        const outer = scenario.chapter === 2;
        root.position.set(
          site.x + (outer ? 2.1 : 1.08),
          0.14,
          site.z + (outer ? 1.95 : 0.9),
        );
        root.userData.ignoreNavigation = true;
        scene.add(root);
        marker = { root, variants: new Map(), current: null };
        markers.set(id, marker);
      }
      const key = problem.status + ":" + problem.type;
      if (!marker.variants.has(key))
        marker.variants.set(key, buildShape(marker.root, problem));
      marker.current = problem;
      marker.root.visible = true;
      for (const [name, variant] of marker.variants)
        variant.visible = name === key;
    }
    return active.size;
  }

  function setFocus(focus, overview = false, range = 34) {
    for (const marker of markers.values()) {
      const p = marker.root.position;
      marker.root.visible = Boolean(marker.current) &&
        (overview || !focus || Math.hypot(p.x - focus.x, p.z - focus.z) < range);
    }
  }

  return { sync, setFocus, markers };
}
