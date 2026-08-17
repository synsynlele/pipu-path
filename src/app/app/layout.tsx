import type { Metadata } from "next";
import { AppShell } from "@/components/shells/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export const metadata: Metadata = {
  title: "Home",
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
  return (
    <AppShell>
      {children}
      <aside className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <Surface className="border-gold/25 bg-gold/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
          <div className="max-w-3xl">
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              Opportunities
            </p>
            <h2 className="text-navy mt-2 text-2xl font-semibold">
              Test your development in the real world.
            </h2>
            <p className="text-muted mt-2 text-sm leading-6">
              Explore vetted competitions, scholarships, internships, grants,
              challenges and other opportunities with transparent eligibility
              and readiness checks.
            </p>
          </div>
          <ButtonLink
            href="/opportunities"
            variant="secondary"
            className="mt-5 sm:mt-0"
          >
            Explore opportunities
          </ButtonLink>
        </Surface>
      </aside>
    </AppShell>
  );
}
