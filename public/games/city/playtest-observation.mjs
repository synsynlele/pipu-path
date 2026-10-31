// Privacy-first game piloting: session-only counts without identity,
// persistent storage, network requests, personal text or device fingerprints.
export const PLAYTEST_EVENTS = Object.freeze([
  "start",
  "decision",
  "revision",
  "prototype_pass",
  "prototype_retry",
  "service_test",
  "service_apply",
]);
export function createPlaytestObservation(now = () => performance.now()) {
  const counts = Object.fromEntries(PLAYTEST_EVENTS.map((id) => [id, 0]));
  let startedAt = null;
  let firstActionSeconds = null;
  function note(event) {
    if (!Object.hasOwn(counts, event)) return false;
    counts[event] = Math.min(100000, counts[event] + 1);
    const time = now();
    if (event === "start" && startedAt === null) startedAt = time;
    if (
      startedAt !== null &&
      firstActionSeconds === null &&
      ["decision", "prototype_pass", "prototype_retry"].includes(event)
    )
      firstActionSeconds = Math.max(
        0,
        Math.min(3600, Math.round((time - startedAt) / 1000)),
      );
    return true;
  }
  function snapshot() {
    return {
      version: 1,
      scope: "this open game only",
      ...counts,
      firstActionSeconds,
    };
  }
  function report() {
    const data = snapshot();
    return [
      "PipuPath city playtest · anonymous local counts",
      "Game starts: " + data.start,
      "First action: " +
        (data.firstActionSeconds === null
          ? "not observed"
          : data.firstActionSeconds + " seconds"),
      "Decisions attempted: " + data.decision,
      "Revisions: " + data.revision,
      "Successful worksite tests: " + data.prototype_pass,
      "Unsuccessful worksite tests: " + data.prototype_retry,
      "Service plans tested: " + data.service_test,
      "Service plans applied: " + data.service_apply,
      "No personal data or city choices included.",
    ].join("\n");
  }
  return { note, snapshot, report };
}
