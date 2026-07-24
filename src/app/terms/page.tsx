import { PublicShell } from "@/components/shells/public-shell";

export default function TermsPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-semibold">Terms — staging draft</h1>
        <p className="text-muted mt-5 leading-7">
          These terms are an engineering-stage draft and require legal review
          before public launch. Staging accounts may be deleted during testing.
          PipuPath does not claim that later developmental capabilities exist.
        </p>
      </main>
    </PublicShell>
  );
}
