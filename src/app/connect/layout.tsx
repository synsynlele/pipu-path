import { AppShell } from "@/components/shells/app-shell";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export default async function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await requireAuthenticatedIdentity();

  return (
    <AppShell>
      {identity.profile.is_minor ? (
        <p
          role="note"
          className="border-border bg-panel-raised mx-auto my-3 max-w-5xl rounded-xl border px-4 py-3 text-sm leading-6"
        >
          <strong>Stay safe while connecting.</strong> Do not share private
          contact details, passwords or your live location. People online may
          not be who they say they are. Report unsafe contact and tell a trusted
          adult. Your guardian can disable school networking.
        </p>
      ) : null}
      {children}
    </AppShell>
  );
}
