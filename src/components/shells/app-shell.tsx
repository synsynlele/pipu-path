import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

const navigation = [
  { label: "Home", href: "/app" },
  { label: "Discovery", href: "/onboarding/discovery" },
  { label: "Profile", href: "/onboarding/discovery/profile" },
  { label: "Mission", href: "/mission" },
  { label: "Journey", href: "/journey" },
  { label: "HQLS Quests", href: "/quests" },
] as const;

const futureNavigation = ["Projects", "Builders"] as const;

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <ul className={mobile ? "flex min-w-max gap-2 px-5 py-3" : "space-y-1"}>
      {navigation.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={
              mobile
                ? "border-border hover:border-gold/50 hover:bg-gold/5 inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors"
                : "hover:bg-gold/5 block rounded-xl px-3 py-2.5 text-sm transition-colors"
            }
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-border bg-panel border-b lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="flex h-20 items-center justify-between px-5 lg:px-7">
          <BrandMark />
          <span className="border-gold/30 bg-gold/5 text-gold rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase">
            Builder OS
          </span>
        </div>

        <nav aria-label="PipuPath application" className="hidden px-4 lg:block">
          <p className="text-muted px-3 py-4 font-mono text-[0.65rem] tracking-[0.16em] uppercase">
            Your path
          </p>
          <NavigationLinks />

          <p className="text-muted px-3 pt-8 pb-3 font-mono text-[0.65rem] tracking-[0.16em] uppercase">
            Later stages
          </p>
          <ul className="space-y-1">
            {futureNavigation.map((item) => (
              <li
                key={item}
                className="text-muted rounded-xl px-3 py-2.5 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>

        <nav
          aria-label="PipuPath mobile navigation"
          className="border-border overflow-x-auto border-t lg:hidden"
        >
          <NavigationLinks mobile />
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="border-border flex min-h-20 items-center border-b px-5 sm:px-8">
          <div>
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Discover · Build · Prove · Reflect
            </p>
            <p className="text-muted mt-1 text-sm">
              Progress appears only when real action leaves honest evidence.
            </p>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
