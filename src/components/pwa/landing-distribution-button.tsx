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

type DistributionMode = "hidden" | "android" | "desktop";

const ANDROID_APK_PATH = "/downloads/PipuPath-Lite-1.0.0.apk";
const INSTALL_STATE_EVENT = "pipupath:install-state";

function installWindow() {
  return window as PwaInstallWindow;
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

function isDesktopChromium() {
  if (typeof navigator === "undefined" || isMobileDevice()) return false;
  return /Chrome|Chromium|Edg/i.test(navigator.userAgent);
}

function publishInstallState() {
  window.dispatchEvent(new Event(INSTALL_STATE_EVENT));
}

export function LandingDistributionButton() {
  const [mode, setMode] = useState<DistributionMode>("hidden");
  const [nativeReady, setNativeReady] = useState(false);
  const [waitingForBrowser, setWaitingForBrowser] = useState(false);

  useEffect(() => {
    const sync = () => {
      const state = installWindow();
      const installed = isStandalone() || state.__pipupathAppInstalled === true;

      if (installed) {
        setMode("hidden");
        setNativeReady(false);
        setWaitingForBrowser(false);
        return;
      }

      if (isAndroidDevice()) {
        setMode("android");
        setNativeReady(false);
        return;
      }

      if (isDesktopChromium()) {
        setMode("desktop");
        setNativeReady(Boolean(state.__pipupathDeferredInstallPrompt));
        return;
      }

      setMode("hidden");
      setNativeReady(false);
    };

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      const state = installWindow();

      if (isMobileDevice() || isStandalone()) {
        state.__pipupathDeferredInstallPrompt = null;
      } else {
        state.__pipupathDeferredInstallPrompt =
          event as BeforeInstallPromptEvent;
      }

      setWaitingForBrowser(false);
      sync();
    };

    const handleInstalled = () => {
      const state = installWindow();
      state.__pipupathDeferredInstallPrompt = null;
      state.__pipupathAppInstalled = true;
      sync();
    };

    sync();
    window.addEventListener(INSTALL_STATE_EVENT, sync);
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(INSTALL_STATE_EVENT, sync);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (mode === "hidden") return null;

  async function runDistributionAction() {
    if (mode === "android") {
      window.location.assign(ANDROID_APK_PATH);
      return;
    }

    const state = installWindow();
    const promptEvent = state.__pipupathDeferredInstallPrompt;

    if (!promptEvent) {
      setWaitingForBrowser(true);
      return;
    }

    state.__pipupathDeferredInstallPrompt = null;
    setNativeReady(false);
    setWaitingForBrowser(false);
    publishInstallState();

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        state.__pipupathAppInstalled = true;
      }
    } finally {
      publishInstallState();
    }
  }

  const androidMode = mode === "android";
  let label = "Install";
  if (androidMode) {
    label = "Download";
  } else if (waitingForBrowser && !nativeReady) {
    label = "Install when ready";
  }

  const title =
    !androidMode && !nativeReady
      ? "Chrome or Edge will enable the native installer when PipuPath is ready to install."
      : undefined;

  return (
    <button
      type="button"
      onClick={() => void runDistributionAction()}
      aria-label={androidMode ? "Download PipuPath Lite" : "Install PipuPath"}
      title={title}
      className="border-primary/30 bg-primary-soft/65 text-primary-light hover:bg-primary-soft inline-flex min-h-10 touch-manipulation items-center justify-center gap-2 rounded-full border px-3.5 text-sm font-semibold shadow-sm transition-colors"
      style={{ flexShrink: 0, whiteSpace: "nowrap" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M12 3v11" />
        <path d="m7.5 10 4.5 4.5 4.5-4.5" />
        <path d="M5 20h14" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
