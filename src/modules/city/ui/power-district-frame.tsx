"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** One mounted 3D city. Focus mode never resets a player's open game. */
export function PowerDistrictFrame({
  questHref,
  questLabel,
  initialFocus = true,
  welcome = false,
}: {
  questHref: string;
  questLabel: string;
  initialFocus?: boolean;
  welcome?: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(initialFocus);
  const [entered, setEntered] = useState(!welcome);
  const [handoff, setHandoff] = useState(false);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [problem, setProblem] = useState("");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
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
        if (data.entered === true) setEntered(true);
        if (
          typeof data.district === "string" &&
          /^[a-z-]{1,32}$/.test(data.district)
        )
          setDistrict(data.district);
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
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (entered) closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !dialogRef.current?.open) {
        setExpanded(false);
        expandButton.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
    };
  }, [expanded, entered]);

  function questHrefWithDistrict() {
    if (!district || !questHref.startsWith("/real-quests")) return questHref;
    const url = new URL(questHref, window.location.origin);
    url.searchParams.set("district", district);
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
      className={
        expanded
          ? "unbuilt-city-frame fixed inset-0 z-[1000] flex flex-col bg-[#f4f6fd] text-[#142a52]"
          : "unbuilt-city-frame relative overflow-hidden rounded-2xl border border-[#d6deed] bg-[#f4f6fd] text-[#142a52]"
      }
    >
      <div
        hidden={!entered}
        className={
          entered
            ? "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#d6deed] px-3 py-2"
            : "hidden"
        }
      >
        <strong className="text-xs sm:text-sm">The Unbuilt City</strong>
        <div className="flex items-center gap-2">
          <button
            ref={handoffButton}
            type="button"
            onClick={navigate}
            className="min-h-11 rounded-full bg-[#e6cd83] px-3 text-xs font-bold text-[#213449]"
          >
            {questLabel}
          </button>
          {expanded ? (
            <button
              ref={closeButton}
              type="button"
              onClick={() => {
                setExpanded(false);
                expandButton.current?.focus();
              }}
              className="min-h-11 rounded-xl border border-[#bccbe4] px-3 text-xs font-bold"
            >
              Close focus view
            </button>
          ) : (
            <button
              ref={expandButton}
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={expanded}
              className="min-h-11 rounded-xl bg-[#243b78] px-3 text-xs font-bold text-white"
            >
              Focus on my city ↗
            </button>
          )}
        </div>
      </div>
      {welcome && !entered ? (
        <a
          href="/login?next=%2Freal-quests"
          className="absolute top-[max(22px,env(safe-area-inset-top))] right-[7vw] z-10 inline-flex min-h-11 items-center rounded-full border border-white/40 bg-[#0b2638] px-5 text-sm font-semibold text-white"
        >
          Sign in ↗
        </a>
      ) : null}
      <iframe
        ref={frameRef}
        title="The Unbuilt City · 14 connected districts"
        src="/games/city/index.html?embedded=1"
        onLoad={() =>
          frameRef.current?.contentWindow?.postMessage(
            { type: "pipupath:city:get-state" },
            window.location.origin,
          )
        }
        className={
          expanded
            ? "min-h-0 w-full flex-1 border-0"
            : "h-[min(860px,85svh)] min-h-[620px] w-full border-0"
        }
        allow="fullscreen"
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
