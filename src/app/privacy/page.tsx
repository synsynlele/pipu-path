import { PublicShell } from "@/components/shells/public-shell";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-semibold">Privacy — staging notice</h1>
        <p className="text-muted mt-5 leading-7">
          Stage 2 stores account identifiers, a preferred name, username, age
          band, preferences, consent history, and onboarding state. Private
          identity records are not public profiles. Formal privacy and
          safeguarding review is required before public youth use.
        </p>
      </main>
    </PublicShell>
  );
}
