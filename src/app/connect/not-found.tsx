import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

export default function ConnectNotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <Surface className="p-8 text-center">
        <h1 className="text-3xl font-semibold">
          This Builder is not available.
        </h1>
        <p className="text-muted mt-4 leading-7">
          They may have disabled discovery, blocked the connection or become
          ineligible for the directory.
        </p>
        <ButtonLink href="/connect" className="mt-6">
          Return to Connect
        </ButtonLink>
      </Surface>
    </main>
  );
}
