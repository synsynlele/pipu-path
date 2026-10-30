"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PipuNavIcon } from "./pipu-nav-icon";

const items = [
  { label: "Play", href: "/build/play", icon: "play" },
  { label: "Real Quests", href: "/real-quests", icon: "quests" },
  { label: "You", href: "/you", icon: "you" },
] as const;

function isActive(path: string, href: string) {
  if (href === "/build/play") {
    return (
      path === "/app" ||
      path === "/play" ||
      path.startsWith("/build/play") ||
      path.startsWith("/build/adventures") ||
      path.startsWith("/build/power-district")
    );
  }
  if (href === "/real-quests") {
    return (
      path.startsWith("/real-quests") ||
      path === "/build" ||
      path.startsWith("/quests") ||
      path.startsWith("/journey") ||
      path.startsWith("/mission") ||
      path.startsWith("/projects") ||
      path.startsWith("/proof")
    );
  }
  return (
    path.startsWith("/you") ||
    path.startsWith("/profile") ||
    path.startsWith("/discover") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/growth") ||
    path.startsWith("/guide") ||
    path.startsWith("/portfolio") ||
    path.startsWith("/passport") ||
    path.startsWith("/connect") ||
    path.startsWith("/opportunities") ||
    path.startsWith("/account-privacy")
  );
}

export function AppNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={
        mobile ? "PipuPath mobile navigation" : "PipuPath application"
      }
    >
      <ul
        className={
          mobile
            ? "grid grid-cols-3 gap-1 px-2"
            : "border-border bg-panel/95 flex items-center gap-1 rounded-2xl border p-1 shadow-sm"
        }
      >
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  mobile
                    ? `flex min-h-[4.5rem] w-full touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-semibold ${active ? "text-[#2059bd]" : "text-[#61718c]"}`
                    : `inline-flex min-h-10 touch-manipulation items-center gap-2 rounded-xl px-3.5 text-sm font-semibold ${active ? "bg-[#e8f1ff] text-[#2059bd]" : "hover:bg-[#f0f5ff] text-[#61718c]"}`
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    mobile
                      ? `grid size-9 place-items-center rounded-xl ${active ? "bg-[#e8f1ff] ring-1 ring-[#b9cef5]" : ""}`
                      : "grid size-6 place-items-center"
                  }
                >
                  <PipuNavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

