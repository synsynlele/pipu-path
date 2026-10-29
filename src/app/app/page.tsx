import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentPlatformAdminRole } from "@/modules/admin/infrastructure/admin-dal";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const metadata: Metadata = {
  title: "Your PipuPath",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [state, adminRole] = await Promise.all([
    requireAuthenticatedHomeState(),
    getCurrentPlatformAdminRole(),
  ]);
  const quest = state.quest?.status === "locked" ? null : state.quest;
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-6 pb-12 sm:px-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-[#131f3d] via-[#233b67] to-[#1b5e59] p-6 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold tracking-[0.18em] text-[#f1d184] uppercase">
          PipuPath · Your world begins here
        </p>
        <h1 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Build a better world, one decision at a time.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#e0edf2] sm:text-base">
          Enter The Unbuilt City. See what your ideas change. Then take what you
          learn into your community through a real-world Quest.
        </p>
        <Link href="/build/play" className="mt-7 inline-flex min-h-14 items-center justify-center rounded-full bg-[#e8cb7b] px-7 text-base font-bold text-[#18293d]">
          Play The Unbuilt City →
        </Link>
      </section>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link href="/real-quests" className="rounded-3xl border border-[#dae3ef] bg-white p-6 text-[#1a3052] shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[#6653c3] uppercase">Real Quests</p>
          <h2 className="mt-2 text-xl font-bold">{quest?.title ?? "Take an idea into real life"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#5e6b80]">
            {quest ? "Continue your real challenge, proof and reflection."
              : "Find your next genuine step. Your Journey determines which Quests are ready."}
          </p>
          <span className="mt-4 inline-block text-sm font-bold text-[#5436df]">Continue →</span>
        </Link>
        <Link href="/profile" className="rounded-3xl border border-[#dae3ef] bg-white p-6 text-[#1a3052] shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[#6653c3] uppercase">You</p>
          <h2 className="mt-2 text-xl font-bold">Your potential, your growth</h2>
          <p className="mt-2 text-sm leading-6 text-[#5e6b80]">
            Your identity, reflection, projects, collaboration and settings live here.
          </p>
          <span className="mt-4 inline-block text-sm font-bold text-[#5436df]">Open You →</span>
        </Link>
      </div>
      {adminRole ? <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#5436df]">Open Mission Control →</Link> : null}
      <p className="mt-6 text-center text-xs leading-5 text-[#67758a]">
        Playing is practice. Only real action, submitted evidence and reflection
        can advance verified Quests or award XP.
      </p>
    </main>
  );
}
