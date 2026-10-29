import type { Metadata } from "next";
import Link from "next/link";
import { PowerDistrictFrame } from "@/modules/city/ui/power-district-frame";

export const metadata: Metadata = {
  title: "Play The Unbuilt City · PipuPath",
};

export default function PublicPlayPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0d2033] text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-sm font-bold">
          ← PipuPath
        </Link>
        <Link href="/login?next=/build/play" className="text-sm font-bold text-[#f2d489]">
          Sign in
        </Link>
      </header>
      <PowerDistrictFrame
        questHref="/signup"
        questLabel="Start my real Quest"
        initialFocus
      />
      <p className="px-4 py-5 text-center text-xs leading-5 text-[#cfdbeb]">
        Play freely. Save fictional city choices only if you choose to. Verified
        Quest progress requires a signed-in account and real-world action.
      </p>
    </main>
  );
}
