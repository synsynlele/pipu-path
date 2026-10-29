import { AppShell } from "@/components/shells/app-shell";
export default function RealQuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
