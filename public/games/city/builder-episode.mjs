// Fictional resident outcomes; never real-world evidence or learner assessment.
export const BUILDER_MISSIONS = [
  {
    id: "investigate",
    name: "Find the missing water",
    x: -18,
    z: -33,
    brief:
      "People are waiting for water. Follow the service, inspect what is happening, then test your explanation.",
    lesson: "Look for the cause before spending resources.",
  },
  {
    id: "care",
    name: "Help the clinic receive people",
    x: 18,
    z: -26,
    brief:
      "Four arrivals need reception and support. Organise three workers and supplies, then run the clinic.",
    lesson: "A useful service depends on flow, people and resources.",
  },
  {
    id: "teach",
    name: "Help an apprentice succeed",
    x: -15,
    z: 12,
    brief:
      "An apprentice needs to make a stable crate. Prepare practice, demonstrate, then let the learner work independently.",
    lesson: "Helping someone learn is a meaningful thing to build.",
  },
];
export const EPISODE_OBJECTS = [
  {
    id: "investigate:resident",
    mission: "investigate",
    name: "Listen to the waiting residents",
    x: -20,
    z: -28,
    approach: { x: -21, z: -27 },
  },
  {
    id: "investigate:tank",
    mission: "investigate",
    name: "Inspect the supply tank",
    x: -21,
    z: -34,
    approach: { x: -22.5, z: -33 },
  },
  {
    id: "investigate:pump",
    mission: "investigate",
    name: "Try repairing the pump",
    x: -16,
    z: -34,
    approach: { x: -14.5, z: -33 },
  },
  {
    id: "investigate:valve",
    mission: "investigate",
    name: "Inspect the supply valve",
    x: -18,
    z: -31,
    approach: { x: -19, z: -31.8 },
  },
  {
    id: "investigate:test",
    mission: "investigate",
    name: "Test water at the collection point",
    x: -16,
    z: -28,
    approach: { x: -15, z: -27 },
  },
  {
    id: "care:reception",
    mission: "care",
    name: "Move a worker to reception",
    x: 14,
    z: -26,
    approach: { x: 13, z: -24.5 },
  },
  {
    id: "care:support",
    mission: "care",
    name: "Move a worker to support",
    x: 21,
    z: -26,
    approach: { x: 22.5, z: -24.5 },
  },
  {
    id: "care:supplies",
    mission: "care",
    name: "Collect a clinic supply box",
    x: 13,
    z: -22,
    approach: { x: 14, z: -21 },
  },
  {
    id: "care:deliver",
    mission: "care",
    name: "Stock the support station",
    x: 21,
    z: -23,
    approach: { x: 22.5, z: -22 },
  },
  {
    id: "care:test",
    mission: "care",
    name: "Run the clinic arrivals",
    x: 18,
    z: -22,
    approach: { x: 19, z: -21 },
  },
  {
    id: "teach:tools",
    mission: "teach",
    name: "Arrange the practice tools",
    x: -19,
    z: 12,
    approach: { x: -20, z: 13.5 },
  },
  {
    id: "teach:demonstrate",
    mission: "teach",
    name: "Demonstrate a careful joint",
    x: -17,
    z: 9,
    approach: { x: -17, z: 11 },
  },
  {
    id: "teach:jig",
    mission: "teach",
    name: "Fit or remove the practice clamp",
    x: -14,
    z: 9,
    approach: { x: -12.5, z: 10 },
  },
  {
    id: "teach:test",
    mission: "teach",
    name: "Step back and let the apprentice try",
    x: -11,
    z: 14,
    approach: { x: -10, z: 15 },
  },
];
export function newEpisode() {
  return {
    investigate: {
      heard: false,
      tankSeen: false,
      valveKnown: false,
      valveOpen: false,
      partsSpent: 0,
      tests: 0,
      done: false,
    },
    care: {
      reception: 3,
      support: 0,
      stock: 0,
      tests: 0,
      served: 0,
      done: false,
    },
    teach: {
      tools: false,
      demonstrations: 0,
      jig: false,
      trial: 0,
      running: false,
      attempts: 0,
      stable: false,
      done: false,
    },
  };
}
export function missionUnlocked(s, id) {
  return (
    id === "investigate" ||
    (id === "care" && s.investigate.done) ||
    (id === "teach" && s.care.done)
  );
}
export function episodeAction(state, carrying, id) {
  const o = EPISODE_OBJECTS.find((o) => o.id === id);
  if (!o)
    return {
      state,
      carrying,
      changed: false,
      message: "Choose a resident or a useful task.",
    };
  if (!missionUnlocked(state, o.mission))
    return {
      state,
      carrying,
      changed: false,
      message: "Finish the previous mission before starting this one.",
    };
  const m = { ...state[o.mission] },
    next = { ...state, [o.mission]: m };
  const reject = (message) => ({ state, carrying, changed: false, message });
  let message;
  if (o.mission === "investigate") {
    if (id.endsWith("resident")) {
      m.heard = true;
      message =
        "Residents: “The pump is running, but nothing reaches this collection point.”";
    }
    if (id.endsWith("tank")) {
      m.tankSeen = true;
      message =
        "The tank is full. Adding another tank would not restore this interrupted flow.";
    }
    if (id.endsWith("pump")) {
      m.partsSpent++;
      message =
        "The pump already runs. Replacing its working part uses a spare, but the interruption remains.";
    }
    if (id.endsWith("valve")) {
      if (!m.valveKnown) {
        m.valveKnown = true;
        message =
          "The valve is closed. The running pump cannot send water past it. Tap the valve again to operate it.";
      } else {
        m.valveOpen = !m.valveOpen;
        message = m.valveOpen
          ? "Valve opened. Watch the supply and test it at the collection point."
          : "Valve closed. Supply is interrupted again.";
        m.done = false;
      }
    }
    if (id.endsWith("test")) {
      m.tests++;
      m.done = m.heard && m.tankSeen && m.valveKnown && m.valveOpen;
      message = !m.valveOpen
        ? "No water reaches the collection point. Inspect the supply route before replacing more equipment."
        : m.done
          ? "Supply restored and tested! You found the cause rather than building something unnecessary."
          : "Water flows. Speak with residents and inspect the source to explain what changed.";
    }
  } else if (o.mission === "care") {
    if (id.endsWith("reception")) {
      if (!m.support)
        return reject(
          "All three workers are already at reception. Try observing the support station.",
        );
      m.reception++;
      m.support--;
      message = "A worker moved from support to reception.";
      m.done = false;
    }
    if (id.endsWith("support")) {
      if (!m.reception)
        return reject(
          "All three workers are at support. Reception needs someone too.",
        );
      m.support++;
      m.reception--;
      message = "A worker moved from reception to support.";
      m.done = false;
    }
    if (id.endsWith("supplies")) {
      if (carrying)
        return reject("Return your carried item before collecting supplies.");
      if (m.stock === 2)
        return reject(
          "The support station already has enough stock for this arrival period.",
        );
      carrying = "clinic supplies";
      message = "Supply box collected. Carry it to the support station.";
    }
    if (id.endsWith("deliver")) {
      if (carrying !== "clinic supplies")
        return reject("Collect a supply box and carry it here.");
      if (m.stock === 2) return reject("The station is already stocked.");
      m.stock++;
      carrying = null;
      message = `Support stock: ${m.stock}/2 boxes. Organise workers, then run arrivals.`;
      m.done = false;
    }
    if (id.endsWith("test")) {
      m.tests++;
      m.served = Math.min(
        4,
        m.reception * 4,
        m.support ? m.support * 3 + 2 : 0,
        m.stock * 2,
      );
      m.done = m.served === 4;
      message = m.done
        ? "All four arrivals reached the trained staff. Your reception, support and supplies work together."
        : `${m.served}/4 arrivals reached the trained staff. ${!m.reception ? "Reception has no worker. " : ""}${!m.support ? "Support has no worker. " : ""}${m.stock < 2 ? "More support supplies are needed." : "Adjust the staffing balance."}`;
    }
  } else {
    if (m.running)
      return reject(
        "Let the apprentice finish this independent attempt before changing the practice station.",
      );
    if (id.endsWith("tools")) {
      m.tools = !m.tools;
      m.done = false;
      message = m.tools
        ? "Tools are arranged within the apprentice’s reach."
        : "Tools were put away. The apprentice cannot practise independently.";
    }
    if (id.endsWith("demonstrate")) {
      m.demonstrations = Math.min(2, m.demonstrations + 1);
      m.done = false;
      message =
        m.demonstrations === 1
          ? "You demonstrated measuring and aligning. Let the apprentice try; watch what still needs support."
          : "Your second demonstration emphasised supporting the joint before fastening it.";
    }
    if (id.endsWith("jig")) {
      m.jig = !m.jig;
      m.done = false;
      message = m.jig
        ? "A clamp now holds the parts steady while the apprentice practises."
        : "Clamp removed. The learner will need to support the joint independently.";
    }
    if (id.endsWith("test")) {
      m.running = true;
      m.trial = 0;
      m.attempts++;
      m.done = false;
      message =
        "You stepped back. Watch the apprentice attempt the task without your hands doing the work.";
    }
  }
  return { state: next, carrying, changed: true, message, completed: m.done };
}
export function advanceApprentice(state, dt, playerAway) {
  const m = state.teach;
  if (!m.running || !playerAway) return { state, finished: false };
  const t = { ...m, trial: Math.min(2, m.trial + Math.max(0, dt)) };
  if (t.trial >= 2) {
    t.running = false;
    t.stable =
      t.tools && t.demonstrations > 0 && (t.jig || t.demonstrations === 2);
    t.done = t.stable;
    return {
      state: { ...state, teach: t },
      finished: true,
      message: t.done
        ? "The apprentice made a stable crate independently! You built another person’s ability."
        : !t.tools
          ? "The apprentice could not reach the tools. Rearrange practice and try again."
          : !t.demonstrations
            ? "The apprentice needs a demonstration before attempting the task."
            : "The pieces align, but the joint slips. Add a practice clamp or demonstrate supporting the joint, then try again.",
    };
  }
  return { state: { ...state, teach: t }, finished: false };
}
export function episodeHint(s, id) {
  if (s[id].done)
    return "Mission complete. Inspect what changed for people, then choose the next mission.";
  if (id === "investigate")
    return "Follow the interrupted supply. Listen, inspect and test what actually changes.";
  if (id === "care")
    return "Share three workers between reception and support. Stock the station and observe four arrivals.";
  return "Prepare practice, demonstrate, then step back. Judge learning by the apprentice’s independent attempt.";
}
