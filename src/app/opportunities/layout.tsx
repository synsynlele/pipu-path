import { AppShell } from "@/components/shells/app-shell";

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
