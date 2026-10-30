"use client";

import { useEffect, useState, type RefObject } from "react";

type Snapshot = {
  revision: number | null;
  state: Record<string, unknown> | null;
};

export function CityCloudControls({
  frameRef,
}: {
  frameRef: RefObject<HTMLIFrameElement | null>;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  async function read() {
    setBusy(true);
    try {
      const response = await fetch("/api/city-practice", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.ok)
        throw new Error(data.message || "Account backup unavailable.");
      setSnapshot({
        revision: data.revision ?? null,
        state: data.state ?? null,
      });
      setStatus(
        data.state
          ? "Private backup found. Choose which device copy to keep."
          : "No account backup yet. Device progress remains unchanged.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Backup unavailable.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow
      )
        return;
      if (event.data?.type === "pipupath:city:cloud-export") {
        const state = event.data.state;
        if (!state || typeof state !== "object") {
          setBusy(false);
          setStatus("The city could not prepare a safe backup.");
          return;
        }
        void (async () => {
          try {
            const response = await fetch("/api/city-practice", {
              method: "PUT",
              credentials: "same-origin",
              cache: "no-store",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                state,
                expectedRevision: snapshot?.revision ?? null,
              }),
            });
            const result = await response.json();
            if (!response.ok || !result.ok)
              throw new Error(result.message || "Account backup failed.");
            setSnapshot({
              revision: result.revision,
              state: state as Record<string, unknown>,
            });
            setStatus("Your city is now backed up to your private account.");
          } catch (error) {
            setStatus(
              error instanceof Error
                ? error.message
                : "Backup failed. Your device progress remains.",
            );
          } finally {
            setBusy(false);
          }
        })();
      }
      if (event.data?.type === "pipupath:city:cloud-imported") {
        setBusy(false);
        setStatus(
          event.data.ok
            ? "Account backup restored to this device. Resume your city."
            : "Restore failed. Your existing city is unchanged.",
        );
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [frameRef, snapshot?.revision]);

  function backUp() {
    if (busy) return;
    const child = frameRef.current?.contentWindow;
    if (!child) return setStatus("The city has not loaded.");
    setBusy(true);
    setStatus("Preparing your private backup…");
    child.postMessage(
      { type: "pipupath:city:cloud-export" },
      window.location.origin,
    );
  }
  function restore() {
    if (!snapshot?.state || busy) return;
    if (!window.confirm("Replace this device's city with your account backup?"))
      return;
    const child = frameRef.current?.contentWindow;
    if (!child) return setStatus("The city has not loaded.");
    setBusy(true);
    child.postMessage(
      { type: "pipupath:city:cloud-import", state: snapshot.state },
      window.location.origin,
    );
  }
  async function remove() {
    if (busy || !snapshot?.state) return;
    if (!window.confirm("Delete the account backup? Device copies remain."))
      return;
    setBusy(true);
    try {
      const response = await fetch("/api/city-practice", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error(result.message || "Could not delete your backup.");
      setSnapshot({ revision: null, state: null });
      setStatus("Account backup deleted; device city is unchanged.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="relative text-xs">
      <summary
        onClick={() => {
          if (!snapshot) void read();
        }}
        className="flex min-h-11 cursor-pointer items-center rounded-xl border border-[#bccbe4] bg-white px-3 font-bold text-[#142a52]"
      >
        ☁ Account backup
      </summary>
      <div className="absolute top-full right-0 z-40 mt-2 w-[min(320px,85vw)] space-y-3 rounded-2xl border border-[#b7c9e2] bg-white p-4 text-[#17375f] shadow-xl">
        <p className="font-bold">Private city backup</p>
        <p className="leading-5">
          Optional on signed-in accounts. Your fictional city is not XP or real Quest evidence.
        </p>
        <p role="status" className="leading-5">
          {busy ? "Working…" : status}
        </p>
        <div className="grid gap-2">
          <button type="button" disabled={busy || !snapshot} onClick={backUp}
            className="min-h-11 rounded-xl bg-[#244a8a] px-3 font-bold text-white disabled:opacity-60">
            Back up this city
          </button>
          <button type="button" disabled={busy || !snapshot?.state} onClick={restore}
            className="min-h-11 rounded-xl border border-[#bdcce2] px-3 font-bold disabled:opacity-60">
            Restore from account
          </button>
          <button type="button" disabled={busy} onClick={() => void read()}
            className="min-h-11 rounded-xl border border-[#bdcce2] px-3">
            Check latest backup
          </button>
          {snapshot?.state ? (
            <button type="button" disabled={busy} onClick={() => void remove()}
              className="min-h-11 px-3 text-[#a12540]">
              Delete account backup
            </button>
          ) : null}
        </div>
      </div>
    </details>
  );
}
