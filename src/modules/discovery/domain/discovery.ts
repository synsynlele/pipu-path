export const discoveryResponseTypes = [
  "reflection",
  "single_select",
  "multi_select",
  "scale",
] as const;

export type DiscoveryResponseType = (typeof discoveryResponseTypes)[number];
export type DiscoverySensitivity = "standard" | "sensitive";
export type DiscoverySessionStatus = "in_progress" | "review" | "completed";

export type DiscoveryQuestion = {
  id: string;
  stableKey: string;
  sectionKey: string;
  sectionTitle: string;
  prompt: string;
  supportingText: string | null;
  responseType: DiscoveryResponseType;
  required: boolean;
  displayOrder: number;
  maxTextLength: number | null;
  minSelections: number | null;
  maxSelections: number | null;
  minScale: number | null;
  maxScale: number | null;
  options: string[];
  sensitivity: DiscoverySensitivity;
};

export type DiscoveryAnswer = {
  questionId: string;
  questionKey: string;
  text: string | null;
  selectedOptions: string[] | null;
  numeric: number | null;
  skipped: boolean;
  sensitivity: DiscoverySensitivity;
};

export type DiscoveryInput = {
  text: string | null;
  selectedOptions: string[];
  numeric: number | null;
  skipped: boolean;
};

export type DiscoveryValidationError =
  | "DISCOVERY_RESPONSE_INVALID"
  | "DISCOVERY_RESPONSE_TOO_LONG"
  | "DISCOVERY_REQUIRED_RESPONSE_MISSING";

export function validateDiscoveryInput(
  question: DiscoveryQuestion,
  input: DiscoveryInput,
): DiscoveryValidationError | null {
  if (input.skipped)
    return question.required ? "DISCOVERY_REQUIRED_RESPONSE_MISSING" : null;
  const text = input.text?.trim() ?? "";
  if (question.responseType === "reflection") {
    if (!text) return "DISCOVERY_RESPONSE_INVALID";
    if (text.length > (question.maxTextLength ?? 1200))
      return "DISCOVERY_RESPONSE_TOO_LONG";
    return null;
  }
  if (question.responseType === "scale") {
    if (
      input.numeric === null ||
      input.numeric < (question.minScale ?? 1) ||
      input.numeric > (question.maxScale ?? 5)
    )
      return "DISCOVERY_RESPONSE_INVALID";
    return null;
  }
  const count = input.selectedOptions.length;
  const min =
    question.responseType === "single_select"
      ? 1
      : (question.minSelections ?? 1);
  const max =
    question.responseType === "single_select"
      ? 1
      : (question.maxSelections ?? question.options.length);
  if (count < min || count > max) return "DISCOVERY_RESPONSE_INVALID";
  if (
    input.selectedOptions.some((option) => !question.options.includes(option))
  )
    return "DISCOVERY_RESPONSE_INVALID";
  return null;
}

export function calculateDiscoveryProgress(
  questions: DiscoveryQuestion[],
  answers: DiscoveryAnswer[],
): number {
  if (!questions.length) return 0;
  const answered = new Set(answers.map((answer) => answer.questionId));
  return Math.floor(
    (100 * questions.filter((question) => answered.has(question.id)).length) /
      questions.length,
  );
}

export function missingRequiredQuestions(
  questions: DiscoveryQuestion[],
  answers: DiscoveryAnswer[],
): DiscoveryQuestion[] {
  const valid = new Set(
    answers
      .filter((answer) => !answer.skipped)
      .map((answer) => answer.questionId),
  );
  return questions.filter(
    (question) => question.required && !valid.has(question.id),
  );
}

export type Stage4DiscoveryHandoff = {
  sessionId: string;
  questionSet: { stableKey: string; version: number };
  completedAt: string;
  processingStatus: "ready_for_stage_4";
  responses: Array<{
    category: string;
    questionKey: string;
    responseType: DiscoveryResponseType;
    value: string | string[] | number | null;
    skipped: boolean;
    sensitivity: DiscoverySensitivity;
  }>;
};
