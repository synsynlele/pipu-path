import type { Metadata } from "next";
import { PublicShell } from "@/components/shells/public-shell";
import { Surface } from "@/components/ui/surface";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase">
          MVP terms notice
        </p>
        <h1 className="text-navy mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Build honestly. Protect other people. Control what you publish.
        </h1>
        <Surface className="mt-9 p-6 sm:p-8">
          <div className="text-muted grid gap-6 leading-7">
            <p>
              PipuPath is a developmental product, not a clinical diagnosis,
              professional licence, employment promise or funding guarantee.
              Progress claims must reflect real action and truthful evidence.
            </p>
            <p>
              Do not upload or publish another person&apos;s private
              information, contact details, school identifiers, exact location
              or content you do not have permission to share. Public Portfolio
              fields are your deliberate responsibility.
            </p>
            <p>
              The current terms require formal legal and retention approval
              before broad public production launch. Authorised staging data may
              be reset during verification.
            </p>
          </div>
        </Surface>
      </main>
    </PublicShell>
  );
}
