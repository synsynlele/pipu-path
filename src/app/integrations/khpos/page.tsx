"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Membership = {
  cohortId: string;
  organisationName: string;
  joinedAt: string;
};

export default function KhposSchoolCohortPage() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const code = fragment.get("code");
    if (code) {
      sessionStorage.setItem("pipupath_khpos_join_code", code);
      window.history.replaceState(null, "", window.location.pathname);
    }

    void fetch("/api/integrations/khpos/cohort", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as {
          ok?: boolean;
          membership?: Membership | null;
          error?: string;
        };
        if (response.status === 401) {
          setAuthRequired(true);
          return;
        }
        if (!response.ok || !body.ok) {
          setError(body.error ?? "School cohort status could not be loaded.");
          return;
        }
        setMembership(body.membership ?? null);
      })
      .catch(() => setError("School cohort status could not be loaded."));
  }, []);

  async function join() {
    const joinToken = sessionStorage.getItem("pipupath_khpos_join_code") ?? "";
    if (!joinToken) {
      setError(
        "Open the original school invitation link again to join this cohort.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/integrations/khpos/cohort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinToken }),
      });
      const body = (await response.json()) as {
        ok?: boolean;
        membership?: { cohortId?: string; organisationName?: string };
        error?: string;
      };
      if (response.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (
        !response.ok ||
        !body.ok ||
        !body.membership?.cohortId ||
        !body.membership.organisationName
      ) {
        throw new Error(body.error ?? "School cohort could not be joined.");
      }
      sessionStorage.removeItem("pipupath_khpos_join_code");
      setMembership({
        cohortId: body.membership.cohortId,
        organisationName: body.membership.organisationName,
        joinedAt: new Date().toISOString(),
      });
      setNotice(
        "You joined the school development cohort. Only privacy-thresholded group patterns can be shared with KHP-OS.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "School cohort could not be joined.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/integrations/khpos/cohort", {
        method: "DELETE",
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok)
        throw new Error(
          body.error ?? "Cohort participation could not be withdrawn.",
        );
      setMembership(null);
      setNotice(
        "Your school-cohort participation has been withdrawn. Future institutional aggregates will no longer count your PipuPath activity.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Cohort participation could not be withdrawn.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2ea] px-5 py-10 text-slate-950 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase hover:text-slate-950"
        >
          ← Back to PipuPath
        </Link>
        <section className="mt-6 overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10">
            <p className="text-xs font-black tracking-[0.2em] text-amber-300 uppercase">
              PipuPath × KHP-OS
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              School Development Cohort
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Your school is inviting you to let your PipuPath journey
              contribute to anonymous institutional learning about
              human-potential development.
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-black text-emerald-950">
                  What may be shared
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  Only anonymous group totals such as how many cohort members
                  have active profiles, practised quests, completed Builder
                  Projects or continued into another Journey cycle.
                </p>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-black text-red-950">
                  What is never shared
                </p>
                <p className="mt-2 text-sm leading-6 text-red-900">
                  Your name, Human Potential Profile, mission, reflections,
                  contacts, network, quest evidence, project text and pathway
                  details stay private in PipuPath.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <strong>Small-cohort protection:</strong> detailed group signals
              are not released until at least five learners are actively
              participating. Below that threshold, KHP-OS receives zero detailed
              counts rather than the exact small number.
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                {notice}
              </div>
            )}

            {authRequired ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-black">Sign in to make this choice.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The invitation code is kept only in this browser tab while you
                  sign in.
                </p>
                <Link
                  href="/sign-in?next=%2Fintegrations%2Fkhpos"
                  className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
                >
                  Sign in to PipuPath
                </Link>
              </div>
            ) : membership ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black tracking-[0.16em] text-slate-500 uppercase">
                  Active school cohort
                </p>
                <p className="mt-1 text-xl font-black">
                  {membership.organisationName}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You can withdraw at any time. Withdrawal removes you from
                  future school-cohort aggregates; it does not delete your
                  private PipuPath work.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void withdraw()}
                  className="mt-4 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black disabled:opacity-50"
                >
                  {busy ? "Updating…" : "Withdraw cohort participation"}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-black">Joining is voluntary.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choosing “Join” allows only the privacy-safe group pattern
                  described above. It does not give your school access to your
                  PipuPath account.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void join()}
                  className="mt-4 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-50"
                >
                  {busy ? "Joining…" : "Join school development cohort"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
