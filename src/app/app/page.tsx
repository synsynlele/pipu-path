import { ButtonLink } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { signOutAction } from "@/modules/identity/application/auth-actions";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export default async function FoundationPage() {
  const { profile } = await requireAuthenticatedIdentity();
  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Honest system state
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Your private identity is ready.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        Welcome, {profile.preferred_name}. Your account, consent history and
        identity checkpoint are persistent. Discovery can now collect your own
        evidence without inventing conclusions.
      </p>
      <Surface className="mt-10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Begin with Discovery</h2>
        <p className="text-muted mt-3 max-w-2xl leading-7">
          Answer one focused question at a time, save securely, return whenever
          you need and review everything before completion.
        </p>
        <ButtonLink href="/onboarding/discovery" className="mt-6">
          Open Discovery
        </ButtonLink>
      </Surface>
      <ButtonLink href="/" variant="secondary" className="mt-8">
        Return to the public foundation
      </ButtonLink>
      <form action={signOutAction} className="mt-4">
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </main>
  );
}
