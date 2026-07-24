export const discoveryMessages = {
  DISCOVERY_NOT_AVAILABLE: "Discovery is not available right now.",
  DISCOVERY_SESSION_NOT_FOUND: "Your Discovery session could not be found.",
  DISCOVERY_SESSION_ALREADY_COMPLETED:
    "This Discovery session has already been completed.",
  DISCOVERY_SESSION_INVALID_STATE:
    "Complete the required step before continuing.",
  DISCOVERY_QUESTION_NOT_ELIGIBLE:
    "That question is not available for your Discovery session.",
  DISCOVERY_RESPONSE_INVALID: "Check your answer and try again.",
  DISCOVERY_RESPONSE_TOO_LONG: "Shorten your answer and try again.",
  DISCOVERY_REQUIRED_RESPONSE_MISSING:
    "Answer every required question before review.",
  DISCOVERY_SAVE_CONFLICT:
    "Your Discovery changed in another tab. Refresh before saving again.",
  DISCOVERY_ACCESS_DENIED: "Complete your identity checkpoint first.",
  DISCOVERY_SAVE_FAILED: "Your answer was not saved. Please try again.",
  DISCOVERY_COMPLETION_FAILED:
    "Discovery could not be completed. Please try again.",
} as const;

export type DiscoveryErrorCode = keyof typeof discoveryMessages;

export function safeDiscoveryError(
  providerMessage: string | undefined,
  fallback: DiscoveryErrorCode,
): { code: DiscoveryErrorCode; message: string } {
  const code = Object.keys(discoveryMessages).find((candidate) =>
    providerMessage?.includes(candidate),
  ) as DiscoveryErrorCode | undefined;
  const selected = code ?? fallback;
  return { code: selected, message: discoveryMessages[selected] };
}
