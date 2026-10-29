"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Play", href: "/build/play", icon: "play" },
  { label: "Real Quests", href: "/real-quests", icon: "quest" },
  { label: "You", href: "/profile", icon: "you" },
] as const;

function isActive(path: string, href: string) {
  if (href === "/build/play") {
    return path === "/app" || path === "/play" || path.startsWith("/build/play") ||
      path.startsWith("/build/adventures") || path.startsWith("/build/power-district");
  }
  if (href === "/real-quests") {
    return path === "/real-quests" || path === "/build" ||
      path.startsWith("/quests") || path.startsWith("/journey") ||
      path.startsWith("/mission") || path.startsWith("/projects") ||
      path.startsWith("/proof");
  }
  return path.startsWith("/profile") || path.startsWith("/discover") ||
    path.startsWith("/onboarding") || path.startsWith("/growth") ||
    path.startsWith("/guide") || path.startsWith("/portfolio") ||
    path.startsWith("/passport") || path.startsWith("/connect") ||
    path.startsWith("/opportunities") || path.startsWith("/account-privacy");
}

export function AppNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label={mobile ? "PipuPath mobile navigation" : "PipuPath application"}>
      <ul className={mobile
        ? "grid grid-cols-3 gap-1 px-2"
        : "border-border bg-panel/95 flex items-center gap-1 rounded-2xl border p-1 shadow-sm"}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="min-w-0">
              <Link href={item.href} aria-current={active ? "page" : undefined}
                className={mobile
                  ? `flex min-h-[4.5rem] w-full touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-semibold ${active ? "text-[#5436df]" : "text-[#747b90]"}`
                  : `inline-flex min-h-10 touch-manipulation items-center gap-2 rounded-xl px-3.5 text-sm font-semibold ${active ? "bg-primary-soft text-primary" : "hover:bg-primary-soft/70 text-[#747b90]"}`}>
                <span aria-hidden="true" className={mobile
                  ? `grid size-9 place-items-center rounded-xl ${active ? "bg-[#eeeaff]" : ""}`
                  : "grid size-6 place-items-center"}>
                  <NavigationIcon name={item.icon} />
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

function NavigationIcon({ name }: { name: (typeof items)[number]["icon"] }) {
  const common = {
    className: "size-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (name === "play") return <svg {...common}><path d="m8 5 12 7-12 7z" /></svg>;
  if (name === "quest") return <svg {...common}><path d="M3 20h18M5 17l6-12 4 7 4-4 2 9" /><circle cx="11" cy="5" r="1" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}
