import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

const activeNavigation = [
  ["Home", "/app"],
  ["Discovery", "/onboarding/discovery"],
  ["Mission", "/mission"],
  ["Journey", "/journey"],
  ["Quests", "/quests"],
] as const;
const futureNavigation = ["Evidence Library", "Projects", "Builders"] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-border bg-panel border-b lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="flex h-20 items-center justify-between px-5 lg:px-7">
          <BrandMark />
          <span className="border-gold/30 text-gold rounded-full border px-2 py-1 font-mono text-[0.65rem] uppercase">Builder path</span>
        </div>
        <nav aria-label="Application areas" className="hidden px-4 lg:block">
          <p className="text-muted px-3 py-4 font-mono text-[0.65rem] tracking-[0.16em] uppercase">Your path</p>
          <ul className="space-y-1">
            {activeNavigation.map(([label, href]) => (
              <li key={href}><Link href={href} className="hover:bg-gold/5 hover:text-gold block rounded-xl px-3 py-2.5 text-sm transition-colors">{label}</Link></li>
            ))}
            {futureNavigation.map((item) => <li key={item} className="text-muted rounded-xl px-3 py-2.5 text-sm">{item} <span className="ml-1 text-[0.65rem] uppercase">Later</span></li>)}
          </ul>
        </nav>
      </aside>
      <div>
        <header className="border-border flex h-20 items-center border-b px-5 sm:px-8"><p className="text-muted text-sm">Discover. Choose direction. Build evidence. Reflect. Grow.</p></header>
        {children}
      </div>
    </div>
  );
}
