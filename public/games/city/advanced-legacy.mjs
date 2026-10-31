// Preserved 2026 Chapter 5–12 validator for migrating real player progress.
// Only referenced when reading legacy v1 saves; never offered as new missions.
// No AI calls, real-world outcomes, grades or fabricated evidence.
import { resilienceReport } from "./resilience.mjs";
const sites = [
  "water",
  "industry",
  "market",
  "health",
  "workshop",
  "business",
  "transport",
];
export const ADVANCED_CHAPTERS = [
  {
    number: 5,
    title: "Repair and Upgrade",
    missions: [
      [
        "The clinic still waits",
        "Stored water is available, but the clinic's direct delivery link is broken. A working relay can bypass it.",
        "health",
        "network",
        "Repair the route",
        [
          "Increase clinic advertising",
          "Repair the route",
          "Close the water store",
        ],
      ],
      [
        "Restore the repair team",
        "Parts are ready. Repair teams need water before they can restore services. Protect care while supplying repairs.",
        "workshop",
        "allocate",
        "Water is the repair bottleneck",
        [
          "Water is the repair bottleneck",
          "Parts have no value",
          "Stop all clinic deliveries",
        ],
      ],
    ],
  },
  {
    number: 6,
    title: "A Growing City",
    missions: [
      [
        "More homes, same water",
        "Demand grew, but the water budget did not. Meet essential requests before using the reserve.",
        "water",
        "allocate",
        "Allocate the limited supply",
        [
          "Promise unlimited supply",
          "Allocate the limited supply",
          "Ignore new residents",
        ],
      ],
      [
        "A second delivery route",
        "The old direct road is blocked. Connect the depot through a working relay to reach the growing neighbourhood.",
        "transport",
        "network",
        "Use a working bypass",
        [
          "Use a working bypass",
          "Send traffic into the blockage",
          "Buy more signs only",
        ],
      ],
    ],
  },
  {
    number: 7,
    title: "Connected Crises",
    missions: [
      [
        "Water keeps food moving",
        "Growers depend on water; shops depend on growers. Protect both care and food while retaining repair capacity.",
        "market",
        "allocate",
        "Protect the connected services",
        [
          "Shops can sell absent food",
          "Protect the connected services",
          "Water only matters at clinics",
        ],
      ],
      [
        "Restore the supply chain",
        "The direct industrial link is down. Route parts through a working relay so repairs can keep the other services running.",
        "industry",
        "network",
        "Restore parts delivery",
        [
          "Stop all repairs",
          "Restore parts delivery",
          "Announce that work is finished",
        ],
      ],
    ],
  },
  {
    number: 8,
    title: "Build for Everyone",
    missions: [
      [
        "Who is still waiting?",
        "The clinic and growers need water at the same time. A plan that serves only one leaves another essential need unmet.",
        "health",
        "allocate",
        "Meet both essential minimums",
        [
          "Meet both essential minimums",
          "Always serve the nearest first",
          "Hide the waiting count",
        ],
      ],
      [
        "Reach the overlooked shops",
        "A short direct connection is broken. A longer working route can serve shops that earlier plans left out.",
        "business",
        "network",
        "Test access through a relay",
        [
          "Count the broken road as working",
          "Close the shops",
          "Test access through a relay",
        ],
      ],
    ],
  },
  {
    number: 9,
    title: "Use Less, Serve More",
    missions: [
      [
        "Protect a reserve",
        "Tomorrow's supply is uncertain. Meet today's essential minimums and retain the stated reserve rather than spend everything.",
        "water",
        "allocate",
        "Keep the reserve after meeting needs",
        [
          "Spend every unit today",
          "Keep the reserve after meeting needs",
          "Keep everything and serve nobody",
        ],
      ],
      [
        "A lean repair route",
        "Each open connection takes maintenance. Reach the service within the connection budget; unnecessary links waste capacity.",
        "workshop",
        "network",
        "Use a tested route within budget",
        [
          "Open every connection",
          "Use a tested route within budget",
          "Ignore the broken direct link",
        ],
      ],
    ],
  },
  {
    number: 10,
    title: "Lead Through Pressure",
    missions: [
      [
        "Balance today and tomorrow",
        "Care, food production and repairs all have minimum needs. The supply budget cannot satisfy unlimited requests.",
        "industry",
        "allocate",
        "Balance the three minimums",
        [
          "Balance the three minimums",
          "Promise all requests without counting",
          "Spend all supply on one service",
        ],
      ],
      [
        "Reconnect under constraint",
        "The direct link has failed. You have a limited number of connections to restore a useful service.",
        "transport",
        "network",
        "Test the bypass before deploying",
        [
          "Declare the link restored",
          "Test the bypass before deploying",
          "Wait without checking routes",
        ],
      ],
    ],
  },
  {
    number: 11,
    title: "Design for Reliability",
    missions: [
      [
        "One route is not enough",
        "A single relay route works today but fails if one connection breaks. Provide two independent working routes.",
        "health",
        "network",
        "Build independent backup routes",
        [
          "Build independent backup routes",
          "Paint the same route twice",
          "Count the broken direct link",
        ],
      ],
      [
        "Keep emergency capacity",
        "Protect essential needs and the emergency reserve. A small repair allocation reduces the next disruption's risk.",
        "workshop",
        "allocate",
        "Protect needs, repairs and reserve",
        [
          "Spend the reserve first",
          "Protect needs, repairs and reserve",
          "Ignore tomorrow's risk",
        ],
      ],
    ],
  },
  {
    number: 12,
    title: "The Final Challenge",
    missions: [
      [
        "Keep the whole city supplied",
        "Combine everything learned: protect care, food and repairs, account for limited supply and keep an emergency reserve.",
        "market",
        "allocate",
        "Test the full allocation against every constraint",
        [
          "Check only the total spent",
          "Test the full allocation against every constraint",
          "Serve only the biggest service",
        ],
      ],
      [
        "A city that can keep going",
        "Your final delivery system must survive any single working connection failing. Test both routes, then deploy and inspect the city you improved.",
        "transport",
        "network",
        "Verify the backup survives a failed link",
        [
          "Verify the backup survives a failed link",
          "Assume extra links guarantee reliability",
          "Declare success before testing",
        ],
      ],
    ],
  },
];
const count = ADVANCED_CHAPTERS.reduce((n, c) => n + c.missions.length, 0);
export function sanitizeAdvanced(value) {
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.records) ||
    value.records.length > count
  )
    return null;
  const seed =
    Number.isInteger(value.seed) && value.seed >= 0 && value.seed <= 10
      ? value.seed
      : 0;
  const records = [];
  for (let i = 0; i < value.records.length; i++) {
    const r = value.records[i];
    if (!r || !Array.isArray(r.plan)) return null;
    const m = missionAt(i);
    if (
      !m ||
      r.plan.length !== (m.kind === "allocate" ? 3 : 5) ||
      !r.plan.every((n) => Number.isInteger(n) && n >= 0 && n <= 30)
    )
      return null;
    const prior = { version: 1, seed, records: [...records] };
    if (!testAdvanced(prior, r.plan).ok) return null;
    records.push({ plan: [...r.plan] });
  }
  const phase = ["diagnose", "configure", "result"].includes(
    value.cursor?.phase,
  )
    ? value.cursor.phase
    : "diagnose";
  const plan =
    Array.isArray(value.cursor?.plan) &&
    value.cursor.plan.length <= 5 &&
    value.cursor.plan.every((n) => Number.isInteger(n) && n >= 0 && n <= 30)
      ? [...value.cursor.plan]
      : [];
  return { version: 1, seed, records, cursor: { phase, plan } };
}
export function newAdvanced(resilience) {
  return {
    version: 1,
    seed: Math.min(10, resilience?.seed?.capacity?.water ?? 0),
    records: [],
    cursor: { phase: "diagnose", plan: [] },
  };
}
function missionAt(index) {
  const chapter = ADVANCED_CHAPTERS[Math.floor(index / 2)];
  const raw = chapter?.missions[index % 2];
  if (!raw) return null;
  const [title, brief, district, kind, diagnosis, answers] = raw;
  return {
    chapter: chapter.number,
    chapterTitle: chapter.title,
    title,
    brief,
    district,
    kind,
    diagnosis,
    answers,
    index,
  };
}
export function advancedMission(value) {
  return missionAt(value?.records?.length ?? 0);
}
export function canStartAdvanced(resilience) {
  return resilienceReport(resilience)?.completed === true;
}
export function advancedUpgrades(value) {
  const result = Object.fromEntries(sites.map((id) => [id, 0]));
  for (let i = 0; i < (value?.records?.length ?? 0); i++) {
    const mission = missionAt(i);
    result[mission.district]++;
    // A tested connection repairs both ends and the transport link. A
    // distribution test restores the depots and receiving service nodes.
    const linked =
      mission.kind === "network"
        ? ["water", "transport"]
        : ["water", "industry", "health", "market", "workshop"];
    for (const id of linked) result[id] = Math.max(1, result[id]);
  }
  return result;
}
export function advancedRules(value) {
  const m = advancedMission(value);
  if (!m) return null;
  const tier = m.chapter - 5;
  const minimum = [
    3 + Math.floor(tier / 3),
    2 + Math.floor(tier / 2),
    1 + Math.floor(tier / 3),
  ];
  const reserve = m.chapter >= 9 ? 2 : 1;
  const upgraded = advancedUpgrades(value);
  const bonus = Math.min(3, Math.floor((value.seed ?? 0) / 3) + upgraded.water);
  return {
    minimum,
    reserve,
    budget: minimum.reduce((a, b) => a + b, 0) + reserve + 1 + bonus,
    links: m.chapter >= 11 ? 4 : 3,
    redundant: m.chapter >= 11,
  };
}
export function testAdvanced(value, plan) {
  const m = advancedMission(value),
    r = advancedRules(value);
  if (!m) return { ok: false, message: "The main story is complete." };
  if (
    !Array.isArray(plan) ||
    plan.length !== (m.kind === "allocate" ? 3 : 5) ||
    !plan.every((n) => Number.isInteger(n) && n >= 0 && n <= 30)
  )
    return { ok: false, message: "Check your controls and test again." };
  if (m.kind === "allocate") {
    const used = plan.reduce((a, b) => a + b, 0),
      left = r.budget - used;
    if (left < r.reserve)
      return {
        ok: false,
        message: `You used ${used}/${r.budget}. Keep at least ${r.reserve} units in reserve.`,
      };
    const missing = r.minimum.map((n, i) => Math.max(0, n - plan[i]));
    if (missing.some(Boolean))
      return {
        ok: false,
        message: `Still needed: clinic ${missing[0]}, growers ${missing[1]}, repairs ${missing[2]}. Adjust and test again.`,
      };
    return {
      ok: true,
      message: `Test passed: clinic ${plan[0]}, growers ${plan[1]}, repairs ${plan[2]}; ${left} units remain.`,
    };
  }
  if (!plan.every((n) => n === 0 || n === 1))
    return { ok: false, message: "Use the connection switches." };
  if (plan[4])
    return {
      ok: false,
      message:
        "The direct connection is broken. Switch it off and find a working bypass.",
    };
  if (plan.reduce((a, b) => a + b, 0) > r.links)
    return {
      ok: false,
      message: `You can maintain only ${r.links} connections. Close an unnecessary link.`,
    };
  const paths =
    Number(Boolean(plan[0] && plan[1])) + Number(Boolean(plan[2] && plan[3]));
  if (paths < (r.redundant ? 2 : 1))
    return {
      ok: false,
      message: r.redundant
        ? "One route cannot survive a failed link. Connect two independent relay routes."
        : "No complete route reaches the service. Connect depot to relay and relay to service.",
    };
  return {
    ok: true,
    message: r.redundant
      ? "Test passed: either relay route can fail and the other still delivers."
      : "Test passed: a working route bypasses the broken connection.",
  };
}
export function deployAdvanced(value, plan) {
  const safe = sanitizeAdvanced(value);
  if (!safe || !testAdvanced(safe, plan).ok) return null;
  return {
    ...safe,
    records: [...safe.records, { plan: [...plan] }],
    cursor: { phase: "result", plan: [] },
  };
}
export function advancedCityActivity(economy, resilience, value) {
  if (!value?.records?.length) return null;
  const upgrades = advancedUpgrades(value),
    index = value.records.length - 1,
    m = missionAt(index),
    r = advancedRules({ ...value, records: value.records.slice(0, -1) }),
    plan = value.records[index].plan;
  const previous = resilienceReport(resilience)?.last?.requests ?? {
    clinic: { requested: 3, served: 0 },
    farms: { requested: 2, served: 0 },
    repairs: { requested: 2, served: 0 },
    shops: { requested: 2, served: 0 },
  };
  const requests = Object.fromEntries(
    Object.entries(previous).map(([id, row]) => [id, { ...row }]),
  );
  if (m.kind === "allocate") {
    for (const [i, id] of ["clinic", "farms", "repairs"].entries())
      requests[id] = {
        requested: r.minimum[i],
        served: Math.min(r.minimum[i], plan[i]),
      };
  } else {
    const repaired = {
      health: "clinic",
      market: "farms",
      workshop: "repairs",
      industry: "repairs",
      business: "shops",
    }[m.district];
    if (repaired) requests[repaired].served = requests[repaired].requested;
  }
  return {
    ...economy,
    day: Math.max(1, economy.day),
    upgrades,
    last: {
      ...economy.last,
      requests,
      shipments: [
        { from: "water", to: "health", units: requests.clinic.served },
        { from: "water", to: "market", units: requests.farms.served },
        { from: "industry", to: "workshop", units: requests.repairs.served },
        { from: "market", to: "business", units: requests.shops.served },
      ],
      advancedDistrict: m.district,
    },
  };
}
