"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CityCloudControls } from "./city-cloud-controls";

/** One mounted full-viewport 3D city. The player exits through explicit navigation. */
export function PowerDistrictFrame({
  questHref,
  questLabel,
  welcome = false,
  cloudEligible = false,
}: {
  questHref: string;
  questLabel: string;
  welcome?: boolean;
  cloudEligible?: boolean;
}) {
  const router = useRouter();
  const [entered, setEntered] = useState(!welcome);
  const [handoff, setHandoff] = useState(false);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [problem, setProblem] = useState("");
  const [backupSlot, setBackupSlot] = useState<HTMLElement | null>(null);
  const [puzzleFocused, setPuzzleFocused] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const syncControlsHeight = useCallback(() => {
    const height =
      entered && !puzzleFocused
        ? Math.min(
            160,
            Math.ceil(controlsRef.current?.getBoundingClientRect().height ?? 0),
          )
        : 0;
    controlsRef.current?.style.setProperty(
      "--overlay-controls-height",
      height + "px",
    );
    frameRef.current?.contentWindow?.postMessage(
      { type: "pipupath:city:chrome", height },
      window.location.origin,
    );
  }, [entered, puzzleFocused]);
  useEffect(() => {
    if (!entered)
      controlsRef.current
        ?.querySelectorAll("details[open]")
        .forEach((details) => details.removeAttribute("open"));
    syncControlsHeight();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncControlsHeight)
        : null;
    if (controlsRef.current) observer?.observe(controlsRef.current);
    window.addEventListener("resize", syncControlsHeight);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncControlsHeight);
    };
  }, [entered, cloudEligible, syncControlsHeight]);
  useEffect(() => {
    if (!entered)
      backupSlot
        ?.querySelectorAll("details[open]")
        .forEach((details) => details.removeAttribute("open"));
  }, [entered, backupSlot]);
  const saving = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const handoffButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!handoff) return;
    const dialog = dialogRef.current;
    const trigger = handoffButton.current;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    return () => {
      dialog.close?.();
      trigger?.focus();
    };
  }, [handoff]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow
      )
        return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "pipupath:city:state") {
        setSaved(data.saved === true);
        if (typeof data.entered === "boolean") setEntered(data.entered);
        if (typeof data.focusedPuzzle === "boolean")
          setPuzzleFocused(data.focusedPuzzle);
        if (
          typeof data.district === "string" &&
          /^[a-z-]{1,32}$/.test(data.district)
        )
          setDistrict(data.district);
        else if (data.district === null) setDistrict(null);
        if (
          typeof data.service === "string" &&
          /^(workshop-link|clinic-power|shared-services|backup-water|shared-recovery)$/.test(
            data.service,
          )
        )
          setService(data.service);
        else if (data.service === null) setService(null);
      }
      if (data.type === "pipupath:city:saved" && saving.current) {
        saving.current = false;
        if (data.ok === true) {
          setSaved(true);
          router.push(questHrefWithDistrict());
        } else {
          setProblem(
            "This browser could not save the city. You can remain here or leave without saving.",
          );
        }
      }
    };
    // Work with the game document only. Never accept untrusted cross-origin
    // messages as proof, Quest progress or an authenticated navigation target.
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  useEffect(() => {
    // Keep the viewport dedicated to the game on mobile and desktop.
    // Esc must not collapse the city or remount its iframe; navigation and
    // the Real Quest handoff remain available explicitly.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function questHrefWithDistrict() {
    if (!questHref.startsWith("/real-quests")) return questHref;
    const url = new URL(questHref, window.location.origin);
    if (district) url.searchParams.set("district", district);
    if (service) url.searchParams.set("service", service);
    return url.pathname + url.search;
  }

  function navigate() {
    setProblem("");
    setHandoff(true);
  }

  function saveAndContinue() {
    setProblem("");
    const target = frameRef.current?.contentWindow;
    if (!target) {
      setProblem(
        "The city has not finished loading. Try again or choose to leave without saving.",
      );
      return;
    }
    saving.current = true;
    target.postMessage({ type: "pipupath:city:save" }, window.location.origin);
  }

  function leaveWithoutSaving() {
    saving.current = false;
    router.push(questHrefWithDistrict());
  }

  return (
    <section
      aria-label="The Unbuilt City 3D city"
      className="unbuilt-city-frame fixed inset-0 z-[1000] flex flex-col bg-[#f4f6fd] text-[#142a52]"
    >
      <style>{`
        .city-overlay-controls {background:transparent;border:0;}
        .city-overlay-controls .city-overlay-action,.city-overlay-controls .city-cloud-controls>summary {background:transparent!important;color:#162b49!important;-webkit-text-fill-color:#162b49;text-shadow:0 0 3px #fff,0 1px 2px #fff,0 0 7px #fff;box-shadow:none;}
        @media(max-width:640px) {.city-overlay-controls .city-cloud-controls .city-cloud-panel {top:calc(var(--overlay-controls-height,72px) + 8px);}}
        .city-overlay-controls .city-overlay-action:focus-visible {outline:3px solid #6650cc;outline-offset:2px;}
      `}</style>
      <div
        ref={controlsRef}
        data-testid="city-overlay-controls"
        hidden={!entered || puzzleFocused}
        className={
          entered && !puzzleFocused
            ? "city-overlay-controls pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end bg-transparent px-2 pt-[max(4px,env(safe-area-inset-top))] pb-1"
            : "hidden"
        }
      >
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
          <button
            ref={handoffButton}
            type="button"
            onClick={navigate}
            className="city-overlay-action min-h-11 rounded-full border border-white/60 bg-transparent px-3 text-xs font-bold text-[#213449]"
          >
            {questLabel}
          </button>
        </div>
      </div>
      {cloudEligible && backupSlot
        ? createPortal(<CityCloudControls frameRef={frameRef} />, backupSlot)
        : null}
      {welcome && !entered ? (
        <a
          href="/login?next=%2Freal-quests"
          className="pp-city-welcome-signin absolute top-[max(22px,env(safe-area-inset-top))] right-[7vw] z-10 inline-flex min-h-11 items-center rounded-full border border-white/40 bg-[#0b2638] px-5 text-sm font-semibold text-white"
        >
          Sign in ↗
        </a>
      ) : null}
      <iframe
        ref={frameRef}
        title="The Unbuilt City · 14 connected districts"
        src="/games/city/index.html?embedded=1"
        onLoad={() => {
          setBackupSlot(
            frameRef.current?.contentDocument?.getElementById(
              "account-backup-slot",
            ) ?? null,
          );
          syncControlsHeight();
          frameRef.current?.contentWindow?.postMessage(
            { type: "pipupath:city:get-state" },
            window.location.origin,
          );
        }}
        className="min-h-0 w-full flex-1 border-0"
        allow="autoplay; fullscreen; screen-wake-lock"
        referrerPolicy="no-referrer"
      />
      {handoff ? (
        <dialog
          ref={dialogRef}
          aria-label="Continue to a real Quest"
          onCancel={() => {
            saving.current = false;
            setHandoff(false);
            setProblem("");
          }}
          className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-3xl border-0 bg-[#ffffff] p-0 backdrop:bg-[#08162d]/80"
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#ffffff] p-6 text-[#1e3150] shadow-2xl">
            <h2 className="text-xl font-bold">
              Take your learning into real life?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#65758b]">
              {saved
                ? "A device copy is enabled. Save your latest choices before continuing, or leave with the existing copy."
                : "Your city choices stay in this open game unless you save them on this device."}{" "}
              Saving is optional, private to this browser, and is not an account
              backup.
            </p>
            {problem ? (
              <p
                role="alert"
                className="mt-3 text-sm font-semibold text-[#9d433b]"
              >
                {problem}
              </p>
            ) : null}
            <div className="mt-5 grid gap-2">
              <button
                onClick={saveAndContinue}
                type="button"
                className="min-h-12 rounded-xl bg-[#284f40] px-4 font-bold text-white"
              >
                Save my city, then continue
              </button>
              <button
                onClick={leaveWithoutSaving}
                type="button"
                className="min-h-12 rounded-xl border border-[#b3c2d1] px-4 font-semibold"
              >
                Continue without saving
              </button>
              <button
                onClick={() => {
                  saving.current = false;
                  setHandoff(false);
                  setProblem("");
                }}
                type="button"
                className="min-h-12 rounded-xl px-4 font-bold text-[#5142a2]"
              >
                Stay in my city
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
