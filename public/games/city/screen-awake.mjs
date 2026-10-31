// Request a platform wake lock only while the visible game is in use.
// No polling, video workaround, persistent permission or background lock.
export function createScreenAwake({
  nav = globalThis.navigator,
  doc = globalThis.document,
  onStatus = () => {},
} = {}) {
  let playing = false,
    enabled = true,
    held = null,
    pending = false,
    epoch = 0,
    lastAttempt = -Infinity,
    disposed = false;
  const supported = Boolean(nav?.wakeLock?.request);
  const status = () => ({
    supported,
    enabled,
    active: Boolean(held && !held.released),
    playing,
  });
  const notify = () => onStatus(status());
  const wanted = () =>
    !disposed && playing && enabled && !doc?.hidden && supported;
  async function release() {
    epoch++;
    const old = held;
    held = null;
    notify();
    if (old)
      try {
        await old.release();
      } catch {
        /* The platform may already have released it. */
      }
  }
  async function refresh(force = false) {
    if (!wanted()) {
      if (held) await release();
      else notify();
      return;
    }
    if (held || pending || (!force && Date.now() - lastAttempt < 10000)) return;
    lastAttempt = Date.now();
    pending = true;
    const requestEpoch = epoch;
    try {
      const lock = await nav.wakeLock.request("screen");
      if (!wanted() || requestEpoch !== epoch) {
        await lock.release();
        return;
      }
      held = lock;
      lock.addEventListener?.("release", () => {
        if (held === lock) {
          held = null;
          notify();
        }
      });
      notify();
    } catch {
      notify();
    } finally {
      pending = false;
      if (requestEpoch !== epoch && wanted()) void refresh(true);
    }
  }
  function setPlaying(value) {
    playing = Boolean(value);
    if (!playing) void release();
    else void refresh(true);
  }
  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) void release();
    else void refresh(true);
    notify();
  }
  function visibility() {
    if (doc.hidden) void release();
    else void refresh(true);
  }
  function gesture() {
    void refresh();
  }
  doc?.addEventListener("visibilitychange", visibility);
  doc?.addEventListener("pointerdown", gesture);
  notify();
  return {
    setPlaying,
    setEnabled,
    refresh,
    status,
    release,
    dispose() {
      disposed = true;
      void release();
      doc?.removeEventListener("visibilitychange", visibility);
      doc?.removeEventListener("pointerdown", gesture);
    },
  };
}
