// Original, minimal Web Audio cues and ambient motif. Nothing plays until
// a real user tap turns sound or music on. No audio files or downloads.
const MELODY = Object.freeze([196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63]);
const CUES = Object.freeze({
  decision: [392, 523.25],
  built: [392, 523.25, 659.25, 783.99],
  repaired: [440, 587.33, 880],
  revise: [330, 293.66],
  tap: [440],
});
export function createCityAudio({
  contextFactory,
  schedule = (fn, ms) => setInterval(fn, ms),
  cancel = (id) => clearInterval(id),
} = {}) {
  let context = null;
  let sound = false;
  let music = false;
  let tick = null;
  let position = 0;
  const ctor = contextFactory ?? (() => {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    return new Ctor();
  });
  function ready() {
    try {
      context ??= ctor();
      if (!context) return false;
      context.resume?.().catch?.(() => {});
      return true;
    } catch {
      return false;
    }
  }
  function note(freq, offset = 0, duration = 0.17, volume = 0.018, kind = "sine") {
    if (!context) return;
    try {
      const at = context.currentTime + offset;
      const o = context.createOscillator();
      const envelope = context.createGain();
      o.type = kind;
      o.frequency.setValueAtTime(freq, at);
      envelope.gain.setValueAtTime(0.0001, at);
      envelope.gain.exponentialRampToValueAtTime(volume, at + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      o.connect(envelope);
      envelope.connect(context.destination);
      o.start(at);
      o.stop(at + duration + 0.03);
    } catch {
      // No crashes on unsupported or interrupted audio hardware.
    }
  }
  function cue(kind) {
    if (!sound || !ready()) return false;
    (CUES[kind] ?? CUES.tap).forEach((freq, i) =>
      note(freq, i * 0.095, 0.17, 0.025, "sine"),
    );
    return true;
  }
  function stopMusic() {
    music = false;
    if (tick !== null) {
      cancel(tick);
      tick = null;
    }
  }
  function toggleMusic() {
    if (music) {
      stopMusic();
      return false;
    }
    if (!ready()) return false;
    music = true;
    function playBeat() {
      if (!music) return;
      note(MELODY[position++ % MELODY.length], 0, 0.36, 0.009);
    }
    playBeat();
    tick = schedule(playBeat, 760);
    return true;
  }
  function toggleSound() {
    if (sound) { sound = false; return false; }
    if (!ready()) return false;
    sound = true;
    cue("tap");
    return true;
  }
  function suspend() {
    stopMusic();
    context?.suspend?.().catch?.(() => {});
  }
  return {
    cue, toggleSound, toggleMusic, suspend,
    get sound() { return sound; },
    get music() { return music; },
    get available() { return Boolean(context); },
  };
}
