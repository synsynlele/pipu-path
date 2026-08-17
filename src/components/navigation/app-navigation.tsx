"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Home", href: "/app", icon: "home" },
  { label: "Journey", href: "/journey", icon: "path" },
  { label: "Build", href: "/build", icon: "build" },
  { label: "Portfolio", href: "/portfolio", icon: "portfolio" },
  { label: "Connect", href: "/connect", icon: "connect" },
  { label: "Profile", href: "/profile", icon: "profile" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  if (href === "/journey")
    return pathname.startsWith("/journey") || pathname.startsWith("/mission");
  if (href === "/build")
    return (
      pathname.startsWith("/build") ||
      pathname.startsWith("/quests") ||
      pathname.startsWith("/projects")
    );
  if (href === "/profile")
    return (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/onboarding/discovery/profile")
    );
  return pathname.startsWith(href);
}

export function AppNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={
        mobile ? "PipuPath mobile navigation" : "PipuPath application"
      }
      className={mobile ? "w-full" : ""}
    >
      <ul
        className={
          mobile
            ? "grid grid-cols-6"
            : "border-border flex items-center gap-1 rounded-2xl border bg-white/90 p-1 shadow-sm"
        }
      >
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  mobile
                    ? `flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.68rem] font-semibold transition-colors ${active ? "text-primary" : "text-muted"}`
                    : `inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors ${active ? "bg-primary-soft text-primary" : "text-muted hover:bg-soft hover:text-navy"}`
                }
              >
                <NavigationIcon name={item.icon} active={active} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavigationIcon({
  name,
  active,
}: {
  name: (typeof items)[number]["icon"];
  active: boolean;
}) {
  const className = `size-5 ${active ? "stroke-[2.2]" : "stroke-[1.8]"}`;
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "home")
    return (
      <svg {...common}>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  if (name === "path")
    return (
      <svg {...common}>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 18h2a4 4 0 0 0 4-4V10a4 4 0 0 1 4-4" />
      </svg>
    );
  if (name === "build")
    return (
      <svg {...common}>
        <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18v3h3l6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-3-3z" />
      </svg>
    );
  if (name === "portfolio")
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M8 6V4h8v2" />
        <path d="M3 11h18" />
      </svg>
    );
  if (name === "connect")
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M13 19a4.5 4.5 0 0 1 8.5-2" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
