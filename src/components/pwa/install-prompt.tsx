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

type InstallInstructions = {
  title: string;
  steps: string[];
};

function instructionsForCurrentDevice(): InstallInstructions {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua);
  const android = /Android/.test(ua);

  if (ios) {
    return {
      title: "Install PipuPath on your iPhone",
      steps: [
        "Open the browser Share menu.",
        "Choose Add to Home Screen.",
        "Turn on Open as Web App if your iPhone shows that option, then tap Add.",
      ],
    };
  }

  if (android) {
    return {
      title: "Install PipuPath on your phone",
      steps: [
        "Open your browser menu (usually ⋮).",
        "Choose Install app or Add to Home screen.",
        "Confirm Install so PipuPath appears with your other apps.",
      ],
    };
  }

  return {
    title: "Install PipuPath",
    steps: [
      "Open your browser menu.",
      "Choose Install app, Add to Home Screen, or Create shortcut.",
      "Confirm so PipuPath opens in its own app window.",
    ],
  };
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

function InstallSheet({
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
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/35 p-3 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#eef0ff] text-[#5757e8]">
              <InstallIcon />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
                Add to your phone
              </p>
              <h2
                id="install-pipupath-title"
                className="mt-1 text-xl font-semibold text-[#18233d]"
              >
                {instructions.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install instructions"
            className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500"
          >
            ×
          </button>
        </div>

        <ol className="mt-5 space-y-3">
          {instructions.steps.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 text-sm leading-6 text-slate-600"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#5757e8] text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-5 rounded-2xl bg-[#f6f7ff] p-4 text-xs leading-5 text-slate-500">
          Once installed, PipuPath opens like an app and starts at your exact
          next step through Continue.
        </p>
      </div>
    </div>
  );
}

export function InstallPwaButton({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [instructions, setInstructions] = useState<InstallInstructions | null>(
    null,
  );

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setInstructions(null);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setInstalled(true);
      return;
    }

    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }

    setInstructions(instructionsForCurrentDevice());
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Install PipuPath"
        className={`pp-install-entry touch-manipulation items-center justify-center gap-2 rounded-full border border-[#dedff7] bg-white font-semibold text-[#5757e8] shadow-sm transition-colors hover:bg-[#f4f5ff] ${compact ? "size-10 p-0" : "min-h-10 px-3.5 text-sm"}`}
      >
        <InstallIcon />
        {compact ? null : <span>Install</span>}
      </button>

      {instructions ? (
        <InstallSheet
          instructions={instructions}
          onClose={() => setInstructions(null)}
        />
      ) : null}
    </>
  );
}

export function InstallPwaCard() {
  return (
    <section className="pp-install-entry w-full rounded-[1.75rem] border border-[#dedff7] bg-gradient-to-br from-[#f2f3ff] via-white to-[#fffaf0] p-5 shadow-[0_18px_46px_-34px_rgba(66,76,170,0.5)] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#5757e8] text-white shadow-lg shadow-indigo-200/70">
          <InstallIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#6f79f7] uppercase">
            Put PipuPath on your phone
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#18233d]">
            Come back to your next move in one tap.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Install the same PipuPath web app on your Home Screen. No app store
            is required.
          </p>
          <div className="mt-4">
            <InstallPwaButton />
          </div>
        </div>
      </div>
    </section>
  );
}
