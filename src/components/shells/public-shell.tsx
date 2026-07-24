import { BrandMark } from "@/components/brand/brand-mark";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="bg-gold fixed top-3 left-3 z-50 -translate-y-20 rounded-lg px-4 py-2 font-semibold text-[#100f0c] focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="border-border border-b">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <BrandMark />
          <p className="text-muted hidden font-mono text-xs tracking-[0.12em] uppercase sm:block">
            Building in public · Stage 1
          </p>
        </div>
      </header>
      {children}
      <footer className="border-border border-t">
        <div className="text-muted mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>Potential must become contribution.</p>
          <p>© {new Date().getFullYear()} PipuPath</p>
        </div>
      </footer>
    </div>
  );
}
