type Entry = { count: number; resetsAt: number };
const attempts = new Map<string, Entry>();

export function allowAttempt(
  key: string,
  limit = 8,
  windowMs = 60_000,
  now = Date.now(),
): boolean {
  const entry = attempts.get(key);
  if (!entry || entry.resetsAt <= now) {
    attempts.set(key, { count: 1, resetsAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function clearRateLimitsForTests() {
  attempts.clear();
}
