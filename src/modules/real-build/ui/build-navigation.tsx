"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  { href: "/build/play", name: "Play", icon: "▷" },
  { href: "/real-quests", name: "Real Quests", icon: "⚒" },
  { href: "/you", name: "You", icon: "○" },
];
export function BuildNavigation() {
  const path = usePathname();
  return (
    <nav
      aria-label="PipuPath"
      className="fixed inset-x-0 bottom-0 border-t border-[#cddcf0] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-2xl grid-cols-3 text-center text-sm font-bold">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={path.startsWith(i.href) ? "page" : undefined}
            className={`py-5 ${path.startsWith(i.href) ? "bg-[#eff6ff]" : ""}`}
          >
            <span aria-hidden="true">{i.icon} </span>
            {i.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
