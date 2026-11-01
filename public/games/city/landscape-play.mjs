// Start from a real play gesture. Failure never blocks the game.
export function createLandscapePlay({
  doc = globalThis.document,
  win = globalThis.window,
  screen = globalThis.screen,
} = {}) {
  let started = false,
    optedOut = false,
    pending = false,
    locked = false,
    epoch = 0;
  const notice = doc.createElement("aside");
  notice.className = "landscape-play";
  notice.hidden = true;
  notice.setAttribute("aria-label", "Game orientation");
  notice.innerHTML =
    "<span data-orientation-message>Best played in landscape. Turn your phone sideways.</span><button data-free-rotation>Keep my orientation</button>";
  doc.body.append(notice);
  const portrait = () => win.innerHeight > win.innerWidth;
  const smallTouch = () =>
    Boolean(win.matchMedia?.("(pointer: coarse)").matches) &&
    Math.min(win.innerHeight, win.innerWidth) < 900;
  function allowRotation() {
    optedOut = true;
    epoch++;
    locked = false;
    try {
      screen?.orientation?.unlock?.();
    } catch {
      /* Already released by the device. */
    }
    notice.hidden = true;
  }
  notice.querySelector("button").onclick = allowRotation;
  function refresh() {
    if (!started || optedOut) return;
    notice.hidden = !locked && !portrait();
  }
  async function start() {
    if (optedOut || pending || !smallTouch()) return;
    if (locked) {
      notice.hidden = false;
      return;
    }
    if (!portrait()) return;
    started = true;
    pending = true;
    const requestEpoch = epoch;
    notice.hidden = false;
    try {
      if (typeof screen?.orientation?.lock === "function") {
        if (!doc.fullscreenElement && doc.documentElement.requestFullscreen)
          await doc.documentElement.requestFullscreen();
        if (requestEpoch !== epoch) return;
        await screen.orientation.lock("landscape");
        if (requestEpoch !== epoch) {
          screen.orientation.unlock?.();
          return;
        }
        locked = true;
        notice.querySelector("[data-orientation-message]").textContent =
          "Landscape play";
        notice.querySelector("button").textContent = "Allow rotation";
      }
    } catch {
      notice.querySelector("[data-orientation-message]").textContent =
        "Best played in landscape. Turn your phone sideways.";
    } finally {
      pending = false;
      refresh();
    }
  }
  const onClick = (e) => {
    const button = e.target.closest?.("button");
    if (
      button &&
      (button.matches(
        "#start,#resume-city,#hands-on-start,#menu-resume,[data-chapter-next]",
      ) ||
        /^(continue|resume)(\s|$)/i.test(button.textContent.trim()))
    )
      void start();
  };
  doc.addEventListener("click", onClick, true);
  win.addEventListener("resize", refresh);
  const onFullscreen = () => {
    if (!doc.fullscreenElement && locked) {
      optedOut = true;
      locked = false;
      try {
        screen.orientation.unlock?.();
      } catch {}
      notice.hidden = true;
    }
  };
  doc.addEventListener("fullscreenchange", onFullscreen);
  return {
    start,
    allowRotation,
    dispose() {
      allowRotation();
      doc.removeEventListener("click", onClick, true);
      win.removeEventListener("resize", refresh);
      doc.removeEventListener("fullscreenchange", onFullscreen);
      notice.remove();
    },
  };
}
