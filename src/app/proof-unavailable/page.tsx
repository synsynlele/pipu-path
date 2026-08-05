import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Project proof unavailable",
  robots: { index: false, follow: false },
};

export default function ProjectProofUnavailablePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div className="max-w-xl">
        <p className="text-gold font-mono text-sm">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          This Project proof is not public.
        </h1>
        <p className="text-muted mt-3 leading-7">
          The Builder may have withdrawn it, or the address may not exist.
          Private Project history remains protected.
        </p>
        <ButtonLink href="/" className="mt-7">
          Go home
        </ButtonLink>
      </div>
    </main>
  );
}
