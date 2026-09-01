import { BrandMark } from "@/components/brand/brand-mark";
import { ContextBackLink } from "@/components/navigation/context-back-link";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { InstallPwaButton } from "@/components/pwa/install-prompt";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/identity/application/auth-actions";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <a
        href="#main-content"
        className="bg-primary fixed top-3 left-3 z-[70] -translate-y-20 rounded-xl px-4 py-2 font-semibold text-white shadow-lg focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="border-border bg-panel/90 sticky top-0 z-50 border-b backdrop-blur-2xl">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:min-h-18 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <ContextBackLink />
            <BrandMark href="/app" />
          </div>

          <div className="hidden lg:block">
            <AppNavigation />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <InstallPwaButton autoNudge />
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="min-h-10 px-2.5 whitespace-nowrap sm:px-3.5"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="min-w-0">{children}</div>

      <div className="border-border bg-panel/96 fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-16px_40px_-26px_rgba(79,124,255,0.7)] backdrop-blur-2xl lg:hidden">
        <AppNavigation mobile />
      </div>
    </div>
  );
}
