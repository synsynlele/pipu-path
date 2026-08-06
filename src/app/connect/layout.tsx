import { AppShell } from "@/components/shells/app-shell";

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
