import type { Metadata } from "next";
import { AppShell } from "@/components/shells/app-shell";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export const metadata: Metadata = {
  title: "Foundation",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedIdentity();
  return <AppShell>{children}</AppShell>;
}
