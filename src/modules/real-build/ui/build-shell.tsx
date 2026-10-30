import Link from "next/link";
import { BuildNavigation } from "./build-navigation";
import { SignOutForm } from "@/components/navigation/sign-out-form";
export function BuildShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pp-simple-build min-h-screen bg-[#f4f8fe] text-[#16335b]">
      <style>{`
 .pp-simple-build {color-scheme:light; --foreground:#16335b; --muted:#52647c; --border:#cddcf0; --panel:#fff; --panel-raised:#f4f8fe; --color-primary-700:#1d4ed8; --color-text:#16335b;}
 .pp-simple-build a {color:#1d4ed8; -webkit-text-fill-color:currentColor;}
 .pp-simple-build input,.pp-simple-build textarea,.pp-simple-build select {background:#fff;color:#16335b;border:1px solid #b9cce5;border-radius:12px;padding:12px;min-height:48px;width:100%;font-size:16px;}
 .pp-simple-build input[type=radio] {width:20px;min-height:20px;accent-color:#1d4ed8;}
 .pp-simple-build input[type=file] {font-size:14px;}
 .pp-simple-build button,.pp-simple-build .build-primary {min-height:48px;border-radius:12px;padding:12px 18px;font-weight:700;}
 .pp-simple-build .build-primary {background:#1d4ed8;color:white;-webkit-text-fill-color:white;display:inline-flex;align-items:center;justify-content:center;}
 .pp-simple-build .pp-button-ghost,.pp-simple-build .pp-button-ghost:hover {background:#fff;color:#1d4ed8;-webkit-text-fill-color:#1d4ed8;border-color:#b9cce5;}
 .pp-simple-build button:disabled {opacity:.55;cursor:wait;}
 .pp-simple-build :focus-visible {outline:3px solid #60a5fa;outline-offset:3px;}
 .pp-simple-build .build-card {border:1px solid #d7e3f3;background:white;border-radius:20px;padding:20px;}
 .pp-simple-build label {display:block;font-weight:600;font-size:14px;}
 .pp-simple-build p {overflow-wrap:anywhere;}
 `}</style>
      <header className="border-b border-[#d7e3f3] bg-white px-4 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 py-3">
          <Link href="/real-quests" className="text-xl font-extrabold">
            PipuPath
          </Link>
          <SignOutForm />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-6 pb-32">{children}</div>
      <BuildNavigation />
    </div>
  );
}
