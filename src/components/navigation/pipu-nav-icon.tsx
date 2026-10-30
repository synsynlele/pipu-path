import type { SVGProps } from "react";

export type PipuNavIconName = "play" | "quests" | "you";

export function PipuNavIcon({
  name,
  className = "size-5",
}: {
  name: PipuNavIconName;
  className?: string;
}) {
  const props: SVGProps<SVGSVGElement> = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (name === "play")
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8 6 4-6 4V8Z" strokeLinejoin="round" />
      </svg>
    );
  if (name === "quests")
    return (
      <svg {...props}>
        <path d="M5 20V5m0 1c2.7-2 5.3 2 8 0s4.6-.8 6 0v9c-2.5-1.2-4.3-1.1-6 0-2.7 1.8-5.3-2-8 0" />
        <path d="m9 11 2 2 4-4" />
      </svg>
    );
  return (
    <svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.6-4 3-6 6.5-6s5.9 2 6.5 6" />
      <circle cx="12" cy="12" r="9" strokeDasharray="1 100" />
    </svg>
  );
}
