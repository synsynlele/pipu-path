// Original Web Audio cues: no external media requests or copyrighted tracks.
// Playback is enabled only after a real user gesture and a verified resume.
const MELODY = Object.freeze([
  196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63,
]);
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
  let pendingResume = null;
  let failure = "";
  const ctor =
    contextFactory ??
    (() => {
      const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
      return Ctor ? new Ctor() : null;
    });

  // Called synchronously within the Play or speaker button click.
  // Await completion BEFORE claiming playback is enabled.
  function unlock() {
    if (!context) {
      try {
        context = ctor();
      } catch {
        failure = "Audio could not start on this device.";
        return Promise.resolve(false);
      }
    }
    if (!context) {
      failure = "This browser does not support game audio.";
      return Promise.resolve(false);
    }
    if (context.state === "closed") {
      failure = "The audio device is unavailable. Reload the game.";
      return Promise.resolve(false);
    }
    if (context.state === "running" || !context.state) {
      failure = "";
      return Promise.resolve(true);
    }
    if (pendingResume) return pendingResume;
    try {
      const result = context.resume?.();
      pendingResume = Promise.resolve(result)
        .then(() => {
          const ok = context.state === "running" || !context.state;
          failure = ok
            ? ""
            : "Sound is blocked. Check device media volume and browser audio settings.";
          return ok;
        })
        .catch(() => {
          failure =
            "Sound is blocked. Check device media volume and browser audio settings.";
          return false;
        })
        .finally(() => {
          pendingResume = null;
        });
      return pendingResume;
    } catch {
      failure = "Audio permission was denied by this browser.";
      return Promise.resolve(false);
    }
  }

  function note(freq, offset = 0, duration = 0.2, volume = 0.09) {
    if (!context || (context.state && context.state !== "running")) return;
    try {
      const at = context.currentTime + offset;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume, at + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + duration + 0.03);
    } catch {
      failure = "Your device could not play this sound.";
    }
  }
  function playCue(kind) {
    (CUES[kind] ?? CUES.tap).forEach((freq, i) =>
      note(freq, i * 0.105, 0.22, 0.095),
    );
  }
  function cue(kind) {
    if (!sound || !context) return false;
    if (context.state && context.state !== "running") {
      // The next real user interaction can unlock audio again.
      return false;
    }
    playCue(kind);
    return true;
  }
  function stopMusic() {
    music = false;
    if (tick !== null) {
      cancel(tick);
      tick = null;
    }
  }
  function beginMusic() {
    if (tick !== null) return;
    music = true;
    const playBeat = () => {
      if (!music || (context.state && context.state !== "running")) return;
      note(MELODY[position++ % MELODY.length], 0, 0.48, 0.045);
    };
    playBeat();
    tick = schedule(playBeat, 600);
  }
  async function start() {
    const ready = await unlock();
    if (!ready) return false;
    if (!sound) {
      sound = true;
      playCue("built"); // Clearly audible on the player's first Play gesture.
    }
    if (!music) beginMusic();
    return true;
  }
  async function toggleSound() {
    if (sound) {
      sound = false;
      return false;
    }
    if (!(await unlock())) return false;
    sound = true;
    playCue("tap");
    return true;
  }
  async function toggleMusic() {
    if (music) {
      stopMusic();
      return false;
    }
    if (!(await unlock())) return false;
    beginMusic();
    return true;
  }
  function suspend() {
    stopMusic();
    context?.suspend?.().catch?.(() => {});
  }
  return {
    cue,
    start,
    toggleSound,
    toggleMusic,
    suspend,
    get sound() {
      return sound;
    },
    get music() {
      return music;
    },
    get available() {
      return Boolean(context && (!context.state || context.state === "running"));
    },
    get error() {
      return failure;
    },
  };
}
