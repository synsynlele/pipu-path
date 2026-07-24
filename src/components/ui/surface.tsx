import type { ComponentProps } from "react";

export function Surface({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`border-border bg-panel rounded-3xl border shadow-2xl shadow-black/20 ${className}`}
      {...props}
    />
  );
}
