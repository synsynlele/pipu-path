"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ParentNavigation = {
  href: string;
  label: string;
};

export function parentNavigationForPath(pathname: string): ParentNavigation | null {
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/profile/verification") {
    return { href: "/profile", label: "Profile" };
  }
  if (pathname === "/passport/preview") {
    return { href: "/passport", label: "Passport" };
  }
  if (pathname === "/mission/complete") {
    return { href: "/mission", label: "Mission" };
  }
  if (pathname === "/journey/complete") {
    return { href: "/journey", label: "Journey" };
  }
  if (pathname === "/onboarding/discovery/review") {
    return { href: "/onboarding/discovery", label: "Discovery" };
  }
  if (pathname === "/onboarding/discovery/profile/complete") {
    return {
      href: "/onboarding/discovery/profile",
      label: "Potential Profile",
    };
  }
  if (segments[0] === "onboarding" && segments[1] === "discovery" && segments.length === 3) {
    return { href: "/onboarding/discovery", label: "Discovery" };
  }

  if (segments[0] === "quests" && segments.length === 3 && segments[2] === "complete") {
    return { href: `/quests/${segments[1]}`, label: "Quest" };
  }
  if (segments[0] === "quests" && segments.length === 2) {
    return { href: "/quests", label: "Quest path" };
  }

  if (pathname === "/projects/new") {
    return { href: "/projects", label: "Projects" };
  }
  if (segments[0] === "projects" && segments.length === 2) {
    return { href: "/projects", label: "Projects" };
  }

  if (segments[0] === "portfolio" && segments.length === 3 && segments[2] === "preview") {
    return { href: `/portfolio/${segments[1]}`, label: "Portfolio Studio" };
  }
  if (segments[0] === "portfolio" && segments.length === 2) {
    return { href: "/portfolio", label: "Portfolio" };
  }

  if (segments[0] === "connect" && segments[1] === "builders" && segments.length >= 3) {
    return { href: "/connect", label: "Connect" };
  }
  if (segments[0] === "connect" && segments[1] === "collaborations" && segments.length === 3) {
    return { href: "/connect/collaborations", label: "Collaborations" };
  }
  if (pathname === "/connect/collaborations") {
    return { href: "/connect", label: "Connect" };
  }

  if (segments[0] === "opportunities" && segments.length === 3 && segments[2] === "apply") {
    return {
      href: `/opportunities/${segments[1]}`,
      label: "Opportunity",
    };
  }
  if (segments[0] === "opportunities" && segments.length === 2) {
    return { href: "/opportunities", label: "Opportunities" };
  }

  if (pathname === "/integrations/khpos") {
    return { href: "/profile", label: "Profile" };
  }

  return null;
}

export function ContextBackLink() {
  const pathname = usePathname();
  const parent = parentNavigationForPath(pathname);
  if (!parent) return null;

  return (
    <Link
      href={parent.href}
      aria-label={`Back to ${parent.label}`}
      className="border-border bg-background/70 text-muted hover:text-navy hover:border-primary/30 inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors"
    >
      <span aria-hidden="true">←</span>
      <span className="hidden sm:inline">{parent.label}</span>
      <span className="sm:hidden">Back</span>
    </Link>
  );
}
