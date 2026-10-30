import "server-only";
import { requestOpenAIStructuredOutput } from "@/lib/ai/openai-structured-output";
import {
  publicChallengeBrief,
  validateChallenge,
  type BuildChoice,
} from "../domain/build";
const field = { type: "string" };
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "outcome", "steps", "materials", "evidence", "safety"],
  properties: {
    title: field,
    outcome: field,
    steps: { type: "array", items: field, minItems: 5, maxItems: 5 },
    materials: { type: "array", items: field, maxItems: 5 },
    evidence: field,
    safety: field,
  },
};
export async function generateBuildTemplate(
  choice: BuildChoice,
  titles: string[],
) {
  const output = await requestOpenAIStructuredOutput({
    timeoutMs: 35_000,
    schemaName: "small_real_build_v1",
    schema,
    maxOutputTokens: 1800,
    instructions:
      "You write safe public challenge templates, not learner profiles. The caller supplies only catalogue parameters, never personal data. Create one concrete useful real-world experiment for a learner aged ten or above. Exactly five short action steps: observe a familiar problem; make a small paper/cardboard/digital prototype or permitted low-risk change; test with a trusted person; improve; document what happened. Do not require spending, strangers, public posting, personal information, roads, water testing, electrical work, hazardous waste, blades, flames, heavy work, health advice or unsafe tools. Use permission and adult supervision where needed. A failed test is valid evidence, never claim impact or success. Outcomes fit the selected time and existing resources. Evidence must match the actions. Plain English, concrete objects, concise instructions. Title max100, outcome/evidence/safety max300 characters each, five steps max220 each, up to five materials max80 each. Avoid previous titles; offer a meaningfully different experiment. Give a safe no-cost paper alternative. Never promise XP, money or verified ability.",
    prompt: JSON.stringify(publicChallengeBrief(choice, titles)),
  });
  return validateChallenge(output);
}
