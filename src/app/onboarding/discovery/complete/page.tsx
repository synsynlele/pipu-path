import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getStage4DiscoveryHandoff } from "@/modules/discovery/infrastructure/discovery-dal";

export const metadata: Metadata = {
  title: "Discovery complete",
  robots: { index: false, follow: false },
};

export default async function DiscoveryCompletePage() {
  const handoff = await getStage4DiscoveryHandoff();
  if (!handoff) redirect("/onboarding/discovery");
  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Discovery complete
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Your evidence is safely prepared.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        PipuPath has preserved your Discovery answers and their question-set
        version. The next stage can begin interpreting this evidence only when
        Stage 4 is implemented.
      </p>
      <Surface className="mt-10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Honest Stage 4 boundary</h2>
        <p className="text-muted mt-3 leading-7">
          No strengths, weaknesses, purpose, mission, career, Journey or Human
          Potential Profile has been generated.
        </p>
      </Surface>
      <ButtonLink href="/app" className="mt-8">
        Return to dashboard
      </ButtonLink>
    </main>
  );
}
