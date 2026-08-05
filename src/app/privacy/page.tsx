import type { Metadata } from "next";
import { PublicShell } from "@/components/shells/public-shell";
import { Surface } from "@/components/ui/surface";

export const metadata: Metadata = { title: "Privacy" };

const sections = [
  [
    "Private by default",
    "Identity, Discovery answers, Human Potential Profile, Mission, Journey, Quest evidence, reflections and Project updates are private account data. They do not become public automatically.",
  ],
  [
    "Selective public proof",
    "Eligible adults may intentionally publish only the Portfolio fields shown in the exact preview. They can withdraw that proof while retaining private Project history.",
  ],
  [
    "AI boundary",
    "Google Gemini supports private interpretation and planning. PipuPath validates its output and does not treat AI as the authority on a person's identity.",
  ],
  [
    "Youth safeguarding",
    "Young people retain the private Builder journey. Public Portfolio publishing remains unavailable until a dedicated guardian-consent and moderation process is approved.",
  ],
] as const;

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase">
          MVP privacy notice
        </p>
        <h1 className="text-navy mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Your developmental work remains yours.
        </h1>
        <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
          This notice describes the current MVP behavior. It is not a substitute
          for the formal legal, retention and child-safeguarding review required
          before broad public launch.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {sections.map(([title, text]) => (
            <Surface key={title} className="p-6">
              <h2 className="text-navy text-xl font-semibold">{title}</h2>
              <p className="text-muted mt-3 leading-7">{text}</p>
            </Surface>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
