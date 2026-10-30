"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PipuNavIcon,
  type PipuNavIconName,
} from "@/components/navigation/pipu-nav-icon";

const tabs: { href: string; name: string; icon: PipuNavIconName }[] = [
  { href: "/build/play", name: "Play", icon: "play" },
  { href: "/real-quests", name: "Real Quests", icon: "quests" },
  { href: "/you", name: "You", icon: "you" },
];

export function BuildNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="PipuPath"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dbe5f6] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-9px_30px_rgba(20,49,92,0.07)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-3 gap-2 px-3 pt-2">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <li key={tab.href} className="min-w-0">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`pp-tab-link relative flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${active ? "text-[#16488f]" : "text-[#61718c] hover:bg-[#f0f5ff]"}`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-10 place-items-center rounded-2xl transition-colors ${active ? "bg-[#e8f1ff] text-[#1d55bb] ring-1 ring-[#b9cef5]" : "bg-[#f5f8fd] text-[#627996]"}`}
                >
                  <PipuNavIcon name={tab.icon} className="size-6" />
                </span>
                <span className="truncate">{tab.name}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 h-1 w-8 rounded-t-full bg-[#e5a73b]"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
