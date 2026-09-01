import { BrandMark } from "@/components/brand/brand-mark";
import { ContextBackLink } from "@/components/navigation/context-back-link";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { InstallPwaButton } from "@/components/pwa/install-prompt";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/identity/application/auth-actions";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pp-app-experience min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <a
        href="#main-content"
        className="bg-primary fixed top-3 left-3 z-[70] -translate-y-20 rounded-xl px-4 py-2 font-semibold text-white shadow-lg focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="pp-mobile-topbar sticky top-0 z-50 border-b border-white/10 text-white shadow-[0_12px_32px_-24px_rgba(30,25,95,0.85)] lg:hidden">
        <div className="mx-auto flex min-h-[4.65rem] max-w-3xl items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)]">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <ContextBackLink />
            <div className="flex min-w-0 items-center gap-1.5">
              <BrandMark compact inverse href="/app" className="shrink-0" />
              <span className="min-w-0 leading-none" aria-hidden="true">
                <span className="block text-[0.72rem] font-bold tracking-[0.02em] text-white">
                  PipuPath
                </span>
                <span className="mt-0.5 block max-w-[6.75rem] text-[0.5rem] leading-[1.12] font-medium tracking-[0.02em] text-blue-100 sm:max-w-none sm:whitespace-nowrap">
                  University for Human Potential
                </span>
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <InstallPwaButton compact autoNudge />
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                aria-label="Sign out"
                className="grid min-h-10 min-w-10 place-items-center rounded-full border border-white/10 bg-white/8 px-0 text-white hover:bg-white/14"
              >
                <span aria-hidden="true" className="text-base leading-none">
                  ↗
                </span>
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <header className="border-border bg-panel/92 sticky top-0 z-50 hidden border-b backdrop-blur-2xl lg:block">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-3 px-8">
          <div className="flex min-w-0 items-center gap-3">
            <ContextBackLink />
            <BrandMark href="/app" />
          </div>

          <AppNavigation />

          <div className="flex items-center gap-2">
            <InstallPwaButton autoNudge />
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" className="min-h-10 px-3.5">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="min-w-0">{children}</div>

      <div className="pp-bottom-navigation border-border fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] lg:hidden">
        <AppNavigation mobile />
      </div>
    </div>
  );
}
