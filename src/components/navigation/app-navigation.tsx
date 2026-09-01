"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Home", href: "/app", icon: "home" },
  { label: "Discover", href: "/discover", icon: "discover" },
  { label: "Build", href: "/build", icon: "build" },
  { label: "Connect", href: "/connect", icon: "connect" },
  { label: "Profile", href: "/profile", icon: "profile" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  if (href === "/discover") {
    return (
      pathname.startsWith("/discover") ||
      pathname.startsWith("/mission") ||
      pathname.startsWith("/onboarding/discovery")
    );
  }
  if (href === "/build") {
    return (
      pathname.startsWith("/build") ||
      pathname.startsWith("/journey") ||
      pathname.startsWith("/quests") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/proof")
    );
  }
  if (href === "/connect") {
    return (
      pathname.startsWith("/connect") || pathname.startsWith("/opportunities")
    );
  }
  if (href === "/profile") {
    return (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/portfolio") ||
      pathname.startsWith("/growth") ||
      pathname.startsWith("/guide") ||
      pathname.startsWith("/passport")
    );
  }
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
            ? "grid grid-cols-5 px-1"
            : "border-border bg-panel/95 flex items-center gap-1 rounded-2xl border p-1 shadow-sm"
        }
      >
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const primaryBuild = mobile && item.href === "/build";

          return (
            <li key={item.href} className={mobile ? "min-w-0" : ""}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  mobile
                    ? primaryBuild
                      ? `relative -mt-3 flex min-h-[4.75rem] w-full touch-manipulation flex-col items-center justify-center gap-0.5 px-1 text-[0.68rem] font-semibold transition-colors ${active ? "text-primary-light" : "text-blue-100/80 active:text-white"}`
                      : `flex min-h-[4.25rem] w-full touch-manipulation flex-col items-center justify-center gap-1 px-1 text-[0.68rem] font-semibold transition-colors ${active ? "text-primary-light" : "text-blue-100/75 active:text-white"}`
                    : `inline-flex min-h-10 touch-manipulation items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors ${active ? "bg-primary-soft text-primary-light" : "hover:bg-primary-soft/70 text-blue-100/80 hover:text-white"}`
                }
              >
                {primaryBuild ? (
                  <span
                    aria-hidden="true"
                    className={`grid size-12 place-items-center rounded-full border shadow-[0_8px_26px_-10px_rgba(79,124,255,0.95)] ${active ? "border-primary-light bg-primary text-white" : "border-primary/50 bg-primary text-white"}`}
                  >
                    <NavigationIcon name={item.icon} active={active} />
                  </span>
                ) : (
                  <NavigationIcon name={item.icon} active={active} />
                )}
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

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "discover") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" />
      </svg>
    );
  }

  if (name === "build") {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "connect") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M13 19a4.5 4.5 0 0 1 8.5-2" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
