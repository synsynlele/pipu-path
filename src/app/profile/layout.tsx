import Link from "next/link";
import { AppShell } from "@/components/shells/app-shell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="border-border bg-panel/70 border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-3 text-sm sm:px-8">
          <span className="text-muted font-medium">Profile tools</span>
          <Link
            className="text-primary font-semibold underline-offset-4 hover:underline"
            href="/growth"
          >
            Growth Library
          </Link>
          <Link
            className="text-primary font-semibold underline-offset-4 hover:underline"
            href="/passport"
          >
            Builder Passport
          </Link>
        </div>
      </div>
      {children}
    </AppShell>
  );
}
