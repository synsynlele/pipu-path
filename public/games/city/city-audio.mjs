// Original Web Audio cues: no external media requests or copyrighted tracks.
// Playback is enabled only after a real user gesture and a verified resume.
// Original 120 BPM construction groove: melody, bass, chords and light percussion.
const MELODY = Object.freeze([
  523.25, 0, 659.25, 783.99, 659.25, 587.33, 523.25, 0, 659.25, 783.99, 880,
  783.99, 659.25, 0, 587.33, 659.25, 698.46, 0, 880, 783.99, 698.46, 659.25,
  587.33, 0, 783.99, 880, 1046.5, 880, 783.99, 659.25, 587.33, 0,
]);
const ROOTS = Object.freeze([130.81, 110, 174.61, 196]);
const LEVEL_KEY = "pipupath.city.audio-levels.v1";
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
  let mood = "building";
  let music = false;
  let tick = null;
  let position = 0;
  let pendingResume = null;
  let failure = "";
  let output = null;
  let musicVolume = 0.85;
  let effectsVolume = 1;
  try {
    const saved = JSON.parse(
      globalThis.localStorage?.getItem(LEVEL_KEY) ?? "null",
    );
    if (
      saved &&
      Number.isFinite(saved.music) &&
      saved.music >= 0 &&
      saved.music <= 1
    )
      musicVolume = saved.music;
    if (
      saved &&
      Number.isFinite(saved.effects) &&
      saved.effects >= 0 &&
      saved.effects <= 1
    )
      effectsVolume = saved.effects;
  } catch {
    /* Audio still works when preference storage is blocked. */
  }
  function setVolume(channel, value) {
    if (!["music", "effects"].includes(channel) || !Number.isFinite(value))
      return false;
    const level = Math.max(0, Math.min(1, value));
    if (channel === "music") musicVolume = level;
    else effectsVolume = level;
    try {
      globalThis.localStorage?.setItem(
        LEVEL_KEY,
        JSON.stringify({ music: musicVolume, effects: effectsVolume }),
      );
    } catch {
      /* Keep the current session setting. */
    }
    return true;
  }
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

  function note(
    freq,
    offset = 0,
    duration = 0.2,
    volume = 0.25,
    type = "sine",
  ) {
    if (volume <= 0 || !freq) return;
    if (!context || (context.state && context.state !== "running")) return;
    try {
      const at = context.currentTime + offset;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume, at + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      oscillator.connect(gain);
      if (!output) {
        output = context.createGain();
        output.gain.value = 0.65; // Leave headroom for layered voices and feedback cues.
        output.connect(context.destination);
      }
      gain.connect(output);
      oscillator.onended = () => {
        oscillator.disconnect?.();
        gain.disconnect?.();
      };
      oscillator.start(at);
      oscillator.stop(at + duration + 0.03);
    } catch {
      failure = "Your device could not play this sound.";
    }
  }
  function playCue(kind) {
    (CUES[kind] ?? CUES.tap).forEach((freq, i) =>
      note(freq, i * 0.105, 0.18, 0.34 * effectsVolume, "triangle"),
    );
  }
  function cue(kind) {
    if (!sound || !context || effectsVolume === 0) return false;
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
      const step = position++ % MELODY.length;
      const pitch = mood === "calm" ? 0.89 : mood === "busy" ? 1.12 : 1;
      const root = ROOTS[Math.floor(step / 8)] * pitch;
      const level = musicVolume;
      note(
        MELODY[step] * pitch,
        0,
        mood === "calm" ? 0.28 : 0.2,
        0.16 * level,
        "triangle",
      );
      if (step % 2 === 0) note(root, 0, 0.36, 0.13 * level);
      if (step % 4 === 0) {
        note(root * 2, 0, 0.72, 0.04 * level, "triangle");
        note(root * 3, 0, 0.72, 0.04 * level, "triangle");
        note(85, 0, 0.11, 0.12 * level);
      }
      if (step % 2 === 1) note(2200, 0, 0.035, 0.04 * level);
      if (step % 8 === 4) note(180, 0, 0.08, 0.07 * level, "triangle");
    };
    playBeat();
    tick = schedule(playBeat, 250);
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
    setMood(value) {
      if (["building", "calm", "busy"].includes(value)) mood = value;
    },
    cue,
    start,
    toggleSound,
    toggleMusic,
    suspend,
    setVolume,
    get musicVolume() {
      return musicVolume;
    },
    get effectsVolume() {
      return effectsVolume;
    },
    get sound() {
      return sound;
    },
    get music() {
      return music;
    },
    get available() {
      return Boolean(
        context && (!context.state || context.state === "running"),
      );
    },
    get error() {
      return failure;
    },
  };
}
