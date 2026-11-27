// Short optional problem statements, not mandatory activities or AI calls.
const problems: Record<string, string> = {
  workshop: "Useful items are being thrown away when they could be reused.",
  power:
    "People struggle to read or work comfortably when electricity is unavailable.",
  market: "Packaged goods are sometimes forgotten or hard to find.",
  school: "People around me struggle to understand a learning concept.",
  housing: "A familiar shared space is difficult to use.",
  water: "Water is wasted during ordinary daily activities.",
  health: "People find a familiar permitted waiting-area routine confusing.",
  transport: "A familiar indoor arrival or departure routine causes delays.",
  technology:
    "People forget important everyday tasks that a simple tool could help with.",
  business: "A familiar seller or maker struggles with a repeated work task.",
  environment: "Clean reusable items get mixed up and are hard to recover.",
  governance:
    "A familiar group struggles to agree on and follow a shared routine.",
  creative: "People have difficulty understanding a practical instruction.",
  industry: "An everyday object or arrangement does not meet a real need.",
};

export function inspirationProblem(topic: string): string | undefined {
  return Object.hasOwn(problems, topic) ? problems[topic] : undefined;
}
