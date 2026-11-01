export const CHAPTER_REFLECTIONS = {
  investigate: "What observation changed your first explanation?",
  market: "Which repair made the biggest difference to the traders?",
  food: "What did the harvest reveal about soil, water and heat?",
  care: "Where was the bottleneck, and who was waiting because of it?",
  teach: "What could the apprentice do without your help?",
  invent: "Which design used support and materials most effectively?",
  culture: "Who can join now, and whose needs did you protect?",
  enterprise: "Did the trial create customer value while covering costs?",
  connect: "How did your timing affect people beyond the delivery crew?",
  trust: "Who owns each promise and how will both teams check it?",
  environment: "Where would the next storm's water and waste go?",
  legacy: "What will keep working when you step away?",
};
// Bounded fictional systems. Completing these never creates real-world evidence.
export const BUILDER_CHAPTERS = [
  {
    id: "investigate",
    name: "Notice what matters",
    field: "Observation & public services",
  },
  {
    id: "market",
    name: "Make things work again",
    field: "Repair & useful spaces",
  },
  {
    id: "food",
    name: "Grow and share enough",
    field: "Agriculture & food security",
    site: "farm",
    actions: ["Change soil care", "Adjust irrigation", "Move the shade canopy"],
    brief:
      "Grow at least four healthy crates without wasting scarce water. Soil, heat and moisture work together.",
  },
  { id: "care", name: "Care for people", field: "Health & service operations" },
  {
    id: "teach",
    name: "Help others learn",
    field: "Education & human development",
  },
  {
    id: "invent",
    name: "Invent useful tools",
    field: "Engineering & technology",
    site: "tower",
    actions: [
      "Change the wheel arrangement",
      "Fit or remove the cross brace",
      "Adjust the test load",
    ],
    brief:
      "Make a cart that safely carries three crates. Compare stability, materials and capacity under load.",
  },
  {
    id: "culture",
    name: "Bring people together",
    field: "Arts, sport & inclusion",
    site: "stadium",
    actions: [
      "Rearrange audience access",
      "Adjust the sound level",
      "Turn the acoustic screens",
    ],
    brief:
      "Let all six neighbours join the performance while protecting the quiet space next door.",
  },
  {
    id: "enterprise",
    name: "Create value people need",
    field: "Enterprise & responsible finance",
    site: "homes",
    actions: [
      "Improve the product sample",
      "Set the production batch",
      "Set the stall price",
    ],
    brief:
      "Serve four customers, cover your costs and waste no more than one item. Run a small market trial before scaling.",
  },
  {
    id: "connect",
    name: "Connect the city",
    field: "Transport & coordination",
    site: "airport",
    actions: [
      "Set the crossing signals",
      "Choose the delivery route",
      "Set the dispatch spacing",
    ],
    brief:
      "Deliver four loads without crossing conflicts or a growing queue. Movement must work for people as well as vehicles.",
  },
  {
    id: "trust",
    name: "Build trust and teams",
    field: "Leadership & cooperation",
    site: "hospital",
    actions: [
      "Assign the repair crew",
      "Agree the handover order",
      "Reserve a shared inspection slot",
    ],
    brief:
      "Coordinate an electrician and a carpenter. Keep a shared promise that both teams can actually complete and inspect.",
  },
  {
    id: "environment",
    name: "Protect tomorrow",
    field: "Environment & resilience",
    site: "farm",
    actions: [
      "Sort recovered materials",
      "Open or close the drain",
      "Replace paving with a rain garden",
    ],
    brief:
      "Keep plastic out of compost and protect the yard during a storm. Observe both runoff and recovered materials.",
  },
  {
    id: "legacy",
    name: "Leave something that lasts",
    field: "Stewardship & city systems",
    site: "homes",
    actions: [
      "Assign the resident maintenance team",
      "Set the repair reserve",
      "Open the shared operating guide",
    ],
    brief:
      "Finish the other eleven chapters and six construction prototypes. Leave a city that residents can maintain without you.",
  },
].map((c, i) => Object.freeze({ ...c, number: i + 1 }));
export const SYSTEM_CHAPTERS = BUILDER_CHAPTERS.filter((c) => c.site);
export function newChapterSystems() {
  return Object.fromEntries(
    SYSTEM_CHAPTERS.map((c) => [
      c.id,
      { a: 0, b: 0, c: 0, tests: 0, done: false, result: null },
    ]),
  );
}
export function chapterComplete(id, episode, market, systems) {
  return id === "market"
    ? market.opened
    : Boolean(episode[id]?.done ?? systems[id]?.done);
}
export function completedChapters(episode, market, systems) {
  return BUILDER_CHAPTERS.filter((c) =>
    chapterComplete(c.id, episode, market, systems),
  ).length;
}
export function chapterReadout(id, s) {
  const values = {
    food: [
      `Soil: ${["bare", "compost", "mulch"][s.a]}`,
      `Water: ${s.b}/2`,
      `Shade: ${s.c ? "over beds" : "away"}`,
    ],
    invent: [
      `Wheels: ${s.a + 2}`,
      `Brace: ${s.b ? "fitted" : "removed"}`,
      `Load: ${s.c + 1} crates`,
    ],
    culture: [
      `Access: ${["steps", "ramp", "level seating"][s.a]}`,
      `Sound: ${["off", "speech", "loud"][s.b]}`,
      `Screens: ${s.c ? "towards quiet space" : "away"}`,
    ],
    enterprise: [
      `Quality: ${s.a + 1}/3`,
      `Batch: ${(s.b + 1) * 2}`,
      `Price: ${s.c + 1} tokens`,
    ],
    connect: [
      `Signals: ${["all stop", "crossing priority", "alternating phases"][s.a]}`,
      `Route: ${s.b ? "bypass" : "school crossing"}`,
      `Dispatch: ${s.c ? "spaced" : "together"}`,
    ],
    trust: [
      `Crew: ${["both on carpentry", "matched skills", "both on electrics"][s.a]}`,
      `Order: ${s.b ? "power isolated, then repair" : "repair before isolation"}`,
      `Inspection: ${s.c ? "reserved" : "missing"}`,
    ],
    environment: [
      `Sorting: ${["mixed", "organics and plastic separated", "everything composted"][s.a]}`,
      `Drain: ${s.b ? "clear" : "blocked"}`,
      `Ground: ${s.c ? "rain garden" : "sealed paving"}`,
    ],
    legacy: [
      `Owner: ${s.a ? "resident team" : "player alone"}`,
      `Reserve: ${s.b ? "funded" : "empty"}`,
      `Guide: ${s.c ? "shared" : "private"}`,
    ],
  };
  return values[id] ?? [];
}
export function evaluateChapter(id, s, context = {}) {
  let issues = [],
    metrics = {};
  if (id === "food") {
    const healthy = s.a && s.b && (s.c || s.a === 2) ? 6 : s.a && s.b ? 3 : 0;
    const wastedWater = s.b === 2 ? 1 : 0;
    metrics = { healthy, wastedWater };
    if (healthy < 4)
      issues.push(
        !s.a
          ? "The exhausted soil cannot support the harvest. Try compost or mulch."
          : !s.b
            ? "The beds are dry. Open irrigation before the next harvest."
            : "Heat damages the crop. Try shade or moisture-retaining mulch.",
      );
    if (wastedWater)
      issues.push(
        "Water runs beyond the root beds. Reduce the irrigation setting.",
      );
  } else if (id === "invent") {
    const wheels = s.a + 2,
      load = s.c + 1,
      stable = wheels >= 3 && (s.b || wheels === 4);
    metrics = { load, stable, materials: wheels + s.b };
    if (load < 3)
      issues.push("A light test misses the real need. Test all three crates.");
    if (!stable)
      issues.push(
        wheels < 3
          ? "The cart tips sideways. Spread its support beyond two wheels."
          : "The joint twists under load. Add bracing or a wider four-wheel base.",
      );
  } else if (id === "culture") {
    const reached = s.a && s.b ? 6 : s.b ? 4 : 0,
      disturbance = s.b === 2 && !s.c;
    metrics = { reached, disturbance };
    if (reached < 6)
      issues.push(
        !s.b
          ? "The audience cannot hear the performance. Turn on the sound."
          : "Two neighbours cannot reach the stepped seating. Rearrange access.",
      );
    if (disturbance)
      issues.push(
        "Loud sound spills into the quiet space. Lower it or turn the acoustic screens.",
      );
  } else if (id === "enterprise") {
    const quality = s.a + 1,
      batch = (s.b + 1) * 2,
      price = s.c + 1;
    const demand = Math.max(0, 8 - price * 2 + quality),
      served = Math.min(batch, demand),
      waste = batch - served,
      balance = served * price - batch - quality;
    metrics = { served, waste, balance };
    if (quality < 2)
      issues.push(
        "Customers report that the sample breaks. Improve quality before scaling production.",
      );
    if (served < 4)
      issues.push(
        batch < 4
          ? "You ran out before four customers were served. Try a larger batch."
          : "Too few customers accept this price. Test a more accessible price.",
      );
    if (balance < 0)
      issues.push(
        "Sales do not cover materials and quality costs. Review the price and batch together.",
      );
    if (waste > 1)
      issues.push(
        "Unsold products are piling up. Match production to observed demand.",
      );
  } else if (id === "connect") {
    const conflict = s.a === 1 && !s.b,
      queue = !s.c || s.a === 0,
      delivered = s.a && !queue && !conflict ? 4 : 0;
    metrics = { delivered, crossingConflict: conflict, queue };
    if (!s.a)
      issues.push("All signals are red. The city is safe but nobody can move.");
    if (conflict)
      issues.push(
        "This route meets crossing-priority pedestrians. Use the bypass or alternating phases.",
      );
    if (!s.c)
      issues.push(
        "Simultaneous dispatch fills the junction. Space the departures.",
      );
  } else if (id === "trust") {
    metrics = {
      matchedTeams: s.a === 1 ? 2 : 1,
      supervisedOrder: Boolean(s.b),
      inspection: Boolean(s.c),
    };
    if (s.a !== 1)
      issues.push(
        "One task has no qualified crew. Match the electrician and carpenter to their work.",
      );
    if (!s.b)
      issues.push(
        "The simulated repair starts before power is isolated. Agree a supervised safe handover first.",
      );
    if (!s.c)
      issues.push(
        "No joint inspection was reserved. Completion needs an owner who checks the promise.",
      );
  } else if (id === "environment") {
    metrics = {
      recovered: s.a === 1 ? 4 : 0,
      flooded: !s.b || !s.c,
      contaminated: s.a !== 1,
    };
    if (s.a !== 1)
      issues.push(
        "Plastic contaminates the compost. Separate usable organics and plastic.",
      );
    if (!s.b)
      issues.push(
        "Storm water backs up at the blocked drain. Clear its route.",
      );
    if (!s.c)
      issues.push(
        "Sealed paving sends too much runoff downstream. Make room for a rain garden.",
      );
  } else if (id === "legacy") {
    const prior = BUILDER_CHAPTERS.filter(
      (c) =>
        c.id !== "legacy" &&
        chapterComplete(
          c.id,
          context.episode ?? {},
          context.market ?? {},
          context.systems ?? {},
        ),
    ).length;
    const prototypes = Object.values(context.projects ?? {}).filter(
      (p) => p.open,
    ).length;
    metrics = {
      priorChapters: prior,
      prototypes,
      locallyOwned: Boolean(s.a && s.b && s.c),
    };
    if (prior < 11)
      issues.push(
        `Finish the remaining chapter outcomes first (${prior}/11 ready).`,
      );
    if (prototypes < 6)
      issues.push(
        `Test and open the six construction prototypes (${prototypes}/6 ready). Crews replicate each successful design.`,
      );
    if (!s.a)
      issues.push(
        "The city still depends on you. Assign a resident maintenance team.",
      );
    if (!s.b)
      issues.push(
        "There is no repair reserve. Fund ongoing care before handing over.",
      );
    if (!s.c)
      issues.push(
        "Residents cannot access the operating guide. Share it with the team.",
      );
  }
  return { success: issues.length === 0, issues, metrics };
}
export function systemAction(state, id, action, context = {}) {
  const chapter = SYSTEM_CHAPTERS.find((c) => c.id === id);
  if (!chapter || !["a", "b", "c", "test"].includes(action))
    return {
      state,
      changed: false,
      message: "Choose a useful action in this chapter.",
    };
  const s = { ...state[id] };
  if (action === "test") {
    s.tests++;
    s.result = evaluateChapter(id, s, context);
    s.done = s.result.success;
  } else {
    const max =
      action === "a"
        ? id === "legacy"
          ? 2
          : 3
        : action === "b"
          ? ["food", "culture", "enterprise"].includes(id)
            ? 3
            : 2
          : action === "c"
            ? id === "enterprise"
              ? 4
              : id === "invent"
                ? 3
                : 2
            : 2;
    s[action] = (s[action] + 1) % max;
    s.done = false;
    s.result = null;
  }
  return {
    state: { ...state, [id]: s },
    changed: true,
    message:
      action === "test"
        ? s.done
          ? `Chapter complete — ${chapter.name}. ${Object.entries(
              s.result.metrics,
            )
              .map(
                ([k, v]) =>
                  `${{ healthy: "Healthy crates", wastedWater: "Wasted water", load: "Crates carried", stable: "Stable", materials: "Material units", reached: "Neighbours included", disturbance: "Noise disturbance", served: "Customers served", waste: "Unsold items", balance: "Trial balance", delivered: "Loads delivered", crossingConflict: "Crossing conflict", queue: "Queue", matchedTeams: "Matched crews", supervisedOrder: "Safe handover", inspection: "Joint inspection", recovered: "Recovered items", flooded: "Flooded", contaminated: "Contaminated compost", priorChapters: "Earlier chapters", prototypes: "Approved prototypes", locallyOwned: "Resident ownership" }[k] ?? k}: ${typeof v === "boolean" ? (v ? "yes" : "no") : v}`,
              )
              .join(" · ")}.`
          : s.result.issues.join(" ")
        : `${chapterReadout(id, s).join(" · ")}. Run the trial to observe the result.`,
  };
}
