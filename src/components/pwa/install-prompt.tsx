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

type InstalledRelatedApp = {
  id?: string;
  platform?: string;
};

type NavigatorWithRelatedApps = Navigator & {
  getInstalledRelatedApps?: () => Promise<InstalledRelatedApp[]>;
};

type PwaInstallWindow = Window & {
  __pipupathDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
  __pipupathAppInstalled?: boolean;
};

type InstallExperience = {
  ready: boolean;
  installed: boolean;
  androidWebsite: boolean;
  desktopInstallable: boolean;
};

const INSTALL_NUDGE_KEY = "pipupath-install-nudge-dismissed-at";
const INSTALL_STATE_EVENT = "pipupath:install-state";
const NUDGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const ANDROID_APK_PATH = "/downloads/PipuPath-Lite-1.0.0.apk";
const ANDROID_APP_PACKAGE_ID = "ng.name.pipupath.lite";

function installWindow() {
  return window as PwaInstallWindow;
}

function publishInstallState() {
  window.dispatchEvent(new Event(INSTALL_STATE_EVENT));
}

function isAndroidAppShell() {
  return (
    typeof document !== "undefined" &&
    document.referrer.startsWith("android-app://")
  );
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

  return displayMode || iosStandalone || isAndroidAppShell();
}

function isAndroidDevice() {
  return (
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)
  );
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const regularMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const iPadDesktopMode = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;

  return regularMobile || iPadDesktopMode;
}

async function isRelatedAndroidAppInstalled() {
  if (!isAndroidDevice()) return false;

  const relatedAppsNavigator = navigator as NavigatorWithRelatedApps;
  if (typeof relatedAppsNavigator.getInstalledRelatedApps !== "function") {
    return false;
  }

  try {
    const installedApps = await relatedAppsNavigator.getInstalledRelatedApps();
    return installedApps.some((app) => {
      return app.platform === "play" && app.id === ANDROID_APP_PACKAGE_ID;
    });
  } catch {
    return false;
  }
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

function useInstallExperience() {
  const [experience, setExperience] = useState<InstallExperience>({
    ready: false,
    installed: false,
    androidWebsite: false,
    desktopInstallable: false,
  });

  useEffect(() => {
    let active = true;

    const syncInstallState = async () => {
      const state = installWindow();
      const mobile = isMobileDevice();
      const relatedAndroidAppInstalled = await isRelatedAndroidAppInstalled();
      if (!active) return;

      const installed =
        isStandalone() ||
        state.__pipupathAppInstalled === true ||
        relatedAndroidAppInstalled;

      // Mobile uses the Android app rather than browser PWA installation. Drop
      // any deferred PWA prompt so an installed Android package never receives
      // another install or download offer.
      if (mobile) {
        state.__pipupathDeferredInstallPrompt = null;
      }

      setExperience({
        ready: true,
        installed,
        androidWebsite: !installed && isAndroidDevice(),
        desktopInstallable:
          !installed &&
          !mobile &&
          Boolean(state.__pipupathDeferredInstallPrompt),
      });
    };

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      const state = installWindow();

      if (isStandalone() || isMobileDevice()) {
        state.__pipupathDeferredInstallPrompt = null;
      } else {
        state.__pipupathDeferredInstallPrompt =
          event as BeforeInstallPromptEvent;
      }

      void syncInstallState();
    };

    const handleInstalled = () => {
      const state = installWindow();
      state.__pipupathDeferredInstallPrompt = null;
      state.__pipupathAppInstalled = true;
      void syncInstallState();
    };

    void syncInstallState();
    window.addEventListener(INSTALL_STATE_EVENT, syncInstallState);
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      active = false;
      window.removeEventListener(INSTALL_STATE_EVENT, syncInstallState);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    if (!experience.ready || experience.installed) return;

    if (experience.androidWebsite) {
      window.location.assign(ANDROID_APK_PATH);
      return;
    }

    if (!experience.desktopInstallable) return;

    const state = installWindow();
    const promptEvent = state.__pipupathDeferredInstallPrompt;
    if (!promptEvent) return;

    // beforeinstallprompt events are single-use. Remove it before opening the
    // native browser dialog so a stale event can never produce an instruction fallback.
    state.__pipupathDeferredInstallPrompt = null;
    publishInstallState();

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === "accepted") {
        state.__pipupathAppInstalled = true;
      } else {
        rememberNudgeDismissal();
      }
    } finally {
      publishInstallState();
    }
  }

  return { ...experience, install };
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
            : "Install PipuPath on this computer."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-blue-100/80">
          {downloadMode
            ? "Get the official lightweight Android app and keep your account, Mission and progress in sync."
            : "Use the browser's real app installer so PipuPath opens in its own desktop window."}
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
  const experience = useInstallExperience();
  const [showCoach, setShowCoach] = useState(false);
  const eligible = experience.androidWebsite || experience.desktopInstallable;

  useEffect(() => {
    if (!autoNudge || !experience.ready || !eligible) return;
    if (recentlyDismissedNudge()) return;

    const timer = window.setTimeout(() => setShowCoach(true), 2800);
    return () => window.clearTimeout(timer);
  }, [autoNudge, eligible, experience.ready]);

  if (!experience.ready || experience.installed || !eligible) return null;

  function closeCoach() {
    rememberNudgeDismissal();
    setShowCoach(false);
  }

  function runInstall() {
    setShowCoach(false);
    void experience.install();
  }

  const downloadMode = experience.androidWebsite;
  const showLabel = !compact || downloadMode;

  return (
    <>
      <button
        type="button"
        onClick={runInstall}
        aria-label={
          downloadMode ? "Download PipuPath Lite" : "Install PipuPath"
        }
        className={`pp-install-entry border-primary/30 bg-primary-soft/65 text-primary-light hover:bg-primary-soft touch-manipulation items-center justify-center gap-2 rounded-full border font-semibold shadow-sm transition-colors ${compact && !showLabel ? "inline-flex size-10 p-0" : "inline-flex min-h-10 px-3.5 text-sm"}`}
      >
        <InstallIcon />
        {showLabel ? (
          <span>{downloadMode ? "Download" : "Install"}</span>
        ) : null}
      </button>

      {showCoach ? (
        <InstallCoach
          onInstall={runInstall}
          onClose={closeCoach}
          downloadMode={downloadMode}
        />
      ) : null}
    </>
  );
}

export function InstallPwaCard() {
  const experience = useInstallExperience();
  const eligible = experience.androidWebsite || experience.desktopInstallable;

  if (!experience.ready || experience.installed || !eligible) return null;

  const downloadMode = experience.androidWebsite;

  return (
    <section className="pp-install-entry border-primary/25 bg-panel w-full rounded-[1.75rem] border p-5 shadow-[0_18px_46px_-34px_rgba(79,124,255,0.55)] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="bg-primary grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg shadow-blue-950/40">
          <InstallIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-primary-light text-xs font-semibold tracking-[0.12em] uppercase">
            {downloadMode ? "PipuPath for Android" : "PipuPath for desktop"}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            {downloadMode
              ? "Download the app to your phone."
              : "Install PipuPath on this computer."}
          </h2>
          <p className="text-muted mt-2 text-sm leading-6">
            {downloadMode
              ? "Download the official PipuPath Lite Android app. Your account and progress stay connected to the same PipuPath experience."
              : "Install the PWA through your browser's native app prompt and open PipuPath in its own desktop window."}
          </p>
          <div className="mt-4">
            <InstallPwaButton />
          </div>
        </div>
      </div>
    </section>
  );
}
