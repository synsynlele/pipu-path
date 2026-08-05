import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12 text-center">
      <div className="max-w-xl">
        <p className="text-primary font-mono text-sm">404</p>
        <h1 className="text-navy mt-3 text-4xl font-semibold tracking-tight">
          This path is not available.
        </h1>
        <p className="text-muted mt-4 leading-7">
          The address may be incorrect, or this part of PipuPath may not be
          available for your current stage.
        </p>
        <ButtonLink href="/continue" className="mt-7">
          Continue Your Journey
        </ButtonLink>
      </div>
    </main>
  );
}
