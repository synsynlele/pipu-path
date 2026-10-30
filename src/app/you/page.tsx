import { BuildHero } from "@/modules/real-build/ui/build-hero";
import type { Metadata } from "next";
import Link from "next/link";
import { getBuildHome } from "@/modules/real-build/infrastructure/dal";
import { difficultyLabel } from "@/modules/real-build/domain/build";
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
      <BuildHero
        eyebrow="YOUR BUILDER WORKSHOP"
        title={`${home.name}’s work`}
        description="Your solutions, attempts and lessons. Small actions become useful work you can build on."
        art="lighthouse"
      />
      <div className="journey-body">
        <section className="mt-6 space-y-4" aria-label="Saved attempts">
          {attempts.length ? (
            attempts.map((a) => (
              <Link
                href={`/real-quests/${a.id}`}
                key={a.id}
                className="build-card block"
              >
                <span className="text-xs font-semibold text-[#77788e]">
                  Level {a.difficulty}/5 · {difficultyLabel(a.difficulty)} ·{" "}
                  {a.status === "active"
                    ? "In progress"
                    : a.status === "recorded"
                      ? "Attempt recorded"
                      : "Set aside"}
                </span>
                <h2 className="mt-2 font-bold">{a.challenge.title}</h2>
                <span className="mt-2 block text-xs text-[#77788e]">
                  {new Date(a.created_at).toLocaleDateString("en-GB", {
                    timeZone: "Africa/Lagos",
                  })}
                </span>
              </Link>
            ))
          ) : (
            <div className="build-card">
              <p className="text-sm leading-6">
                Your first attempt starts with one small action. You do not need
                a perfect idea.
              </p>
              <Link href="/real-quests" className="build-primary mt-4">
                Get my first Quest →
              </Link>
            </div>
          )}
        </section>
        {home.history.length === 30 ? (
          <p className="mt-4 text-xs text-[#77788e]">
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
        <section className="build-card mt-6">
          <h2 className="font-bold">Your account</h2>
          <Link
            href="/account-privacy"
            className="mt-2 inline-block py-3 text-sm font-bold"
          >
            Account and privacy →
          </Link>
        </section>
      </div>
    </main>
  );
}
