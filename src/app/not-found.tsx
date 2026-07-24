import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="text-gold font-mono text-sm">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          This path does not exist.
        </h1>
        <p className="text-muted mt-3">
          Return to the current PipuPath foundation.
        </p>
        <ButtonLink href="/" className="mt-7">
          Go home
        </ButtonLink>
      </div>
    </main>
  );
}
