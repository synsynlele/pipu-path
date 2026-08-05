import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { signOutAction } from "@/modules/identity/application/auth-actions";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <a
        href="#main-content"
        className="bg-primary fixed top-3 left-3 z-[70] -translate-y-20 rounded-xl px-4 py-2 font-semibold text-white shadow-lg focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="border-border bg-panel/92 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
          <BrandMark href="/app" />
          <div className="hidden lg:block">
            <AppNavigation />
          </div>
          <form action={signOutAction} className="hidden sm:block">
            <Button type="submit" variant="ghost" className="min-h-10 px-3.5">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <div className="min-w-0">{children}</div>

      <div className="border-border bg-panel/96 fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_35px_-24px_rgba(79,124,255,0.35)] backdrop-blur-xl lg:hidden">
        <AppNavigation mobile />
      </div>
    </div>
  );
}
