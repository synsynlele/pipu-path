import { BrandMark } from "@/components/brand/brand-mark";

const futureNavigation = [
  "Journey",
  "Evidence",
  "Builders",
  "Projects",
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-border bg-panel border-b lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="flex h-20 items-center justify-between px-5 lg:px-7">
          <BrandMark />
          <span className="border-border text-muted rounded-full border px-2 py-1 font-mono text-[0.65rem] uppercase">
            Foundation
          </span>
        </div>
        <nav
          aria-label="Future application areas"
          className="hidden px-4 lg:block"
        >
          <p className="text-muted px-3 py-4 font-mono text-[0.65rem] tracking-[0.16em] uppercase">
            Product areas begin after Stage 1
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
      </aside>
      <div>
        <header className="border-border flex h-20 items-center border-b px-5 sm:px-8">
          <p className="text-muted text-sm">Application shell</p>
        </header>
        {children}
      </div>
    </div>
  );
}
