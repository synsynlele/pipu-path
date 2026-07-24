import type { Metadata } from "next";
import { AppShell } from "@/components/shells/app-shell";

export const metadata: Metadata = {
  title: "Foundation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
