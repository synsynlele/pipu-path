const ideas = {
  workshop: [
    "Repair and skills",
    "Find out why a useful item is left unused. Sketch a safe repair or reuse plan; leave electrical work to qualified adults.",
  ],
  power: [
    "Dependable services",
    "Observe when a learning space needs light. Suggest a timetable or daylight arrangement without touching electrical equipment.",
  ],
  market: [
    "Food that reaches people",
    "With a trusted adult, observe where food gets wasted. Test a simple labelling or storage reminder without handling unsafe food.",
  ],
  school: [
    "A fair chance to learn",
    "Ask a classmate you know what makes a learning task difficult. Try a clearer explanation or paper model together.",
  ],
  housing: [
    "Safer shared spaces",
    "Observe a shared space with permission. Draw a safer arrangement; do not inspect construction sites or move heavy objects.",
  ],
  water: [
    "Water people can depend on",
    "Observe water use at home or school with permission. Test a reminder that reduces waste; do not test drinking-water safety yourself.",
  ],
  health: [
    "Access to care",
    "With a trusted adult, make a clear map of an approved route to a known health service. Do not give medical advice or collect health information.",
  ],
  transport: [
    "Safer everyday journeys",
    "From a safe place with an adult, observe a familiar school route. Draw a safer route proposal without entering traffic.",
  ],
  technology: [
    "Technology that helps",
    "Ask someone you know about a repetitive task. Draw a simple tool or paper prototype and ask for feedback.",
  ],
  business: [
    "Useful small enterprises",
    "Ask a trusted adult about a customer problem. Test a paper order tracker with fictional details; no borrowing or spending is required.",
  ],
  environment: [
    "Cleaner, resilient neighbourhoods",
    "Observe a permitted area with an adult. Map where waste collects and suggest prevention; do not enter drains or handle hazardous waste.",
  ],
  governance: [
    "A voice in shared decisions",
    "Invite classmates you know to suggest one improvement. Compare their reasons and agree a small action with your teacher.",
  ],
  creative: [
    "Culture and belonging",
    "Create a short story, poster or performance about a useful local idea. Ask permission before sharing anyone's work or image.",
  ],
  industry: [
    "Making useful things",
    "Find a small everyday need. Make a paper or cardboard prototype using age-appropriate materials and adult guidance.",
  ],
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
