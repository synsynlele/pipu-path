import type { Metadata } from "next";
import Link from "next/link";
import { getBuildHome } from "@/modules/real-build/infrastructure/dal";
export const metadata: Metadata = {
  title: "My work",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function MyWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const page = /^\d{1,5}$/.test(query.page ?? "") ? Number(query.page) : 0;
  const home = await getBuildHome(page);
  const attempts = [...(home.current ? [home.current] : []), ...home.history];
  return (
    <main id="main-content">
      <p className="text-xs font-bold tracking-widest text-[#1d4ed8] uppercase">
        You
      </p>
      <h1 className="mt-3 text-3xl font-extrabold">{home.name}’s work</h1>
      <p className="mt-3 text-sm leading-6 text-[#52647c]">
        Your attempts, evidence and lessons. Private by default.
      </p>
      <section className="mt-6 space-y-4" aria-label="Saved attempts">
        {attempts.length ? (
          attempts.map((a) => (
            <Link
              href={`/real-quests/${a.id}`}
              key={a.id}
              className="build-card block"
            >
              <span className="text-xs font-semibold text-[#52647c]">
                {a.status === "active"
                  ? "In progress"
                  : a.status === "recorded"
                    ? "Attempt recorded"
                    : "Set aside"}
              </span>
              <h2 className="mt-2 font-bold">{a.challenge.title}</h2>
              <span className="mt-2 block text-xs text-[#52647c]">
                {new Date(a.created_at).toLocaleDateString("en-GB", {
                  timeZone: "Africa/Lagos",
                })}
              </span>
            </Link>
          ))
        ) : (
          <div className="build-card">
            <p className="text-sm leading-6">
              Your first attempt starts with one small action. You do not need a
              perfect idea.
            </p>
            <Link href="/real-quests" className="build-primary mt-4">
              Get my first Quest →
            </Link>
          </div>
        )}
      </section>
      {home.history.length === 30 ? (
        <p className="mt-4 text-xs text-[#52647c]">
          Showing 30 previous attempts on this page.
        </p>
      ) : null}
      <div className="mt-4 flex justify-between text-sm font-bold">
        {page > 0 ? (
          <Link href={`/you?page=${page - 1}`} className="py-3">
            ← Newer attempts
          </Link>
        ) : (
          <span />
        )}
        {home.history.length === 30 ? (
          <Link href={`/you?page=${page + 1}`} className="py-3">
            Older attempts →
          </Link>
        ) : null}
      </div>
      <details className="build-card mt-6">
        <summary className="cursor-pointer font-bold">
          Earlier work and account
        </summary>
        <p className="mt-3 text-sm leading-6 text-[#52647c]">
          Work saved before the new Real Quests experience is preserved.
        </p>
        <div className="mt-3 flex flex-col gap-2 text-sm font-bold">
          <Link href="/profile" className="py-3">
            Previous profile and projects →
          </Link>
          <Link href="/quests" className="py-3">
            Previous Quests →
          </Link>
          <Link href="/account-privacy" className="py-3">
            Account and privacy →
          </Link>
        </div>
      </details>
    </main>
  );
}
