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
        version. You can now choose to generate a private, provisional Human
        Potential Profile from that evidence.
      </p>
      <Surface className="mt-10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Your choice, your profile</h2>
        <p className="text-muted mt-3 leading-7">
          Your profile will be provisional, private and evidence-linked. It will
          not assign a fixed identity, life purpose, permanent career, Journey
          or Mission.
        </p>
      </Surface>
      <ButtonLink href="/onboarding/discovery/profile" className="mt-8">
        Generate my profile
      </ButtonLink>
      <ButtonLink href="/app" variant="secondary" className="mt-4">
        Return to dashboard
      </ButtonLink>
    </main>
  );
}
