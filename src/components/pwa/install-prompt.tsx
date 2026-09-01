"use client";

import { useEffect, useState } from "react";

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

type PwaInstallWindow = Window & {
  __pipupathDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
  __pipupathAppInstalled?: boolean;
};

type InstallInstructions = {
  title: string;
  intro: string;
  steps: string[];
};

const INSTALL_NUDGE_KEY = "pipupath-install-nudge-dismissed-at";
const INSTALL_STATE_EVENT = "pipupath:install-state";
const NUDGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const ANDROID_APK_PATH = "/downloads/PipuPath-Lite-1.0.0.apk";

function installWindow() {
  return window as PwaInstallWindow;
}

function publishInstallState() {
  window.dispatchEvent(new Event(INSTALL_STATE_EVENT));
}

function isStandalone() {
  if (typeof window === "undefined") return false;

  const displayMode =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    );

  return displayMode || iosStandalone;
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent);
}

function instructionsForCurrentDevice(): InstallInstructions {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua);
  const android = /Android/.test(ua);

  if (ios) {
    return {
      title: "Add PipuPath to your Home Screen",
      intro:
        "Apple requires you to confirm Home Screen installation from the browser. It only takes two taps from the Share menu.",
      steps: [
        "Tap the Share button in your browser — the square with the upward arrow.",
        "Choose Add to Home Screen, then tap Add. If shown, keep Open as Web App enabled.",
      ],
    };
  }

  if (android) {
    return {
      title: "Download PipuPath Lite",
      intro:
        "Download the official signed PipuPath Lite Android app directly from PipuPath.",
      steps: [
        "Tap Download and open the APK when the download finishes.",
        "If Android asks, allow installation from your browser or Files app, then tap Install.",
      ],
    };
  }

  return {
    title: "Install PipuPath",
    intro: "Keep PipuPath one tap away and open it in its own app window.",
    steps: [
      "Open your browser menu.",
      "Choose Install app, Add to Home Screen, or Create shortcut, then confirm.",
    ],
  };
}

function rememberNudgeDismissal() {
  try {
    window.localStorage.setItem(INSTALL_NUDGE_KEY, String(Date.now()));
  } catch {
    // Installation must still work when storage is unavailable.
  }
}

function recentlyDismissedNudge() {
  try {
    const raw = window.localStorage.getItem(INSTALL_NUDGE_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    return (
      Number.isFinite(dismissedAt) &&
      Date.now() - dismissedAt < NUDGE_COOLDOWN_MS
    );
  } catch {
    return false;
  }
}

function InstallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12 3v11" />
      <path d="m7.5 10 4.5 4.5 4.5-4.5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close install prompt"
      className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/8 text-blue-100 transition-colors hover:bg-white/12"
    >
      ×
    </button>
  );
}

function InstallInstructionsSheet({
  instructions,
  onClose,
}: {
  instructions: InstallInstructions;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-pipupath-title"
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/65 p-3 backdrop-blur-[3px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-primary grid size-11 place-items-center rounded-2xl text-white shadow-lg shadow-blue-950/40">
              <InstallIcon />
            </span>
            <div>
              <p className="text-primary-light text-xs font-semibold tracking-[0.12em] uppercase">
                Put PipuPath on your phone
              </p>
              <h2
                id="install-pipupath-title"
                className="mt-1 text-xl font-semibold text-white"
              >
                {instructions.title}
              </h2>
            </div>
          </div>
          <CloseButton onClose={onClose} />
        </div>

        <p className="mt-4 text-sm leading-6 text-blue-100/80">
          {instructions.intro}
        </p>

        <ol className="mt-5 space-y-3">
          {instructions.steps.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 text-sm leading-6 text-blue-50/85"
            >
              <span className="bg-primary grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="bg-primary-soft/65 mt-5 rounded-2xl border border-white/8 p-4 text-xs leading-5 text-blue-100/75">
          After installation, PipuPath opens like an app and resumes from your
          exact next step through Continue.
        </p>
      </div>
    </div>
  );
}

function InstallCoach({
  onInstall,
  onClose,
  downloadMode,
}: {
  onInstall: () => void;
  onClose: () => void;
  downloadMode: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pipupath-install-coach-title"
      className="fixed inset-0 z-[89] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#07142f] p-5 text-white shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="bg-primary grid size-12 place-items-center rounded-2xl text-white shadow-lg shadow-blue-950/40">
            <InstallIcon />
          </span>
          <CloseButton onClose={onClose} />
        </div>
        <p className="text-gold mt-5 text-xs font-semibold tracking-[0.14em] uppercase">
          One tap away
        </p>
        <h2
          id="pipupath-install-coach-title"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          {downloadMode
            ? "Download PipuPath Lite."
            : "Keep PipuPath on your device."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-blue-100/80">
          {downloadMode
            ? "Get the official lightweight Android app and keep your PipuPath account, Mission and progress in sync."
            : "Open your Mission, Quest or next move without searching for the website again."}
        </p>
        <button
          type="button"
          onClick={onInstall}
          className="bg-primary hover:bg-primary-light mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-colors"
        >
          <InstallIcon />
          {downloadMode ? "Download PipuPath" : "Install PipuPath"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 min-h-10 w-full text-sm font-semibold text-blue-100/70"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

export function InstallPwaButton({
  compact = false,
  autoNudge = false,
}: {
  compact?: boolean;
  autoNudge?: boolean;
}) {
  const [installed, setInstalled] = useState(false);
  const [androidDevice, setAndroidDevice] = useState(false);
  const [instructions, setInstructions] = useState<InstallInstructions | null>(
    null,
  );
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    setAndroidDevice(isAndroidDevice());

    const syncInstallState = () => {
      const nextInstalled =
        isStandalone() || installWindow().__pipupathAppInstalled === true;
      setInstalled(nextInstalled);

      if (nextInstalled) {
        setInstructions(null);
        setShowCoach(false);
      }
    };

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      installWindow().__pipupathDeferredInstallPrompt =
        event as BeforeInstallPromptEvent;
      publishInstallState();
    };

    const handleInstalled = () => {
      installWindow().__pipupathDeferredInstallPrompt = null;
      installWindow().__pipupathAppInstalled = true;
      syncInstallState();
      publishInstallState();
    };

    syncInstallState();
    window.addEventListener(INSTALL_STATE_EVENT, syncInstallState);
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(INSTALL_STATE_EVENT, syncInstallState);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!autoNudge || isStandalone() || !isMobileDevice()) return;
    if (recentlyDismissedNudge()) return;

    const timer = window.setTimeout(() => setShowCoach(true), 2800);
    return () => window.clearTimeout(timer);
  }, [autoNudge]);

  if (installed) return null;

  function closeCoach() {
    rememberNudgeDismissal();
    setShowCoach(false);
  }

  async function install() {
    setShowCoach(false);

    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    if (isAndroidDevice()) {
      window.location.assign(ANDROID_APK_PATH);
      return;
    }

    const promptEvent = installWindow().__pipupathDeferredInstallPrompt;
    if (promptEvent) {
      installWindow().__pipupathDeferredInstallPrompt = null;
      publishInstallState();

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;

        if (choice.outcome === "accepted") {
          setInstalled(true);
          setInstructions(null);
        } else {
          rememberNudgeDismissal();
        }
      } catch {
        setInstructions(instructionsForCurrentDevice());
      }
      return;
    }

    setInstructions(instructionsForCurrentDevice());
  }

  const showAndroidLabel = compact && androidDevice;

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        aria-label={
          androidDevice ? "Download PipuPath Lite" : "Install PipuPath"
        }
        className={`pp-install-entry border-primary/30 bg-primary-soft/65 text-primary-light hover:bg-primary-soft touch-manipulation items-center justify-center gap-2 rounded-full border font-semibold shadow-sm transition-colors ${compact && !showAndroidLabel ? "inline-flex size-10 p-0" : "inline-flex min-h-10 px-3.5 text-sm"}`}
      >
        <InstallIcon />
        {compact && !showAndroidLabel ? null : (
          <span>{androidDevice ? "Download" : "Install"}</span>
        )}
      </button>

      {showCoach ? (
        <InstallCoach
          onInstall={() => void install()}
          onClose={closeCoach}
          downloadMode={androidDevice}
        />
      ) : null}

      {instructions ? (
        <InstallInstructionsSheet
          instructions={instructions}
          onClose={() => {
            rememberNudgeDismissal();
            setInstructions(null);
          }}
        />
      ) : null}
    </>
  );
}

export function InstallPwaCard() {
  const [androidDevice, setAndroidDevice] = useState(false);

  useEffect(() => {
    setAndroidDevice(isAndroidDevice());
  }, []);

  return (
    <section className="pp-install-entry border-primary/25 bg-panel w-full rounded-[1.75rem] border p-5 shadow-[0_18px_46px_-34px_rgba(79,124,255,0.55)] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="bg-primary grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg shadow-blue-950/40">
          <InstallIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-primary-light text-xs font-semibold tracking-[0.12em] uppercase">
            Put PipuPath on your phone
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            Come back to your next move in one tap.
          </h2>
          <p className="text-muted mt-2 text-sm leading-6">
            {androidDevice
              ? "Download the official PipuPath Lite Android app. Your account and progress stay connected to the same PipuPath experience."
              : "Install the same PipuPath web app on your Home Screen. No app store is required."}
          </p>
          <div className="mt-4">
            <InstallPwaButton />
          </div>
        </div>
      </div>
    </section>
  );
}
