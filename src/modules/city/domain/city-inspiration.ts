// Real-world projects, not exercises whose only product is a document.
const ideas = {
  workshop: ["Repair and reuse", "With permission, turn a clean unused household item into a usable storage or reuse solution; let someone try it."],
  power: ["Dependable services", "With permission, improve daylight use in a familiar room by safely arranging an existing work area, then test it during a real task. Do not touch electrical equipment."],
  market: ["Food that reaches people", "With permission, organise packaged supplies into a usable first-in-first-out arrangement and test it with someone responsible for them."],
  school: ["A fair chance to learn", "Help someone you know complete a difficult learning task: teach a useful method, let them try independently and improve your explanation."],
  housing: ["Safer shared spaces", "With permission, improve a shared area using light movable everyday items and test whether people can use it more easily. Avoid construction work."],
  water: ["Water people can depend on", "With permission, put a real water-saving habit into use at home or school and measure a simple change. Avoid plumbing and drinking-water testing."],
  health: ["Access to care", "With permission, make a familiar public-service waiting or information area easier to use through a small practical change. Never give medical advice or collect health information."],
  transport: ["Safer everyday journeys", "With permission, improve a familiar indoor arrival routine by organising bags or equipment to reduce congestion. Test the new routine in use; stay out of traffic."],
  technology: ["Technology that helps", "Create a working reminder or task automation using a device you already have, then test it on a real non-sensitive task."],
  business: ["Useful small enterprises", "Help a known seller or maker improve a permitted work routine using existing tools; test whether the improvement reduces errors or saves steps."],
  environment: ["Cleaner, resilient neighbourhoods", "With permission, set up a working sorting point for clean reusable items and test whether people can use it. Never handle hazardous waste."],
  governance: ["A voice in shared decisions", "With a familiar group and permission, agree on one improvement to a shared routine, put it into use and check whether it helps."],
  creative: ["Culture and belonging", "Create and share an original short audio demonstration or performance that solves a real communication need, then test the response with permission."],
  industry: ["Making useful things", "Make a useful object from existing safe materials, put it to work in a familiar setting and improve it after a real use test."],
} as const;
export type CityInterest = keyof typeof ideas;
export const cityInterests = Object.entries(ideas).map(
  ([id, [title, idea]]) => ({ id: id as CityInterest, title, idea }),
);
export function cityInspiration(value: unknown) {
  return typeof value === "string"
    ? (cityInterests.find((item) => item.id === value) ?? null)
    : null;
}
