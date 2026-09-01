import type { ComponentProps } from "react";

export function Surface({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`border-border bg-panel rounded-3xl border shadow-[0_18px_60px_-34px_rgba(29,78,216,0.38)] ${className}`}
      {...props}
    />
  );
}
