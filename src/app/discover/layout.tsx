import { AppShell } from "@/components/shells/app-shell";

export default function DiscoverLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
