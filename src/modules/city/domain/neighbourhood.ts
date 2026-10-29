/** Fictional practice state only. Never authorises Quest, XP or capability writes. */
export type Spot = "workshop" | "ada" | "timi" | "mama";
export type Encounter = Exclude<Spot, "workshop">;
export type NeighbourhoodSave = {
  version: 1;
  avatar: "gold" | "indigo" | "teal";
  position: { x: number; y: number };
  completed: Encounter[];
  motif: "music" | "art" | "food";
  sign: "left" | "right" | "up";
  build: ("post" | "counter" | "roof" | null)[];
  route: string[];
};
export const spots: {
  id: Spot;
  name: string;
  x: number;
  y: number;
  title: string;
}[] = [
  { id: "workshop", name: "Your workshop", x: 22, y: 77, title: "Your place" },
  { id: "ada", name: "Ada", x: 27, y: 30, title: "The invitation" },
  { id: "timi", name: "Timi", x: 71, y: 34, title: "The makers' stall" },
  { id: "mama", name: "Mama Jo", x: 72, y: 76, title: "The delivery" },
];
export function freshNeighbourhood(): NeighbourhoodSave {
  return {
    version: 1,
    avatar: "gold",
    position: { x: 42, y: 88 },
    completed: [],
    motif: "music",
    sign: "up",
    build: Array(9).fill(null),
    route: ["home"],
  };
}
export function encounterReady(state: NeighbourhoodSave, id: Encounter) {
  return (
    id === "ada" ||
    (id === "timi"
      ? state.completed.includes("ada")
      : state.completed.includes("timi"))
  );
}
export function finishEncounter(
  state: NeighbourhoodSave,
  id: Encounter,
): NeighbourhoodSave {
  if (!encounterReady(state, id)) return state;
  return {
    ...state,
    completed: state.completed.includes(id)
      ? state.completed
      : [...state.completed, id],
  };
}
export function evaluateSign(direction: NeighbourhoodSave["sign"]) {
  return direction === "right"; // The invitation crossroads is west of the market gate.
}
export function evaluateStall(cells: NeighbourhoodSave["build"]) {
  // Three roof tiles sit above two supports and a central counter.
  return (
    cells.length === 9 &&
    [0, 1, 2].every((i) => cells[i] === "roof") &&
    cells[3] === "post" &&
    cells[5] === "post" &&
    cells[7] === "counter"
  );
}
export const routeNodes = [
  { id: "home", label: "Workshop", x: 12, y: 75 },
  { id: "square", label: "Square", x: 45, y: 75 },
  { id: "bridge", label: "Footbridge", x: 45, y: 23 },
  { id: "stores", label: "Supplies", x: 12, y: 23 },
  { id: "market", label: "Market", x: 85, y: 23 },
  { id: "lane", label: "Side lane", x: 85, y: 75 },
];
const connections: Record<string, string[]> = {
  home: ["stores", "square"],
  stores: ["home", "bridge"],
  bridge: ["stores", "square"],
  square: ["home", "bridge", "lane"],
  lane: ["square", "market"],
  market: ["lane"],
};
export function canTravel(from: string, to: string) {
  return connections[from]?.includes(to) ?? false;
}
export function appendRoute(route: string[], next: string) {
  return route.length < 16 && canTravel(route[route.length - 1] ?? "home", next)
    ? [...route, next]
    : route;
}
export function evaluateRoute(route: string[]) {
  return (
    route[0] === "home" &&
    route[route.length - 1] === "market" &&
    route.includes("stores") &&
    route.length <= 9 &&
    route.slice(1).every((id, i) => canTravel(route[i], id))
  );
}
export function parseNeighbourhood(
  value: string | null,
): NeighbourhoodSave | null {
  if (!value || value.length > 5000) return null;
  try {
    const raw: unknown = JSON.parse(value);
    if (typeof raw !== "object" || raw === null) return null;
    const s = raw as NeighbourhoodSave;
    if (
      s.version !== 1 ||
      !["gold", "indigo", "teal"].includes(s.avatar) ||
      !["music", "art", "food"].includes(s.motif) ||
      !["left", "right", "up"].includes(s.sign)
    )
      return null;
    if (
      !s.position ||
      !Number.isFinite(s.position.x) ||
      !Number.isFinite(s.position.y) ||
      s.position.x < 6 ||
      s.position.x > 94 ||
      s.position.y < 12 ||
      s.position.y > 90
    )
      return null;
    if (
      !Array.isArray(s.completed) ||
      s.completed.length > 3 ||
      new Set(s.completed).size !== s.completed.length ||
      s.completed.some((x) => !["ada", "timi", "mama"].includes(x))
    )
      return null;
    if (
      (s.completed.includes("timi") && !s.completed.includes("ada")) ||
      (s.completed.includes("mama") && !s.completed.includes("timi"))
    )
      return null;
    if (
      !Array.isArray(s.build) ||
      s.build.length !== 9 ||
      s.build.some(
        (x) => x !== null && !["post", "counter", "roof"].includes(x),
      )
    )
      return null;
    if (
      !Array.isArray(s.route) ||
      s.route.length < 1 ||
      s.route.length > 16 ||
      s.route[0] !== "home" ||
      s.route.some((x) => !routeNodes.some((n) => n.id === x)) ||
      !s.route.slice(1).every((x, i) => canTravel(s.route[i], x))
    )
      return null;
    // Do not restore an internally inconsistent completion claim.
    if (
      (s.completed.includes("ada") && !evaluateSign(s.sign)) ||
      (s.completed.includes("timi") && !evaluateStall(s.build)) ||
      (s.completed.includes("mama") && !evaluateRoute(s.route))
    )
      return null;
    return {
      version: 1,
      avatar: s.avatar,
      position: { x: s.position.x, y: s.position.y },
      completed: [...s.completed],
      motif: s.motif,
      sign: s.sign,
      build: [...s.build],
      route: [...s.route],
    };
  } catch {
    return null;
  }
}
