import { AppShell } from "@/components/shells/app-shell";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
