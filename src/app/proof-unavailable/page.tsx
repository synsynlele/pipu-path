import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Project proof unavailable",
  robots: { index: false, follow: false },
};

export default function ProjectProofUnavailablePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12 text-center">
      <div className="max-w-xl">
        <p className="text-gold font-mono text-sm tracking-[0.16em] uppercase">
          Proof unavailable
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          This proof is not public right now.
        </h1>
        <p className="text-muted mt-3 leading-7">
          It may still be a private draft, it may have been withdrawn, or the
          address may no longer be valid. PipuPath keeps the Builder's private
          Project evidence protected.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/portfolio">Manage my Portfolio</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Return to PipuPath
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
