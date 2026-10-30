import { BuildShell } from "@/modules/real-build/ui/build-shell";
export default function RealQuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BuildShell>{children}</BuildShell>;
}
