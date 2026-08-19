import { AppShell } from "@/components/shells/app-shell";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export default async function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedIdentity();
  return <AppShell>{children}</AppShell>;
}
