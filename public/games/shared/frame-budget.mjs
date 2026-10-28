// Keep cinematic movement while preventing the main thread from spending
// all its time redrawing an increasingly large city.
export function createFrameBudget({ mobile = false, software = false } = {}) {
  const baseInterval = software ? 90 : mobile ? 33 : 16;
  let lastFrame = -Infinity;
  let longFrames = 0;
  let reduced = false;
  return {
    takeFrame(now, hidden = false) {
      if (!Number.isFinite(now)) return false;
      if (hidden) {
        lastFrame = now;
        return false;
      }
      if (now - lastFrame < (reduced ? Math.max(baseInterval, 48) : baseInterval))
        return false;
      lastFrame = now;
      return true;
    },
    noteRenderTime(ms) {
      if (reduced) return false;
      longFrames = ms > 45 ? longFrames + 1 : Math.max(0, longFrames - 1);
      if (longFrames < 4) return false;
      reduced = true;
      return true;
    },
  };
}
