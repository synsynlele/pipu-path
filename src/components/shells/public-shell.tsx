import { BrandMark } from "@/components/brand/brand-mark";
import { InstallPwaButton } from "@/components/pwa/install-prompt";
import { ButtonLink } from "@/components/ui/button";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="bg-primary fixed top-3 left-3 z-50 -translate-y-20 rounded-xl px-4 py-2 font-semibold text-white shadow-lg focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="border-border bg-panel/90 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-8 lg:px-12">
          <BrandMark />
          <div className="flex items-center gap-1.5 sm:gap-3">
            <InstallPwaButton compact autoNudge />
            <ButtonLink
              href="/login"
              variant="ghost"
              className="px-2.5 sm:px-4"
            >
              Sign In
            </ButtonLink>
            <ButtonLink href="/signup" className="px-3 sm:px-5">
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Start Your Journey</span>
            </ButtonLink>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-border bg-panel border-t">
        <div className="text-muted mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div>
            <p className="text-navy font-semibold">
              Potential must become contribution.
            </p>
            <p className="mt-1">© {new Date().getFullYear()} PipuPath</p>
          </div>
          <div className="flex gap-5">
            <a href="/privacy" className="hover:text-primary-light">
              Privacy
            </a>
            <a href="/terms" className="hover:text-primary-light">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
