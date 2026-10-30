import { BrandMark } from "@/components/brand/brand-mark";
import { SignOutForm } from "@/components/navigation/sign-out-form";
import { BuildNavigation } from "./build-navigation";

export function BuildShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pp-simple-build min-h-svh bg-[linear-gradient(160deg,#f4f8ff_0%,#eff6ff_42%,#f7fafc_100%)] text-[#17375f]">
      <style>{`
 .pp-simple-build {color-scheme:light; --foreground:#17375f; --muted:#536883; --border:#d6e4f5; --panel:#fff; --panel-raised:#f4f8ff; --color-primary-700:#2059bd; --color-text:#17375f;}
 .pp-simple-build a:not(.pp-tab-link):not(.build-primary) {color:#2059bd; -webkit-text-fill-color:currentColor;}
 .pp-simple-build input,.pp-simple-build textarea,.pp-simple-build select {background:#fff;color:#17375f;border:1px solid #b8cde6;border-radius:12px;padding:12px;min-height:48px;width:100%;font-size:16px;}
 .pp-simple-build input[type=radio] {width:20px;min-height:20px;accent-color:#2059bd;}
 .pp-simple-build input[type=file] {font-size:14px;}
 .pp-simple-build button,.pp-simple-build .build-primary {min-height:48px;border-radius:12px;padding:12px 18px;font-weight:700;}
 .pp-simple-build .build-primary {background:#2059bd;color:white;-webkit-text-fill-color:white;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(32,89,189,.16);}
 .pp-simple-build .pp-button-ghost {background:#fff;color:#16488f;-webkit-text-fill-color:#16488f;border-color:#b8cde6;transition:background-color .15s ease;}
 .pp-simple-build .pp-button-ghost:hover {background:#eff6ff;color:#16488f;-webkit-text-fill-color:#16488f;border-color:#91b6e8;}
 .pp-simple-build button:disabled {opacity:.55;cursor:wait;}
 .pp-simple-build :focus-visible {outline:3px solid #60a5fa;outline-offset:3px;}
 .pp-simple-build .build-card {border:1px solid #d8e5f5;background:white;border-radius:20px;padding:20px;box-shadow:0 7px 24px rgba(22,53,96,.04);}
 .pp-simple-build label {display:block;font-weight:600;font-size:14px;}
 .pp-simple-build p {overflow-wrap:anywhere;}
 `}</style>
      <header className="sticky top-0 z-40 border-b border-[#dce7f6] bg-white/95 px-4 pt-[env(safe-area-inset-top)] shadow-[0_3px_18px_rgba(20,49,92,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 py-3">
          <BrandMark href="/build/play" className="min-w-0" />
          <SignOutForm />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-6 pb-36">{children}</div>
      <BuildNavigation />
    </div>
  );
}
