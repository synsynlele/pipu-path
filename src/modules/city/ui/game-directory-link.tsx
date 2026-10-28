"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function GameDirectoryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    (href === "/build/play" && pathname === "/build/power-district") ||
    (href === "/build/adventures" &&
      (pathname?.startsWith("/build/play/") ||
        pathname === "/build/neighbourhood"));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 shrink-0 snap-start items-center rounded-xl border px-3 text-xs whitespace-nowrap text-white ${active ? "border-[#f1ce8e] bg-[#29434d] font-bold" : "border-white/30 bg-transparent"}`}
    >
      {active && (
        <span aria-hidden="true" className="mr-1.5 text-[#f1ce8e]">
          ●
        </span>
      )}
      {children}
    </Link>
  );
}
