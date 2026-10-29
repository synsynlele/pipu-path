import type { Metadata } from "next";
import Link from "next/link";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const metadata: Metadata = {
  title: "Real Quests",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function RealQuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string }>;
}) {
  const [state, params] = await Promise.all([
    requireAuthenticatedHomeState(),
    searchParams,
  ]);
  const quest = state.quest?.status === "locked" ? null : state.quest;
  const destination = quest
    ? `/quests/${encodeURIComponent(quest.id)}`
    : state.journey?.status === "active"
      ? "/quests"
      : state.snapshot.hasHumanPotentialProfile
        ? state.mission?.status === "active"
          ? "/journey"
          : "/mission"
        : state.snapshot.discoveryStatus === "completed"
          ? "/onboarding/discovery/profile"
          : "/onboarding/discovery";
  const stage = quest
    ? quest.status === "evidence_submitted"
      ? "Reflect on your real attempt"
      : quest.status === "completed"
        ? "Review your completed Quest"
        : "Continue your current real Quest"
    : state.journey?.status === "active"
      ? "Open your next real-world challenge"
      : "Prepare for your first real Quest";
  const district =
    typeof params.district === "string" &&
    /^[a-z-]{1,32}$/.test(params.district)
      ? params.district
      : null;
  const ideas: Record<string, string> = {
    power:
      "Notice how people cope when power stops. Ask what would genuinely help.",
    market:
      "Observe how food or everyday goods reach people. Where do delays occur?",
    school:
      "Ask someone which part of learning is hardest, and listen before suggesting.",
    workshop:
      "Find someone who repairs or makes useful things. Learn what slows their work.",
    health:
      "Ask how people learn about available health services; do not give medical advice.",
    housing:
      "Notice which shared spaces or home features could work better for residents.",
    water:
      "Explore where reliable clean water matters, without testing unsafe water.",
    roads:
      "Observe safe pedestrian routes and obstacles in a familiar public space.",
  };
  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-4 py-7 pb-14 sm:px-8"
    >
      <section className="rounded-[2rem] bg-[#172a47] px-6 py-9 text-white sm:p-10">
        <p className="text-xs font-bold tracking-[0.16em] text-[#e9cd82] uppercase">
          PipuPath · Beyond the city
        </p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
          Real Quests
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#dfebf3]">
          The city lets you practise making decisions. A real Quest is where you
          try something useful, learn what happened, and bring back honest
          proof.
        </p>
      </section>
      {district && ideas[district] ? (
        <section className="mt-5 rounded-2xl border border-[#d6e8de] bg-[#f0f8f2] p-5 text-[#265343]">
          <p className="text-xs font-bold tracking-[0.12em] uppercase">
            An idea to explore
          </p>
          <p className="mt-2 text-sm leading-6">{ideas[district]}</p>
          <p className="mt-2 text-xs">
            This is inspiration, not an assigned or completed Quest.
          </p>
        </section>
      ) : null}
      <section className="mt-5 rounded-3xl border border-[#d9e1ed] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold tracking-widest text-[#5436df] uppercase">
          Your next genuine step
        </p>
        <h2 className="mt-3 text-2xl font-bold text-[#20324e]">
          {quest?.title ?? stage}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#62738b]">
          {quest
            ? "Your existing Quest belongs to your account and Journey. Continue it here; any proof and progress must come from real activity."
            : "Your next step follows your existing Discovery, Mission and Journey. The game does not create a Quest or unlock one on its own."}
        </p>
        <Link
          href={destination}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#5436df] px-6 font-bold text-white"
        >
          {stage} →
        </Link>
      </section>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/build/play"
          className="inline-flex min-h-11 items-center rounded-full border border-[#d6dfea] px-5 text-sm font-bold text-[#34425f]"
        >
          Return to the city
        </Link>
        <Link
          href="/profile"
          className="inline-flex min-h-11 items-center rounded-full border border-[#d6dfea] px-5 text-sm font-bold text-[#34425f]"
        >
          My potential and tools
        </Link>
      </div>
    </main>
  );
}
