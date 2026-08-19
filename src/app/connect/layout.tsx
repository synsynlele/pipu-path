import { AppShell } from "@/components/shells/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export default async function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedIdentity();

  return (
    <AppShell>
      <div>
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pt-5 sm:px-8 lg:px-10">
          <ButtonLink href="/connect" variant="ghost">
            Builder Network
          </ButtonLink>
          <ButtonLink href="/connect/collaborations" variant="ghost">
            Collaborations
          </ButtonLink>
        </div>
        {children}
      </div>
    </AppShell>
  );
}
