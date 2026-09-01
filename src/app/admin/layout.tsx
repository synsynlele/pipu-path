import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

const adminDestinations = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/institutions", label: "Institutions" },
  { href: "/admin/opportunities", label: "Opportunities" },
  { href: "/admin/providers", label: "Providers" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#020817]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061027]/95 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark href="/admin" />
            <span className="hidden h-6 w-px bg-white/15 sm:block" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#e5c96f] uppercase">
                Mission Control
              </p>
              <p className="text-[0.68rem] text-blue-100/60">Operator mode</p>
            </div>
          </div>

          <Link
            href="/app"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-blue-100 transition-colors hover:bg-white/10 hover:text-white sm:text-sm"
          >
            Exit to PipuPath
          </Link>
        </div>

        <nav
          aria-label="PipuPath administration"
          className="mx-auto max-w-7xl overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8"
        >
          <div className="flex w-max gap-2">
            {adminDestinations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-10 touch-manipulation rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:border-[#4f7cff]/40 hover:bg-[#132b5c] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
