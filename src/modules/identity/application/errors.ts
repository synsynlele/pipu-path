export function publicAuthError(message?: string): string {
  const normalized = message?.toLowerCase() ?? "";
  if (normalized.includes("invalid login"))
    return "The email or password is incorrect.";
  if (normalized.includes("email not confirmed"))
    return "Confirm your email before signing in.";
  if (normalized.includes("already registered"))
    return "An account may already exist. Try signing in or recovering your password.";
  if (normalized.includes("rate"))
    return "Too many attempts. Please wait and try again.";
  return "We could not complete that request. Please try again.";
}
